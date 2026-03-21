from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from src.database.session import Base
from datetime import datetime, timezone
from src.database.models import TaskStatus, TaskPriority


class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.pending)
    priority = Column(Enum(TaskPriority), nullable=False, default=TaskPriority.medium)
    assigned_to = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"))
    assigned_by = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"))
    due_date = Column(Date)
    created_at = Column(DateTime, default=datetime.now(timezone.utc).isoformat())
    completed_at = Column(DateTime)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime)
    deleted_by = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"))

    assigned_user = relationship("User", foreign_keys=[assigned_to], back_populates="tasks_assigned")
    created_by_user = relationship("User", foreign_keys=[assigned_by], back_populates="tasks_created")
    comments = relationship("TaskComment", back_populates="task")
    logs = relationship("TaskLog", back_populates="task")