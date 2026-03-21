from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.middlewares.auth import authenticate

from src.modules.dashboard.service import get_dashboard

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def dashboard(
    db: Session = Depends(get_db),
    user=Depends(authenticate)
):
    return get_dashboard(user["user_id"], user["role_id"], db)

# @router.get("/all-task-counts")
# def all_task_counts(db: Session = Depends(get_db), user=Depends(authenticate)):
#     return get_count(user["role_id"], db)

