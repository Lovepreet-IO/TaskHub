import os
import time
from datetime import datetime, timezone
from pathlib import Path

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


# Get project root
BASE_DIR = Path(__file__).resolve().parent.parent

# logs directory
LOG_DIR = BASE_DIR / "logs"
LOG_FILE = LOG_DIR / "app.log"

# Create logs folder if not exists
LOG_DIR.mkdir(exist_ok=True)


class LoggerMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):

        start_time = time.time()

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration = int((time.time() - start_time) * 1000)

        # Try getting user (if auth middleware sets it)
        user = getattr(request.state, "user", None)
        user_id = user["user_id"] if user else "Guest"

        log_message = (
            f"[{datetime.now(timezone.utc).isoformat()}] "
            f"{request.method} {request.url.path} | "
            f"Status: {response.status_code} | "
            f"User: {user_id} | "
            f"{duration}ms\n"
        )

        with open(LOG_FILE, "a") as f:
            f.write(log_message)

        return response