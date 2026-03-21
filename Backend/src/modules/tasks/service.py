from src.common.app_error import AppError
from src.common.response import send_response
from sqlalchemy import text
from src.modules.tasks.getTask import get_tasks_my, get_all_tasks, get_tasks_given



def get_tasks(user_id: int, role_id: int, db):
    if not user_id or not role_id:
        raise AppError("user_id and role_id are required", 400)

    TaskGivenByYou = get_tasks_given(user_id, role_id, db)

    if role_id == 1:
        AllTasks = get_all_tasks(role_id, db)
        data= {
            "TaskGivenByYou": TaskGivenByYou,
            "AllTasks": AllTasks,  # dict with .tasks and .counts
        }
    else:
        MyTasks = get_tasks_my(user_id, role_id, db)
        data ={
            "TaskGivenByYou": TaskGivenByYou,
            "MyTasks": MyTasks,  # array
        }

    return send_response(200, "Tasks fetched successfully", data)


    # GET_ALL_TASKS - 3 controllers


def get_task_by_id(task_id: int, db):

    if not task_id:
        raise AppError("Task ID is required", 400)

    task = db.execute(
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
        WHERE task_id = :task_id
        AND is_deleted = false
        """),
        {"task_id": task_id}
    ).mappings().first()

    if not task:
        raise AppError("Task not found or deleted", 404)

    return send_response(
        200,
        "Task retrieved successfully",
        task
    )




# FILTERATION

def search_by_title(q: str, user_id: int, role_id: int, db, limit: int = 50):

    q = q.strip()[:200]

    if not q:
        raise AppError("Missing required query parameter: q", 400)

    if not user_id or not role_id:
        raise AppError("Unauthorized: user context required", 401)

    limit = min(200, max(1, limit))

    is_admin = role_id == 1

    params = {}
    where = ["is_deleted = false"]

    # search condition
    where.append("(title ILIKE :search OR description ILIKE :search)")
    params["search"] = f"%{q}%"

    # role restriction
    if not is_admin:
        where.append("(assigned_to = :user_id OR assigned_by = :user_id)")
        params["user_id"] = user_id

    where_sql = "WHERE " + " AND ".join(where)

    # 1️⃣ count total matches
    count_result = db.execute(
        text(f"""
        SELECT COUNT(*) AS total
        FROM tasks
        {where_sql}
        """),
        params
    )

    total = count_result.scalar()

    # 2️⃣ fetch results
    params["limit"] = limit

    result = db.execute(
        text(f"""
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
        {where_sql}
        ORDER BY created_at DESC
        LIMIT :limit
        """),
        params
    )

    tasks = result.mappings().all()

    return send_response(
        200,
        "Tasks fetched successfully",
        {
            "query": q,
            "total": total,
            "results": tasks
        }
    )

def filter_by_status(status: str, user_id: int, role_id: int, db):

    status = (status or "").strip()

    if not status:
        raise AppError("Missing required query parameter: status", 400)

    if not user_id or not role_id:
        raise AppError("Unauthorized: user context required", 401)

    is_admin = int(role_id) == 1
    LIMIT = 50

    params = {
        "status": status
    }

    where_conditions = [
        "is_deleted = false",
        "status = :status"
    ]

    if not is_admin:
        params["user_id"] = user_id
        where_conditions.append(
            "(assigned_to = :user_id OR assigned_by = :user_id)"
        )

    where_sql = " AND ".join(where_conditions)

    count_result = db.execute(
        text(f"""
        SELECT COUNT(*) AS total
        FROM tasks
        WHERE {where_sql}
        """),
        params
    ).mappings().first()

    total = count_result["total"] if count_result else 0

    params["limit"] = LIMIT

    tasks = db.execute(
        text(f"""
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
        WHERE {where_sql}
        ORDER BY created_at DESC
        LIMIT :limit
        """),
        params
    ).mappings().all()

    formatted = [
        {
            "id": str(t["task_id"]) if t["task_id"] else None,
            "title": t["title"],
            "description": t["description"],
            "status": t["status"],
            "priority": t["priority"],
            "assigned_to": t["assigned_to"],
            "assigned_by": t["assigned_by"],
            "due_date": t["due_date"],
            "createdAt": t["created_at"],
            "completed_at": t["completed_at"],
        }
        for t in tasks
    ]

    return send_response(
        200,
        "Filtered tasks fetched",
        {
            "status": status,
            "total": total,
            "results": formatted
        }
    )

def sort_by_date(order: str, user_id: int, role_id: int, db, limit: int = 50):

    if not user_id or not role_id:
        raise AppError("Unauthorized: user context required", 401)

    order = "ASC" if order.lower() == "asc" else "DESC"

    limit = min(200, max(1, limit))

    is_admin = role_id == 1

    params = {}
    where = ["is_deleted = false"]

    if not is_admin:
        where.append("(assigned_to = :user_id OR assigned_by = :user_id)")
        params["user_id"] = user_id

    where_sql = "WHERE " + " AND ".join(where)

    # 1️⃣ count total tasks
    count_result = db.execute(
        text(f"""
        SELECT COUNT(*) AS total
        FROM tasks
        {where_sql}
        """),
        params
    )

    total = count_result.scalar()

    # 2️⃣ sorted query
    params["limit"] = limit

    result = db.execute(
        text(f"""
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
        {where_sql}
        ORDER BY created_at {order}
        LIMIT :limit
        """),
        params
    )

    tasks = result.mappings().all()

    return send_response(
        200,
        "Tasks sorted successfully",
        {
            "order": order.lower(),
            "total": total,
            "results": tasks
        }
    )

def paginate_tasks(page: int, user_id: int, role_id: int, db):
    print("**********************************************************************************************",page)

    if not user_id or not role_id:
        raise AppError("Unauthorized: user context required", 401)
    limit = 10
    page = max(1, int(page))
    offset = (page - 1) * limit

    is_admin = role_id == 1

    params = {}
    where = ["is_deleted = false" ]

    if not is_admin:
        where.append("(assigned_to = :user_id OR assigned_by = :user_id)")
        params["user_id"] = user_id

    where_sql = "WHERE " + " AND ".join(where)

    # 1️⃣ total count
    count_result = db.execute(
        text(f"""
        SELECT COUNT(*) AS total
        FROM tasks
        {where_sql}
        """),
        params
    )

    total = count_result.scalar()

    # 2️⃣ paginated query
    params["limit"] = limit
    params["offset"] = offset

    result = db.execute(
        text(f"""
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
        {where_sql}
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
        """),
        params
    )

    tasks = result.mappings().all()

    return send_response(
        200,
        "Tasks fetched successfully",
        {
            "page": page,
            "limit": limit,
            "total": total,
            "results": tasks
        }
    )















# -----------------------------
# LOG TASK ACTION
# -----------------------------
def log_task_action(task_id: int, action: str, user_id: int, db):

    db.execute(
        text("""
        INSERT INTO task_logs(task_id, action, performed_by)
        VALUES(:task_id, :action, :user_id)
        """),
        {
            "task_id": task_id,
            "action": action,
            "user_id": user_id
        }
    )








# CRUD TASK

# -----------------------------
# CREATE TASK
# -----------------------------
def create_task(data, user_id: int, db):

    result = db.execute(
        text("""
        INSERT INTO tasks
        (title, description, status, priority, assigned_to, assigned_by, due_date)
        VALUES
        (:title,:description,:status,:priority,:assigned_to,:assigned_by,:due_date)
        RETURNING *
        """),
        {
            "title": data.title,
            "description": data.description,
            "status": data.status,
            "priority": data.priority,
            "assigned_to": data.assigned_to,
            "assigned_by": user_id,
            "due_date": data.due_date
        }
    )

    task = result.mappings().first()

    if not task:
        raise AppError("Task creation failed", 500)

    log_task_action(task["task_id"], "Task Created", user_id, db)

    db.commit()

    return send_response(201, "Task created successfully", task)


# -----------------------------
# GET USERS
# -----------------------------
def get_users(db):

    result = db.execute(
        text("""
        SELECT user_id, username
        FROM users
        WHERE role_id != 1
        ORDER BY username ASC
        """)
    )

    users = result.mappings().all()

    return send_response(200, "Users fetched successfully", users)


# -----------------------------
# UPDATE TASK
# -----------------------------
def update_task(task_id: int, data, user_id: int, db):

    result = db.execute(
        text("""
        UPDATE tasks
        SET title=:title,
            description=:description,
            status=:status,
            priority=:priority,
            assigned_to=:assigned_to,
            due_date=:due_date
        WHERE task_id=:task_id
        AND is_deleted=false
        RETURNING *
        """),
        {
            "title": data.title,
            "description": data.description,
            "status": data.status,
            "priority": data.priority,
            "assigned_to": data.assigned_to,
            "due_date": data.due_date,
            "task_id": task_id
        }
    )

    task = result.mappings().first()

    if not task:
        raise AppError("Task not found or deleted", 404)

    log_task_action(task_id, "Task Updated", user_id, db)

    db.commit()

    return send_response(200, "Task updated successfully", task)


# -----------------------------
# GET TASK BY ID
# -----------------------------
def get_task_by_id(task_id: int, db):

    result = db.execute(
        text("""
        SELECT *
        FROM tasks
        WHERE task_id=:task_id
        AND is_deleted=false
        """),
        {"task_id": task_id}
    )

    task = result.mappings().first()

    if not task:
        raise AppError("Task not found", 404)

    return send_response(200, "Task fetched successfully", task)
















# DELETE



# -----------------------------
# SOFT DELETE TASK
# -----------------------------
def delete_task(task_id: int, user_id: int, db):

    result = db.execute(
        text("""
        UPDATE tasks
        SET is_deleted=true,
            deleted_at=CURRENT_TIMESTAMP,
            deleted_by=:user_id
        WHERE task_id=:task_id
        AND is_deleted=false
        RETURNING *
        """),
        {
            "task_id": task_id,
            "user_id": user_id
        }
    )

    task = result.mappings().first()

    if not task:
        raise AppError("Task not found or already deleted", 404)

    log_task_action(task_id, "Task Soft Deleted", user_id, db)

    db.commit()

    return send_response(200, "Task deleted successfully", task)


# -----------------------------
# RESTORE TASK
# -----------------------------
def restore_task(task_id: int, user_id: int, db):

    result = db.execute(
        text("""
        UPDATE tasks
        SET is_deleted=false,
            deleted_at=NULL,
            deleted_by=NULL
        WHERE task_id=:task_id
        AND is_deleted=true
        RETURNING *
        """),
        {
            "task_id": task_id,
            "user_id": user_id
        }
    )

    task = result.mappings().first()

    if not task:
        raise AppError("Task not found or not deleted", 404)

    log_task_action(task_id, "Task Restored", user_id, db)

    db.commit()

    return send_response(200, "Task restored successfully", task)


def deleted_task(role_id: int, db):
    if role_id != 1:
        raise AppError("Unauthorized: Admin only", 401)

    result = db.execute(
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
                t.is_deleted,
                t.deleted_at,
                t.deleted_by,

                u1.username AS assigned_to_name,
                u2.username AS assigned_by_name

            FROM tasks t
            LEFT JOIN users u1 ON t.assigned_to = u1.user_id
            LEFT JOIN users u2 ON t.assigned_by = u2.user_id

            WHERE t.is_deleted = true
            ORDER BY t.deleted_at DESC
        """)
    ).mappings().all()
    data = {
        "DeletedTasks": result
    }
    return send_response(200, "Deleted tasks fetched successfully", data)


# UPDATE

# -----------------------------
# ADD COMMENT
# -----------------------------
def add_comment(task_id: int, message: str, user_id: int, db):

    result = db.execute(
        text("""
        INSERT INTO task_comments(task_id,user_id,message)
        VALUES(:task_id,:user_id,:message)
        RETURNING *
        """),
        {
            "task_id": task_id,
            "user_id": user_id,
            "message": message
        }
    )

    comment = result.mappings().first()

    log_task_action(task_id, "Comment Added", user_id, db)

    db.commit()

    return send_response(201, "Comment added successfully", comment)





def get_comment(task_id: int, db):
    query = text("""
                 SELECT tc.comment_id,
                        tc.task_id,
                        tc.user_id,
                        tc.message,
                        tc.created_at
                 FROM task_comments tc
                 WHERE tc.task_id = :task_id
                 ORDER BY tc.created_at DESC
                 """)

    result = db.execute(query, {"task_id": task_id})

    data = {
        "Comment": result.mappings().first()
    }
    return send_response(200, "Comment fetched successfully", data)


# -----------------------------
# UPDATE TASK STATUS
# -----------------------------
def update_task_status(task_id: int, status: str, user_id: int, db):

    if not status:
        raise AppError("Status is required", 400)

    result = db.execute(
        text("""
        UPDATE tasks
        SET status=:status
        WHERE task_id=:task_id
        AND is_deleted=false
        RETURNING *
        """),
        {
            "task_id": task_id,
            "status": status
        }
    )

    task = result.mappings().first()

    if not task:
        raise AppError("Task not found or deleted", 404)

    log_task_action(task_id, f"Status Updated to {status}", user_id, db)

    db.commit()

    return send_response(200, "Status updated successfully", task)
























# LOGS

# -----------------------------
# GET TASK LOGS
# -----------------------------
def get_task_logs(task_id: int, db):

    result = db.execute(
        text("""
        SELECT l.*, u.username
        FROM task_logs l
        JOIN users u ON l.performed_by=u.user_id
        WHERE l.task_id=:task_id
        ORDER BY l.created_at DESC
        """),
        {"task_id": task_id}
    )

    logs = result.mappings().all()

    return send_response(200, "Logs fetched successfully", logs)


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

