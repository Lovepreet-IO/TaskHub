from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.session import get_db
from src.middlewares.auth import authenticate

from src.modules.tasks.service import *
from src.modules.tasks.schema import *

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/")
def create(
    task: TaskCreate,
    db: Session = Depends(get_db),
    user=Depends(authenticate)
):
    return create_task(task, user["user_id"], db)

@router.get("/")
def getTasks(
    db: Session = Depends(get_db),
    user=Depends(authenticate)
):
    return get_tasks(user["user_id"], user["role_id"], db)

@router.get("/get-username")
def get_Users_for_create(db: Session = Depends(get_db)):
    return get_users(db)


@router.get("/all-logs")
def get_allLogs(db: Session = Depends(get_db),
    user=Depends(authenticate)):
    return get_all_logs(user["user_id"], user["role_id"], db)

@router.get("/deleted")
def deleted(
    db: Session = Depends(get_db),
    user=Depends(authenticate)
):
    return deleted_task( user["role_id"], db)








@router.get("/{task_id}")
def get_by_id(task_id: int, db: Session = Depends(get_db)):
    return get_task_by_id(task_id, db)


@router.put("/{task_id}")
def update(
    task_id: int,
    task: TaskUpdate,
    db: Session = Depends(get_db),
    user=Depends(authenticate)
):
    return update_task(task_id, task, user["user_id"], db)


@router.delete("/{task_id}")
def delete(
    task_id: int,
    db: Session = Depends(get_db),
    user=Depends(authenticate)
):
    return delete_task(task_id, user["user_id"], db)



@router.put("/restore/{task_id}")
def restore(
    task_id: int,
    db: Session = Depends(get_db),
    user=Depends(authenticate)
):
    return restore_task(task_id, user["user_id"], db)


@router.post("/{task_id}/comment")
def comment(
    task_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    user=Depends(authenticate)
):
    return add_comment(task_id, comment.message, user["user_id"], db)

@router.get("/comment/{task_id}")
def get_comments(
    task_id: int ,
    db: Session = Depends(get_db),
):
    return get_comment(task_id , db)


@router.put("/{task_id}/status")
def update_status(
    task_id: int,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    user=Depends(authenticate)
):
    return update_task_status(task_id, data.status, user["user_id"], db)


@router.get("/{task_id}/logs")
def logs(task_id: int, db: Session = Depends(get_db)):
    return get_task_logs(task_id, db)


@router.get("/logs/all")
def all_logs(
    db: Session = Depends(get_db),
    user=Depends(authenticate)
):
    return get_all_logs(user["user_id"], user["role_id"], db)

@router.get("/page/{page}")
def get_tasks_bypage(page: int = 1 , db: Session = Depends(get_db), user=Depends(authenticate)):
    print("**********************************************************************************************",page)

    return paginate_tasks(page , user["user_id"], user["role_id"], db)