from sqlalchemy import text
from src.common.app_error import AppError
from src.common.response import send_response
# from src.modules.auth.google_login import GOOGLE_LOGIN_PASSWORD
from src.utils.security import verify_password, create_access_token, create_refresh_token, verify_refresh_token, \
    hash_password

GOOGLE_LOGIN_PASSWORD = "GOOGLE_"

def login_user(email: str, password: str, db):

    result = db.execute(
        text("""
        SELECT user_id, name, username, role_id, password
        FROM users
        WHERE email=:email
        """),
        {"email": email}
    )

    user = result.mappings().first()

    if not user:
        raise AppError("User not found", 404)
    # if verify_password(GOOGLE_LOGIN_PASSWORD, user["password"]):
    #     raise AppError("Try for Google Login", 401)
    if user["password"] == GOOGLE_LOGIN_PASSWORD:
        raise AppError("Try for Google Login", 401)

    if not verify_password(password, user["password"]):
        raise AppError("Invalid password", 401)
    print("-----------------------------------------------------------------------------------------------------------")
    payload = {
        "user_id": user["user_id"],
        "role_id": user["role_id"]
    }

    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)

    db.execute(
        text("""
        INSERT INTO user_token (user_id, refresh_token)
        VALUES (:user_id, :refresh_token)
        """),
        {
            "user_id": user["user_id"],
            "refresh_token": refresh_token
        }
    )

    db.commit()

    return send_response(
        200,
        "Login successful",
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "user_id": user["user_id"],
                "name": user["name"],
                "username": user["username"],
                "role_id": user["role_id"]
            }
        }
    )

def logout_user(user_id: str, refresh_token: str, db):

    result = db.execute(
        text("""
        DELETE FROM user_token
        WHERE user_id=:user_id
        AND refresh_token=:token
        RETURNING id
        """),
        {"user_id": int(user_id), "token": refresh_token}
    )

    deleted = result.fetchone()
    print(deleted)

    db.commit()

    if not deleted:
        raise AppError("Invalid token or already logged out", 401)

    return send_response(200, "Logout successful")

def refresh_access_token(refresh_token: str, db):

    if not refresh_token:
        raise AppError("Refresh token not provided", 401)

    # verify token using security module
    decoded = verify_refresh_token(refresh_token)

    if not decoded:
        raise AppError("Invalid or expired refresh token", 403)

    user_id = decoded["user_id"]
    role_id = decoded["role_id"]

    # check token in DB
    result = db.execute(
        text("""
        SELECT *
        FROM user_token
        WHERE user_id = :user_id
        AND refresh_token = :token
        """),
        {"user_id": user_id, "token": refresh_token}
    )

    token_data = result.mappings().first()

    if not token_data:
        raise AppError("Refresh token not recognized", 403)

    # create new access token
    new_access_token = create_access_token({
        "user_id": user_id,
        "role_id": role_id
    })

    return send_response(
        200,
        "Access token refreshed successfully",
        {
            "access_token": new_access_token
        }
    )

def register_user(first_name, last_name, email, username, password, db):

    name = f"{first_name} {last_name}"

    existing = db.execute(
        text("""
        SELECT 1 FROM users
        WHERE email=:email OR username=:username
        """),
        {"email": email, "username": username}
    ).fetchone()

    if existing:
        raise AppError("User already exists", 400)

    db.execute(
        text("""
        INSERT INTO users(name,email,username,password,role_id)
        VALUES(:name,:email,:username,:password,2)
        """),
        {
            "name": name,
            "email": email,
            "username": username,
            "password": password,
        }
    )

    db.commit()

    # 🔥 fetch inserted user_id
    result = db.execute(
        text("SELECT user_id FROM users WHERE email=:email"),
        {"email": email}
    )

    user = result.mappings().first()
    payload = {"user_id": user["user_id"], "role_id": "2"}

    access_token = create_access_token(payload)
    r_token = create_refresh_token(payload)

    db.execute(
        text("""
             INSERT INTO user_token(user_id, refresh_token)
             VALUES (:user_id, :refresh_token)
             """),
        {
            "user_id": user["user_id"],
            "refresh_token": r_token
        }
    )

    db.commit()

    data = {
        "user_id": user["user_id"],
        "email": email,
        "username": username,
        "access_token": access_token,
        "refresh_token": r_token
    }

    return send_response(
        200,
        "User created successfully",
        data
    )

# def update_profile(name, email, username, password, db):
#     name = f"{first_name} {last_name}"