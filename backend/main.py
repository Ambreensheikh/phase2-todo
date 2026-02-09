from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from contextlib import asynccontextmanager
from sqlmodel import Session, select
import os
import sys

# Path Setup
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from db import create_db_and_tables, get_session
from api.v1 import chat, tasks
from models.user import User

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Connecting to NeonDB and Syncing All Phases...")
    try:
        create_db_and_tables()
        print("✅ All Tables (Users, Tasks, Chat) Ready!")
    except Exception as e:
        print(f"❌ Database Error: {e}")
    yield

app = FastAPI(lifespan=lifespan, title="TaskFlow AI - Integrated")

# --- CORS: Allowing Localhost 3000 and 3001 ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    
)

# --- PHASE 2: AUTH ROUTES (Signup & Login) ---

@app.post("/signup")
async def signup(user_data: User, session: Session = Depends(get_session)):
    # 1. Check if user already exists
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Frontend se password 'hashed_password' field mein hi aana chahiye
    # Agar frontend 'password' bhej raha hai to model mein bhi 'password' likhen.
    session.add(user_data)
    session.commit()
    session.refresh(user_data)
    return {"message": "User created successfully", "user": user_data.email}

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    # OAuth2 form_data.username mein email aati hai
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    
    # Check password (Aapka model hashed_password use kar raha hai)
    if not user or form_data.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
    
    # Dashboard redirect ke liye email as token bhej rahe hain
    return {"access_token": user.email, "token_type": "bearer"}

# --- PHASE 3: AGENTIC AI ROUTES ---
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])
# Change: prefix="/api/v1" -> "/api/v1/tasks"
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])

@app.get("/")
def read_root():
    return {"status": "Phase 1+2+3 Integrated & Running on NeonDB 🚀"}