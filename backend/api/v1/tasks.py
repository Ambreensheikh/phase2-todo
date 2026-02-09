from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session, select
from typing import List, Dict, Any, Optional

from db import get_session
# Agar mcp_tools mein masla hai, toh hum direct SQLModel use karenge jo zyada safe hai
from models.task import Task

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
def get_tasks_endpoint(
    *,
    session: Session = Depends(get_session),
    user_id: str = Query(..., description="User email/ID to fetch tasks for"),
    completed: Optional[bool] = Query(None, description="Filter tasks by completion status")
):
    try:
        # Direct SQLModel query (mcp_tools ke jhanjhat se pakka chutkara)
        statement = select(Task).where(Task.user_id == user_id)
        
        if completed is not None:
            statement = statement.where(Task.completed == completed)
            
        results = session.exec(statement).all()
        
        # Data ko dictionary format mein bhej rahe hain
        return [task.model_dump() for task in results]
    except Exception as e:
        print(f"❌ Error fetching tasks: {e}")
        return []

@router.delete("/{task_id}", response_model=Dict[str, Any])
def delete_task_endpoint(
    *,
    task_id: int,
    user_id: str = Query(..., description="User email/ID identifying owner"),
    session: Session = Depends(get_session)
):
    try:
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = session.exec(statement).first()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
            
        session.delete(task)
        session.commit()
        return {'success': True, 'message': f'Task {task_id} deleted successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))