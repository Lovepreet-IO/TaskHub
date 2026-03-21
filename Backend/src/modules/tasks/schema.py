from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assigned_to: int
    due_date: Optional[datetime]


class TaskUpdate(BaseModel):
    title: str
    description: Optional[str]
    status: str
    priority: str
    assigned_to: int
    due_date: Optional[datetime]


class StatusUpdate(BaseModel):
    status: str


class CommentCreate(BaseModel):
    message: str