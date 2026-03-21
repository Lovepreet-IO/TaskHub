# Import Base and engine
from src.database.session import Base, engine

# Import all models so SQLAlchemy knows about them
from src.database.models.role import Role
from src.database.models.user import User
from src.database.models.task import Task
from src.database.models.task_comment import TaskComment
from src.database.models.task_log import TaskLog
from src.database.models.Enums import TaskStatus, TaskPriority

# Create all tables in the database
# Base.metadata.create_all(bind=engine)