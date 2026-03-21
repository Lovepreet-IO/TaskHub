from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError


from src.config.setting import settings

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

JWT_SECRET = settings.JWT_SECRET
REFRESH_SECRET = settings.REFRESH_SECRET

ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS


def hash_password(password: str):
    # print(pwd_context.hash(password))
    return pwd_context.hash( password)

def verify_password(plain_password: str, hashed_password: str):
    # print("*****************************************",plain_password,"database+++++",hashed_password)
    # hash_password(plain_password)
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc)  + timedelta(minutes=(ACCESS_TOKEN_EXPIRE_MINUTES))

    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def create_refresh_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc)  + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    return jwt.encode(payload, REFRESH_SECRET, algorithm="HS256")


# TOKEN VERIFICATION
def verify_refresh_token(token: str):
    try:
        payload = jwt.decode(token, REFRESH_SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        return None


def verify_access_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        return None