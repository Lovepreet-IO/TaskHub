from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
import httpx

from src.config.setting import settings
from src.utils.security import create_access_token, create_refresh_token
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.database.session import get_db, get_user_by_email, get_user_by_username

router = APIRouter(tags=["google_login"], prefix="/oauth")
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI = settings.GOOGLE_REDIRECT_URI
FRONTEND_URL = settings.FRONTEND_URL
GOOGLE_LOGIN_PASSWORD = settings.GOOGLE_LOGIN_PASSWORD

@router.get("/google")
def google_login():
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        "?response_type=code"
        f"&client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&scope=openid email profile"
    )
    return RedirectResponse(url)




@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    token_url = "https://oauth2.googleapis.com/token"

    # ---- exchange token ----
    async with httpx.AsyncClient(timeout=10.0) as client:
        token_res = await client.post(token_url, data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        })

    token_data = token_res.json()
    access_token = token_data.get("access_token")

    if not access_token:
        return {"error": token_data}

    # ---- get user info ----
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            user_res = await client.get(
                "https://openidconnect.googleapis.com/v1/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
    except httpx.ConnectTimeout:
        return {"error": "Connection to Google timed out"}

    user = user_res.json()

    email = user.get("email")
    given_name = user.get("given_name")
    family_name = user.get("family_name")

    if not email:
        return {"error": "Email not found"}

    # ---- check user ----
    existing_user = get_user_by_email(db, email)

    # ============================
    # ✅ EXISTING USER → LOGIN
    # ============================

    if existing_user:
        payload = {
            "user_id": existing_user["user_id"],
            "role_id": existing_user["role_id"]
        }
        atoken = create_access_token(payload)
        rtoken = create_refresh_token(payload)
        db.execute(
            text("""
                 INSERT INTO user_token(user_id, refresh_token)
                 VALUES (:user_id, :refresh_token)
                 """),
            {
                "user_id": existing_user["user_id"],
                "refresh_token": rtoken
            }
        )
        db.commit()
        return RedirectResponse(
            url=f"{FRONTEND_URL}/oauth-success?access_token={atoken}&refresh_token={rtoken}"
        )

    # ❌ NEW USER → SEND TEMP TOKEN
    temp_payload = {
        "email": email,
        "first_name": given_name,
        "last_name": family_name
    }

    temp_token = create_access_token(temp_payload)  # short expiry recommended

    return RedirectResponse(
        url=f"{FRONTEND_URL}/set-username?token={temp_token}"
    )