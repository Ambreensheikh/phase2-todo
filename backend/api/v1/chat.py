from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import os
import json
import traceback

from openai import AsyncOpenAI, AuthenticationError
from dotenv import load_dotenv

from backend.models.user import User
from backend.models.conversation import Conversation
from backend.models.message import Message
from backend.db import get_session
from backend import mcp_tools

# Load environment variables
load_dotenv(override=True)

# Add masked print statement to verify loaded API key
print(f'ACTUAL KEY LOADED: {os.getenv("OPENAI_API_KEY")[:10]}...')


router = APIRouter()


class ChatRequest(BaseModel):
    user_id: Optional[str] = None
    conversation_id: Optional[int] = None
    message: str


class ChatResponse(BaseModel):
    conversation_id: int
    response: str
    tool_calls: List[dict]


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, session: Session = Depends(get_session)):
    """
    Handles the entire chat conversation, including tool calls for task creation.
    """
    try:
        # --- 1. SETUP: API Client, User, Conversation ---
        client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        user_id_email = request.user_id or "guest@taskflow.ai"
        
        user = session.exec(select(User).where(User.email == user_id_email)).first()
        if not user:
            user = User(email=user_id_email, name="Guest User", hashed_password="")
            session.add(user)
            session.commit()
            session.refresh(user)

        conversation: Conversation
        if request.conversation_id:
            conversation = session.exec(select(Conversation).where(Conversation.id == request.conversation_id, Conversation.user_id == user.id)).first()
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found.")
        else:
            conversation = Conversation(user_id=user.id)
            session.add(conversation)
            session.commit()
            session.refresh(conversation)

        # --- 2. HISTORY: Save user message and build message list for API ---
        user_message = Message(conversation_id=conversation.id, user_id=user.id, role="user", content=request.message)
        session.add(user_message)
        session.commit()
        
        db_messages = session.exec(select(Message).where(Message.conversation_id == conversation.id).order_by(Message.created_at)).all()
        messages_for_api = [{"role": msg.role, "content": msg.content} for msg in db_messages if msg.content]

        # --- 3. TOOLS: Define tools for the model ---
        tools = [{
            "type": "function",
            "function": {
                "name": "create_task",
                "description": "Creates a new task in the user's to-do list.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "description": "The title of the task."},
                        "description": {"type": "string", "description": "The description of the task."},
                    },
                    "required": ["title"],
                },
            },
        }]

        # --- 4. API CALL (1st): Get initial model response ---
        response = await client.chat.completions.create(model="gpt-4-turbo-preview", messages=messages_for_api, tools=tools, tool_choice="auto")
        response_message = response.choices[0].message
        messages_for_api.append(response_message)  # Add response to history for next potential call

        # --- 5. TOOL EXECUTION: If model requests a tool, execute it ---
        if response_message.tool_calls:
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                function_to_call = getattr(mcp_tools, function_name)
                function_args = json.loads(tool_call.function.arguments)
                
                # Call the tool function (which adds to session but does not commit)
                tool_result_obj = function_to_call(session=session, user_id=user_id_email, **function_args)

                # Explicitly commit and refresh here in the endpoint, as requested
                session.commit()
                session.refresh(tool_result_obj)
                print(f'---> DATABASE SUCCESS: Task "{tool_result_obj.title}" saved with ID {tool_result_obj.id}')
                
                # Append the result for the second API call
                messages_for_api.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": json.dumps(tool_result_obj.model_dump(mode='json')),
                })

            # --- 6. API CALL (2nd): Send tool result back to get final response ---
            second_response = await client.chat.completions.create(model="gpt-4-turbo-preview", messages=messages_for_api)
            final_content = second_response.choices[0].message.content
        else:
            final_content = response_message.content

        # --- 7. SAVE & RETURN: Save final assistant message and return to user ---
        assistant_message = Message(conversation_id=conversation.id, user_id=user.id, role="assistant", content=final_content)
        session.add(assistant_message)
        session.commit()

        return ChatResponse(conversation_id=conversation.id, response=final_content, tool_calls=[])

    except Exception as e:
        print(f"--- CRITICAL ERROR IN /chat ENDPOINT ---")
        print(traceback.format_exc())
        print(f"------------------------------------")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

