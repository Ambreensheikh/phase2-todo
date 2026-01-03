from sqlmodel import Session, select
from typing import List, Optional, Dict, Any

from backend.models.task import Task
from backend.models.user import User


def create_task(session: Session, user_id: str, title: str, description: Optional[str] = None) -> Task:
    """
    Adds a new task to the session for a given user.
    """
    user = session.exec(select(User).where(User.email == user_id)).first()
    if not user:
        raise ValueError("User not found")

    new_task = Task(
        user_id=user.id,
        title=title,
        description=description
    )
    session.add(new_task)
    return new_task

def get_task(session: Session, task_id: int, user_id: str) -> Optional[Task]:
    """
    Retrieves a specific task by its ID for a given user.
    """
    user = session.exec(select(User).where(User.email == user_id)).first()
    if not user:
        raise ValueError("User not found")

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user.id)
    ).first()
    return task

def list_tasks(session: Session, user_id: str, completed: Optional[bool] = None) -> List[Task]:
    """
    Lists all tasks for a given user, with an option to filter by completion status.
    """
    user = session.exec(select(User).where(User.email == user_id)).first()
    if not user:
        raise ValueError("User not found")

    query = select(Task).where(Task.user_id == user.id)
    if completed is not None:
        query = query.where(Task.completed == completed)
    
    tasks = session.exec(query).all()
    return tasks

def update_task(session: Session, task_id: int, user_id: str, title: Optional[str] = None, description: Optional[str] = None, completed: Optional[bool] = None) -> Optional[Task]:
    """
    Updates a task's details in the session.
    """
    user = session.exec(select(User).where(User.email == user_id)).first()
    if not user:
        raise ValueError("User not found")

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user.id)
    ).first()

    if not task:
        return None

    if title is not None:
        task.title = title
    if description is not None:
        task.description = description
    if completed is not None:
        task.completed = completed
    
    session.add(task)
    return task

def delete_task(session: Session, task_id: int, user_id: str) -> bool:
    """
    Deletes a task by its ID from the session. Returns True on success.
    """
    user = session.exec(select(User).where(User.email == user_id)).first()
    if not user:
        raise ValueError("User not found")

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user.id)
    ).first()

    if not task:
        return False
    
    session.delete(task)
    return True
