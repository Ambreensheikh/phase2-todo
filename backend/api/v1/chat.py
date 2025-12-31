from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

from backend.models.user import User
from backend.models.conversation import Conversation
from backend.models.message import Message
from backend.db import get_session
from backend import mcp_tools

# Load environment variables
load_dotenv()

# Configure the OpenAI client
client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

router = APIRouter()


class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str


class ChatResponse(BaseModel):
    conversation_id: int
    response: str
    tool_calls: List[dict]


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(user_id: str, request: ChatRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    conversation: Conversation
    if request.conversation_id:
        conversation = session.exec(
            select(Conversation).where(
                Conversation.id == request.conversation_id, Conversation.user_id == user.id
            )
        ).first()
        if not conversation:
            raise HTTPException(
                status_code=404, detail="Conversation not found for this user."
            )
    else:
        conversation = Conversation(user_id=user.id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

    user_message = Message(
        conversation_id=conversation.id,
        user_id=user.id,
        role="user",
        content=request.message,
    )
    session.add(user_message)
    session.commit()
    session.refresh(user_message)

    messages_history = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
    ).all()

    formatted_messages = [
        {"role": msg.role, "content": msg.content} for msg in messages_history
    ]

    tools = [
        {
            "type": "function",
            "function": {
                "name": "create_task",
                "description": "Creates a new task in the database for a given user.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "The title of the task.",
                        },
                        "description": {
                            "type": "string",
                            "description": "The description of the task.",
                        },
                    },
                    "required": ["title"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_task",
                "description": "Retrieves a specific task by its ID for a given user.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "integer",
                            "description": "The ID of the task to retrieve.",
                        }
                    },
                    "required": ["task_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "list_tasks",
                "description": "Lists all tasks for a given user, with an option to filter by completion status.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "completed": {
                            "type": "boolean",
                            "description": "Filter by completion status.",
                        }
                    },
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "update_task",
                "description": "Updates a task's details.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "integer",
                            "description": "The ID of the task to update.",
                        },
                        "title": {
                            "type": "string",
                            "description": "The new title of the task.",
                        },
                        "description": {
                            "type": "string",
                            "description": "The new description of the task.",
                        },
                        "completed": {
                            "type": "boolean",
                            "description": "The new completion status of the task.",
                        },
                    },
                    "required": ["task_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "delete_task",
                "description": "Deletes a task by its ID for a given user.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "integer",
                            "description": "The ID of the task to delete.",
                        }
                    },
                    "required": ["task_id"],
                },
            },
        },
    ]

    response = await client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=formatted_messages,
        tools=tools,
        tool_choice="auto",
    )

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls or []

    assistant_message_content = response_message.content or ""

    assistant_message = Message(
        conversation_id=conversation.id,
        user_id=user.id,
        role="assistant",
        content=assistant_message_content,
    )
    session.add(assistant_message)
    session.commit()
    session.refresh(assistant_message)

    return ChatResponse(
        conversation_id=conversation.id,
        response=assistant_message_content,
        tool_calls=[
            {
                "id": tool_call.id,
                "type": tool_call.type,
                "function": {
                    "name": tool_call.function.name,
                    "arguments": tool_call.function.arguments,
                },
            }
            for tool_call in tool_calls
        ],
    )

