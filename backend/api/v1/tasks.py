from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import List, Optional, Dict, Any

from backend.db import get_session
from backend import mcp_tools
from backend.models.task import Task

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
def get_tasks_endpoint(
    *,
    session: Session = Depends(get_session),
    completed: Optional[bool] = Query(None, description="Filter tasks by completion status")
):
    """
    Get all tasks from the database, ignoring user_id.
    """
    query = select(Task)
    if completed is not None:
        query = query.where(Task.completed == completed)
    tasks = session.exec(query).all()
    return [task.model_dump() for task in tasks]

@router.delete("/{task_id}", response_model=Dict[str, Any])
def delete_task_endpoint(
    *,
    task_id: int,
    session: Session = Depends(get_session)
):
    """
    Delete a task by its ID.
    """
    user_id = "guest@taskflow.ai"
    deleted = mcp_tools.delete_task(session=session, task_id=task_id, user_id=user_id)
    if deleted:
        session.commit() # Commit the transaction if deletion was successful
        return {'success': True, 'message': f'Task {task_id} deleted successfully'}
    else:
        raise HTTPException(status_code=404, detail="Task not found or not authorized")
