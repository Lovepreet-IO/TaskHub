from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from src.common.app_error import AppError
from src.common.response import send_response
from src.database.session import get_db, get_user_by_username, get_user_by_email
from src.modules.auth.google_login import GOOGLE_LOGIN_PASSWORD
from src.modules.auth.schema import LoginRequest, RegisterRequest
from src.modules.auth.service import login_user, refresh_access_token, logout_user, register_user
from src.middlewares.auth import authenticate
from src.utils.security import hash_password, create_access_token, create_refresh_token, verify_refresh_token, \
    verify_access_token, verify_password

router = APIRouter(tags=["profile"],prefix="/profile")

@router.get("/")
def get_profile(user=Depends(authenticate), db: Session = Depends(get_db)):
    user_id = user["user_id"]

    profile = db.execute(
        text("""
            SELECT user_id, username, email, name, password
            FROM users
            WHERE user_id = :user_id
        """),
        {"user_id": user_id}
    ).mappings().first()

    if not profile:
        raise AppError("User not found", 404)

    sign_in_by = "email & Password"
    if profile["password"] == GOOGLE_LOGIN_PASSWORD:
        sign_in_by = "GOOGLE"

    return send_response(200, "Profile fetched", {
        "user_id": profile["user_id"],
        "username": profile["username"],
        "email": profile["email"],
        "name": profile["name"],
        "signInBy": sign_in_by
    })



@router.put("/username")
def update_profile(
    body: dict,
    user=Depends(authenticate   ),
    db: Session = Depends(get_db)
):
    user_id = user["user_id"]

    db.execute(
        text("""
            UPDATE users
            SET username = :username,
                name = :name
            WHERE user_id = :user_id
        """),
        {
            "username": body.get("username"),
            "name": body.get("name"),
            "user_id": user_id
        }
    )

    db.commit()

    return send_response(200, "Profile updated")

@router.put("/password")
def update_password(
    body: dict,
    user=Depends(authenticate),
    db: Session = Depends(get_db)
):
    user_id = user["user_id"]

    profile = db.execute(
        text("SELECT password FROM users WHERE user_id = :user_id"),
        {"user_id": user_id}
    ).mappings().first()

    if not profile:
        raise AppError("User not found", 404)

    current_password = body.get("current_password")
    new_password = body.get("new_password")

    # 🔥 GOOGLE USER → set password
    if profile["password"] == GOOGLE_LOGIN_PASSWORD:
        hashed = hash_password(new_password)

    # 🔥 NORMAL USER → verify old password
    else:

        if not verify_password(current_password, profile["password"]):
            raise AppError("Current password incorrect", 400)

        hashed = hash_password(new_password)

    db.execute(
        text("""
            UPDATE users
            SET password = :password
            WHERE user_id = :user_id
        """),
        {
            "password": hashed,
            "user_id": user_id
        }
    )

    db.commit()

    return send_response(200, "Password updated")