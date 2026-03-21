# src/database/session.py
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from src.config.setting import settings

DATABASE_URL = (
    f"{settings.DB_PROTOCOL}://"
    f"{settings.DB_USER}:{settings.DB_PASSWORD}@"
    f"{settings.DB_HOST}/{settings.DB_NAME}"
    f"{settings.DB_OPTIONS}"
)


engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,  # logs SQL queries if DEBUG=True
    future=True,  # enables SQLAlchemy 2.0 style
    connect_args={"sslmode": "require"} if "sslmode=require" in settings.DB_OPTIONS else {}
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False, # prevents automatic writes before queries
    autocommit=False
)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session
    and closes it automatically after request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db():
    """
    Simple function to test database connectivity.
    """
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        print("Database connected successfully")
        db.close()
    except Exception as e:
        print("Database connection failed:", e)

# def run_query(query, params=None):
#     """
#         Simple function to run a query and return the result.
#     """
#     with engine.connect() as conn:
#         result = conn.execute(text(query), params or {})
#         conn.commit()
#         return result



# db_queries.py

def get_user_by_email(db, email: str):
    result = db.execute(
        text("SELECT user_id, email, username, role_id FROM users WHERE email = :email"),
        {"email": email}
    )
    user = result.mappings().first()
    return user




def get_user_by_username(db, username: str):
    result = db.execute(
        text("SELECT user_id FROM users WHERE username = :username"),
        {"username": username}
    )
    user = result.mappings().first()
    return user

