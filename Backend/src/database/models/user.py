from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from src.database.session import Base
from datetime import datetime,timezone

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    name = Column(String(250), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(Text, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.role_id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc).isoformat())

    role = relationship("Role", back_populates="users")
    tasks_assigned = relationship("Task", foreign_keys='Task.assigned_to', back_populates="assigned_user")
    tasks_created = relationship("Task", foreign_keys='Task.assigned_by', back_populates="created_by_user")