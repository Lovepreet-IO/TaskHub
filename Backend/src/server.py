from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config.setting import settings
from src.database.session import check_db
from src.middlewares.logger import LoggerMiddleware
from src.middlewares.error_handler import global_error_handler
from src.common.app_error import AppError

# ROUTES
from src.modules.auth.routes import router as auth_router
from src.modules.auth.google_login import router as oauth_router, FRONTEND_URL
from src.modules.tasks.routes import router as task_router
from src.modules.dashboard.routes import router as dashboard_router
from src.modules.profile.routes import router as profile_router
from src.modules.logs.routes import router as logs_router

app = FastAPI(
    title="Task Management API",
    version="1.0.0"
)


# -----------------------------
# MIDDLEWARES
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:5174", settings.FRONTEND_URL],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggerMiddleware)


# -----------------------------
# EXCEPTION HANDLER
# -----------------------------

app.add_exception_handler(AppError, global_error_handler)


# -----------------------------
# DATABASE CONNECTION TEST
# -----------------------------

check_db()


# -----------------------------
# ROUTES
# -----------------------------

app.include_router(oauth_router)
app.include_router(auth_router)
app.include_router(task_router)
app.include_router(dashboard_router)
app.include_router(profile_router)
app.include_router(logs_router)


# -----------------------------
# ROOT ROUTE
# -----------------------------

@app.get("/")
async def root():
    return {"message": "Task Management API Running"}