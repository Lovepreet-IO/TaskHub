import enum
class TaskStatus(enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    waiting_for_review = "waiting_for_review"
    completed = "completed"

class TaskPriority(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"