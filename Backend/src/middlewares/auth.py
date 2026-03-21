from fastapi import Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError

from src.database.session import get_db
from src.common.app_error import AppError
from src.utils.security import verify_access_token


security = HTTPBearer()


def authenticate(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    if not token:
        raise AppError("Access token required", 401)

    try:
        payload = verify_access_token(token)
        if not payload:
            raise AppError("Invalid token", 401)

        user_id = payload.get("user_id")
        role_id = payload.get("role_id")

        if not user_id:
            raise AppError("Invalid token", 401)

        return {
            "user_id": user_id,
            "role_id": role_id
        }

    except JWTError:
        raise AppError("Invalid or expired token", 401)