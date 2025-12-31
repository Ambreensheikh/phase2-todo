from sqlmodel import Field, SQLModel, Relationship
from typing import TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .user import User
    from .conversation import Conversation

class Message(SQLModel, table=True):
    __table_args__ = {'extend_existing': True}

    id: int | None = Field(default=None, primary_key=True)
    conversation_id: int | None = Field(default=None, foreign_key="conversation.id")
    user_id: int | None = Field(default=None, foreign_key="user.id")
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    user: "User" = Relationship(back_populates="messages")
    conversation: "Conversation" = Relationship(back_populates="messages")
