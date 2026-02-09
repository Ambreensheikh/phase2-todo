import os
from sqlmodel import create_engine, SQLModel, Session
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Neon requires SSL
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True, 
    pool_recycle=300, 
    connect_args={"sslmode": "require"}
)

# CRITICAL: Import all models BEFORE SQLModel.metadata.create_all
from models.user import User
from models.task import Task
from models.conversation import Conversation
from models.message import Message

def create_db_and_tables():
    print("🛠️ DB Sync Start...")
    # This will create tables in Neon if they don't exist
    SQLModel.metadata.create_all(engine)
    print("✅ DB Sync End.")

def get_session():
    with Session(engine) as session:
        yield session