from sqlmodel import Field, SQLModel, Relationship
from typing import List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .user import User
    from .message import Message

class Conversation(SQLModel, table=True):
    __table_args__ = {'extend_existing': True}

    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    user: "User" = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation")
