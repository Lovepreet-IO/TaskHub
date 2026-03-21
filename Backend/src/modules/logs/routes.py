from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.middlewares.auth import authenticate

from src.modules.logs.services import *

router = APIRouter(prefix="/logs", tags=["logs"])



@router.get("/")
def get_allLogs(db: Session = Depends(get_db),
    user=Depends(authenticate)):
    return get_all_logs(user["user_id"], user["role_id"], db)

