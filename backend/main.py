from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from db import create_db_and_tables, engine
import models
from typing import List

app = FastAPI()

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "https://phase2-todo-git-main-ambreen-sheikhs-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

def get_session():
    with Session(engine) as session:
        yield session

# --- AUTHENTICATION (Login) ---
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(models.User).where(models.User.email == form_data.username)).first()
    # Check for 'hashed_password' as defined in your models.py
    if not user or form_data.password != user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"access_token": user.email, "token_type": "bearer"}

# --- TEST USER CREATION ---
@app.post("/create-test-user")
def create_test_user(session: Session = Depends(get_session)):
    existing_user = session.exec(select(models.User).where(models.User.email == "test@example.com")).first()
    if existing_user:
        return {"message": "User already exists"}
    
    # Matching your model fields: email, name, hashed_password
    new_user = models.User(email="test@example.com", name="Test User", hashed_password="password123")
    session.add(new_user)
    session.commit()
    return {"message": "Test user created!", "email": "test@example.com", "password": "password123"}

@app.post("/signup")
def signup(user: models.User, session: Session = Depends(get_session)):
    # Check karein ke email pehle se to nahi hai
    statement = select(models.User).where(models.User.email == user.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"message": "User created successfully", "user": user}

# --- TASK CRUD OPERATIONS (Updated to use 'Task' instead of 'Todo') ---
@app.get("/todos", response_model=List[models.Task])
def read_tasks(session: Session = Depends(get_session)):
    tasks = session.exec(select(models.Task)).all()
    return tasks

@app.post("/todos", response_model=models.Task)
def create_task(task: models.Task, session: Session = Depends(get_session)):
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.delete("/todos/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(models.Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
    return {"ok": True}

@app.get("/")
def read_root():
    return {"Hello": "Hackathon Task App is Live!"}