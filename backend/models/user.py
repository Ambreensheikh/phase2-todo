from sqlmodel import Field, SQLModel, Relationship
from typing import List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .task import Task
    from .conversation import Conversation
    from .message import Message

class User(SQLModel, table=True):
    __table_args__ = {'extend_existing': True}
    id: int | None = Field(default=None, primary_key=True)
    
    email: str = Field(unique=True, index=True)
    name: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    tasks: List["Task"] = Relationship(back_populates="user")
    conversations: List["Conversation"] = Relationship(back_populates="user")
    messages: List["Message"] = Relationship(back_populates="user")
