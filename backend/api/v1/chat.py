from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import json
import os
import traceback
import google.generativeai as genai
from openai import AsyncOpenAI

from models.user import User
from models.conversation import Conversation
from models.message import Message
from models.task import Task 
from db import get_session

router = APIRouter()

# --- Pydantic Models ---
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    conversation_id: Optional[int] = None

class ChatResponse(BaseModel):
    conversation_id: int
    response: str
    tool_calls: Optional[List[Dict[str, Any]]] = None

# --- AI Clients Setup ---

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
print(f"DEBUG: My Gemini Key is: {os.environ.get('GEMINI_API_KEY')}")
openai_client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

gemini_model = genai.GenerativeModel('gemini-1.5-flash')

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, session: Session = Depends(get_session)):
    try:
        # 1. USER & CONVERSATION SETUP
        user_email = request.user_id or "guest@taskflow.ai"
        user = session.exec(select(User).where(User.email == user_email)).first()
        if not user:
            user = User(email=user_email, name="Agent User", password="no-password")
            session.add(user)
            session.commit()
            session.refresh(user)

        if request.conversation_id:
            conversation = session.exec(select(Conversation).where(Conversation.id == request.conversation_id)).first()
        else:
            conversation = Conversation(user_id=user.id)
            session.add(conversation)
            session.commit()
            session.refresh(conversation)

        # 2. TASK AUTOMATION CHECK (Keyword Detection)
        user_input = request.message.lower()
        tool_calls_data = []
        final_response = ""

        if any(word in user_input for word in ["add", "create", "todo"]):
            task_title = request.message.replace("add", "").replace("create", "").replace("task", "").strip()
            new_task = Task(title=task_title or "New Mission", user_id=user_email, completed=False)
            session.add(new_task)
            session.commit()
            tool_calls_data.append({"name": "add_task", "arguments": {"task_description": task_title}})
            final_response = f"✅ Mission Logged: '{task_title}' has been added to your dashboard."
        
        # 3. AI GENERATION (With Failover)
        else:
            try:
                # Pehle OpenAI Try Karein
                print("🤖 Attempting OpenAI...")
                oa_res = await openai_client.chat.completions.create(
                    model="gpt-4o-mini", # Ya "gpt-3.5-turbo"
                    messages=[{"role": "user", "content": request.message}],
                    timeout=10.0 # Agar 10 sec mein jawab na aaye to skip
                )
                final_response = oa_res.choices[0].message.content
                print("✅ OpenAI Success!")
            except Exception as e:
                # Agar OpenAI Fail ho jaye, to Gemini Try Karein
                print(f"⚠️ OpenAI Failed: {e}. Switching to Gemini...")
                try:
                    gem_res = gemini_model.generate_content(request.message)
                    final_response = gem_res.text
                    print("✅ Gemini Failover Success!")
                except Exception as ge:
                    print(f"❌ Both APIs Failed: {ge}")
                    final_response = "I'm having trouble connecting to my brain (APIs). Please check your internet or API keys."

        # 4. SAVE HISTORY & RETURN
        user_msg = Message(conversation_id=conversation.id, user_id=user.id, role="user", content=request.message)
        assistant_msg = Message(conversation_id=conversation.id, user_id=user.id, role="assistant", content=final_response)
        session.add(user_msg)
        session.add(assistant_msg)
        session.commit()

        return ChatResponse(conversation_id=conversation.id, response=final_response, tool_calls=tool_calls_data)

    except Exception as e:
        print(f"❌ CRITICAL ERROR: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="System totally offline.")