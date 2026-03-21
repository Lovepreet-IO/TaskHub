from fastapi import Request
from fastapi.responses import JSONResponse
from datetime import datetime, timezone

from src.common.app_error import AppError


async def global_error_handler(request: Request, exc: AppError):

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "status": exc.status_code,
            "message": exc.message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )