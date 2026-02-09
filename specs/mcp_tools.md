from sqlmodel import Session, select
from backend.models.user import User
from backend.models.task import Task
from fastapi import HTTPException

def get_user_by_email(session: Session, email: str):
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {email} not found")
    return user

# 1. ADD TASK
def create_task(session: Session, user_id: str, title: str, description: str = None):
    user = get_user_by_email(session, user_id)
    new_task = Task(title=title, description=description, user_id=user.id)
    session.add(new_task)
    # Note: Commit chat.py mein endpoint handle kar raha hai
    return new_task

# 2. LIST TASKS
def list_tasks(session: Session, user_id: str, status: str = "all"):
    user = get_user_by_email(session, user_id)
    statement = select(Task).where(Task.user_id == user.id)
    
    if status == "pending":
        statement = statement.where(Task.completed == False)
    elif status == "completed":
        statement = statement.where(Task.completed == True)
        
    return session.exec(statement).all()

# 3. COMPLETE TASK
def complete_task(session: Session, user_id: str, task_id: int):
    user = get_user_by_email(session, user_id)
    task = session.exec(select(Task).where(Task.id == task_id, Task.user_id == user.id)).first()
    
    if task:
        task.completed = True
        session.add(task)
        return {"task_id": task.id, "status": "completed", "title": task.title}
    return {"error": "Task not found"}

# 4. DELETE TASK
def delete_task(session: Session, user_id: str, task_id: int):
    user = get_user_by_email(session, user_id)
    task = session.exec(select(Task).where(Task.id == task_id, Task.user_id == user.id)).first()
    
    if task:
        title = task.title
        session.delete(task)
        return {"task_id": task_id, "status": "deleted", "title": title}
    return {"error": "Task not found"}

# 5. UPDATE TASK
def update_task(session: Session, user_id: str, task_id: int, title: str = None, description: str = None):
    user = get_user_by_email(session, user_id)
    task = session.exec(select(Task).where(Task.id == task_id, Task.user_id == user.id)).first()
    
    if task:
        if title: task.title = title
        if description: task.description = description
        session.add(task)
        return {"task_id": task.id, "status": "updated", "title": task.title}
    return {"error": "Task not found"}