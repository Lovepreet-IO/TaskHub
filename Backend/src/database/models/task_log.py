from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from src.database.session import Base
from datetime import datetime, timezone

class TaskLog(Base):
    __tablename__ = "task_logs"

    log_id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.task_id", ondelete="CASCADE"), nullable=False)
    action = Column(String(100), nullable=False)
    performed_by = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc).isoformat())

    task = relationship("Task", back_populates="logs")
    user = relationship("User")