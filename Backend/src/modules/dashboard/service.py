from sqlalchemy import text
from src.common.app_error import AppError
from src.common.response import send_response
from src.modules.auth.service import GOOGLE_LOGIN_PASSWORD


def get_dashboard(user_id: int, role_id: int, db):
    if not user_id or not role_id:
        raise AppError("Unauthorized access", 401)

    status_to_me = get_task_summary("assigned_to", user_id, db)
    status_by_me = get_task_summary("assigned_by", user_id, db)

    profile = db.execute(
        text("""
            SELECT user_id, username, email, name, password
            FROM users
            WHERE user_id = :user_id
        """),
        {"user_id": user_id}
    ).mappings().first()

    signed_in_by = "GOOGLE" if profile["password"] == GOOGLE_LOGIN_PASSWORD else "email & Password"

    if role_id == 1:
        data = {
            "total_tasks": get_count_for_all(role_id, db),
            "assigned_by_me": status_by_me,
            "profile": {
                "user_id": user_id,
                "username": profile["username"],
                "email": profile["email"],
                "name": profile["name"],
                "signInBy": signed_in_by,
                "isAdmin": True
            }
        }
    else:
        data = {
            "assigned_to_me": status_to_me,
            "assigned_by_me": status_by_me,
            "profile": {
                "user_id": user_id,
                "username": profile["username"],
                "email": profile["email"],
                "name": profile["name"],
                "signInBy": signed_in_by,
                "isAdmin": False
            }
        }

    return send_response(200, "Dashboard data fetched", data)

def get_task_summary(column: str, user_id: int, db):
    return db.execute(
        text(f"""
            SELECT 
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'pending') AS pending,
                COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed,
                COUNT(*) FILTER (WHERE status = 'waiting_for_review') AS waiting_for_review
            FROM tasks
            WHERE {column} = :user_id
            AND is_deleted = false
        """),
        {"user_id": user_id}
    ).mappings().first()



def get_count_for_all(role_id: int, db):
    if not role_id:
        raise AppError("role_id is required", 400)

    if role_id != 1:
        raise AppError("You are not admin", 401)
    counts = db.execute(
        text("""
             SELECT COUNT(*) FILTER (WHERE status='pending') AS pending, COUNT(*) FILTER (WHERE status='in_progress') AS in_progress, COUNT(*) FILTER (WHERE status='completed') AS completed, COUNT(*) FILTER (WHERE status='waiting_for_review') AS waiting_for_review, COUNT(*) AS total
             FROM tasks
             WHERE is_deleted = false
             """)
    ).mappings().first()

    return counts
    data = {
        "counts": counts
    }
    return send_response(200, "Count of all task fetched successfully", data)
