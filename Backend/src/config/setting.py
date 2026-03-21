# src/config/settings.py
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent   # points to the folder containing .env

class Settings(BaseSettings):
    """
    BaseSettings automatically reads values from environment variables
    and the .env file.
    """
    ENV: str = "development"
    PORT: int = 8000

    # Database configuration variables
    DB_PROTOCOL: str = "postgresql"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "12345"
    DB_HOST: str = "localhost"
    DB_NAME: str = "task_db"
    DB_OPTIONS: str = ""

    DEBUG: bool = True
    APP_NAME: str = "Task API"

    JWT_SECRET:str
    REFRESH_SECRET: str

    ACCESS_TOKEN_EXPIRE_MINUTES: float = 15
    REFRESH_TOKEN_EXPIRE_DAYS: float = 7

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    FRONTEND_URL: str
    GOOGLE_LOGIN_PASSWORD: str


    class Config:
        # tells pydantic to load variables from .env file
        env_file = (BASE_DIR / ".env")


'''load .env file
add values to environment
read variables
map them to fields'''
settings = Settings()
