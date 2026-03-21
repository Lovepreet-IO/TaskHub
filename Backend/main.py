from src.config.setting import settings
import uvicorn

if __name__ == "__main__" and settings.ENV == "development":
    uvicorn.run("src.server:app",host="127.0.0.1", port=settings.PORT, log_level="debug", reload=True)
