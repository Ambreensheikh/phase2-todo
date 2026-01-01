import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from backend.db import create_db_and_tables, get_session
from backend.models.user import User
from backend.models.task import Task
from backend.models.conversation import Conversation
from backend.models.message import Message
from backend.api.v1.chat import router as chat_router # Import the new chat router

app = FastAPI()

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"Hello": "Todo AI Chatbot Backend is Live!"}

# Include the chat router
app.include_router(chat_router, prefix="/api/v1", tags=["Chat"])

# This will be used for testing, can be removed later
@app.post("/create-test-user")
def create_test_user(session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.email == "test@example.com")).first()
    if existing_user:
        return {"message": "Test user already exists"}

    new_user = User(email="test@example.com", name="Test User", hashed_password="password123")
    session.add(new_user)
    session.commit()
    return {"message": "Test user created!", "email": "test@example.com", "password": "password123"}