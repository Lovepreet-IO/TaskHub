from src.common.app_error import AppError
from src.common.response import send_response
from sqlalchemy import text


# all 3 are of above function
def get_tasks_given(user_id: int, role_id: int, db):

    if not user_id or not role_id:
        raise AppError("user_id and role_id are required", 400)

    tasks = db.execute(
        text("""
        SELECT 
            t.task_id,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.due_date,
            t.created_at,
            t.completed_at,
            u_assigned.username AS assigned_to_name,
            u_by.username AS assigned_by_name
        FROM tasks t
        LEFT JOIN users u_assigned 
            ON t.assigned_to = u_assigned.user_id
        LEFT JOIN users u_by 
            ON t.assigned_by = u_by.user_id
        WHERE t.assigned_by = :user_id
        AND t.is_deleted = false
        """),
        {"user_id": user_id}
    ).mappings().all()
    return tasks
    return send_response(200, "Tasks fetched successfully", tasks)

def get_tasks_my(user_id: int, role_id: int, db):

    if not user_id or not role_id:
        raise AppError("user_id and role_id are required", 400)

    if int(role_id) == 1:

        tasks = db.execute(
            text("""
            SELECT
                task_id,
                title,
                description,
                status,
                priority,
                assigned_to,
                assigned_by,
                due_date,
                created_at,
                completed_at
            FROM tasks
            WHERE is_deleted = false
            """)
        ).mappings().all()

    else:

        tasks = db.execute(
            text("""
            SELECT 
                t.task_id,
                t.title,
                t.description,
                t.status,
                t.priority,
                t.due_date,
                t.created_at,
                t.completed_at,
                u_assigned.username AS assigned_to_name,
                u_by.username AS assigned_by_name
            FROM tasks t
            LEFT JOIN users u_assigned 
                ON t.assigned_to = u_assigned.user_id
            LEFT JOIN users u_by 
                ON t.assigned_by = u_by.user_id
            WHERE t.assigned_to = :user_id
            AND t.is_deleted = false
            """),
            {"user_id": user_id}
        ).mappings().all()
    return tasks
    return send_response(200, "Tasks fetched successfully", tasks)

def get_all_tasks(role_id: int, db):

    if not role_id:
        raise AppError("role_id is required", 400)

    if int(role_id) != 1:
        raise AppError("Access denied. Admin only.", 403)

    tasks = db.execute(
        text("""
        SELECT
            t.task_id,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.due_date,
            t.created_at,
            t.completed_at,
            u_assigned.username AS assigned_to_name,
            u_by.username AS assigned_by_name
        FROM tasks t
        LEFT JOIN users u_assigned 
            ON t.assigned_to = u_assigned.user_id
        LEFT JOIN users u_by 
            ON t.assigned_by = u_by.user_id
        WHERE t.is_deleted = false
        """)
    ).mappings().all()

    counts = db.execute(
        text("""
        SELECT
            COUNT(*) FILTER (WHERE status='pending') AS pending,
            COUNT(*) FILTER (WHERE status='in_progress') AS in_progress,
            COUNT(*) FILTER (WHERE status='completed') AS completed,
            COUNT(*) FILTER (WHERE status='waiting_for_review') AS waiting_for_review,
            COUNT(*) AS total
        FROM tasks
        WHERE is_deleted = false
        """)
    ).mappings().first()
    return {
            "tasks": tasks,
            "counts": counts
        }
    return send_response(
        200,
        "Tasks fetched successfully",
        {
            "tasks": tasks,
            "counts": counts
        }
    )
# till here GET_ALL_TASKS
