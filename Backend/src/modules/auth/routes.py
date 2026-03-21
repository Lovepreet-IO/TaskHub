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
from src.utils.security import hash_password, create_access_token, create_refresh_token, verify_refresh_token, verify_access_token

router = APIRouter(tags=["auth"],prefix="/auth")


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return login_user(data.email, data.password, db)


@router.post("/refresh")
async def refresh_token(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    refresh_token = body.get("refresh_token")  # read from frontend

    if not refresh_token:
        raise AppError("Refresh token not provided", 401)

    return refresh_access_token(refresh_token, db)

@router.post("/logout")
def logout(
    request: Request,
    data: dict,
    db: Session = Depends(get_db)
):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise AppError("Token missing", 401)

    token = auth_header.split(" ")[1]
    payload =     verify_access_token(token)  # your JWT decode function

    user_id = payload.get("user_id")

    r_token = data.get("refresh_token")

    return logout_user(user_id, r_token, db)

@router.post("/register")
def register(
    request_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    try:
        return register_user(
            first_name=request_data.first_name,
            last_name=request_data.last_name,
            email=request_data.email,
            username=request_data.username,
            password=hash_password(request_data.password),
            db=db
        )
    except Exception as e:
        raise AppError(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=str(e)
        )


@router.post("/set-username")
async def set_username(request: Request, db: Session = Depends(get_db)):
    body = await request.json()

    token = body.get("token")
    username = body.get("username")

    if not token:
        raise AppError("Token missing", 400)

    payload = verify_access_token(token)

    email = payload.get("email")
    first_name = payload.get("first_name")
    last_name = payload.get("last_name")

    if not username or len(username) < 3:
        raise AppError(message="Username must be at least 3 characters long.",status_code=status.HTTP_400_BAD_REQUEST)

    if get_user_by_username(db, username):
        raise AppError("Username already exists", 400)

    if get_user_by_email(db, email):
        raise AppError("Email already exists", 400)

    # create user
    user = register_user(
        first_name=first_name,
        last_name=last_name,
        email=email,
        username=username,
        password=GOOGLE_LOGIN_PASSWORD,
        db=db
    )

    return send_response(
        200,
        "User created",
        {
            "access_token": user["data"]["access_token"],
            "refresh_token": user["data"]["refresh_token"]
        }
    )

@router.get("/check-username")
def check_username(username: str, db: Session = Depends(get_db)):
    user = get_user_by_username(db, username)

    if user:
        return {"available": False}

    return {"available": True}




@router.get("/check-email")
def check_email(email: str, db: Session = Depends(get_db)):

    user = db.execute(
        text("SELECT 1 FROM users WHERE email = :email"),
        {"email": email}
    ).first()

    return {"available": not bool(user)}