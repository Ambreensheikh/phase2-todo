from sqlmodel import Field, SQLModel, Relationship
from typing import TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .user import User

class Task(SQLModel, table=True):
    __table_args__ = {'extend_existing': True}

    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id")
    title: str = Field(index=True)
    description: str | None = Field(default=None)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    user: "User" = Relationship(back_populates="tasks")
