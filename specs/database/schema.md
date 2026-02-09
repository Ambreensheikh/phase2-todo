from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

# 1. USER MODEL (Better Auth compatible)
class User(SQLModel, table=True):
    id: str = Field(primary_key=True) # String ID for Better Auth
    email: str = Field(unique=True, index=True)
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship: Ek user ki bohot saari tasks ho sakti hain
    tasks: List["Task"] = Relationship(back_populates="user")

# 2. TASK MODEL
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: Optional[str] = None
    completed: bool = Field(default=False, index=True) # Index for filtering
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Foreign Key
    user_id: str = Field(foreign_key="user.id", index=True)
    
    # Relationship back to User
    user: Optional[User] = Relationship(back_populates="tasks")