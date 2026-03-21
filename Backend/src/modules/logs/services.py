from src.common.app_error import AppError
from src.common.response import send_response
from sqlalchemy import text




# -----------------------------
# GET ALL LOGS
# -----------------------------
def get_all_logs(user_id: int, role_id: int, db):

    if role_id == 1:

        result = db.execute(
            text("""
            SELECT tl.*, t.title, u.username
            FROM task_logs tl
            JOIN tasks t ON t.task_id=tl.task_id
            JOIN users u ON u.user_id=tl.performed_by
            ORDER BY tl.created_at DESC
            """)
        )

    else:
        result = db.execute(
            text("""
            SELECT tl.*, t.title, u.username
            FROM task_logs tl
            JOIN tasks t ON t.task_id=tl.task_id
            JOIN users u ON u.user_id=tl.performed_by
            WHERE tl.performed_by=:user_id
            ORDER BY tl.created_at DESC
            """),
            {"user_id": user_id}
        )

    logs = result.mappings().all()

    return send_response(200, "Logs fetched successfully", logs)

