from pydantic import BaseModel, EmailStr,constr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenSchema(BaseModel):
    refresh_token: str

class RegisterRequest(BaseModel):
    first_name: constr(strip_whitespace=True, min_length=1)
    last_name: constr(strip_whitespace=True, min_length=1)
    username: constr(strip_whitespace=True, min_length=3)
    email: EmailStr
    password: constr(min_length=6)