from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
import uuid
import logging
import os
import traceback
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.config import settings

logger = logging.getLogger("auth")
logging.basicConfig(level=logging.INFO)

router = APIRouter()

class GoogleLoginRequest(BaseModel):
    credential: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    role: str = "citizen"

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None

@router.post("/signup")
async def signup(user_in: UserCreate):
    try:
        db = get_db()
        existing_user = await db["users"].find_one({"email": user_in.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(user_in.password)
        
        new_user = {
            "id": user_id,
            "email": user_in.email,
            "full_name": user_in.full_name,
            "hashed_password": hashed_password,
            "role": user_in.role
        }
        
        await db["users"].insert_one(new_user)
        
        access_token = create_access_token(data={"sub": user_id, "email": user_in.email, "role": user_in.role, "full_name": user_in.full_name})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": user_in.email,
                "role": user_in.role,
                "full_name": user_in.full_name
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {type(e).__name__}: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="An error occurred during signup")

@router.post("/login")
async def login(user_in: UserLogin):
    try:
        db = get_db()
        user = await db["users"].find_one({"email": user_in.email})
        if not user:
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        
        if not user.get("hashed_password") or not verify_password(user_in.password, user["hashed_password"]):
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        
        user_id = str(user.get("id") or user.get("_id"))
        access_token = create_access_token(data={"sub": user_id, "email": user["email"], "role": user.get("role", "citizen"), "full_name": user.get("full_name")})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": user["email"],
                "role": user.get("role", "citizen"),
                "full_name": user.get("full_name")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {type(e).__name__}: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="An error occurred during login")

@router.post("/google")
async def google_auth(request: GoogleLoginRequest):
    logger.info("Received POST /api/auth/google request")
    
    if not request.credential or not request.credential.strip():
        logger.warning("Empty Google credential received in request")
        raise HTTPException(status_code=400, detail="Google credential token is missing")
    
    # 1. Determine Google Client ID
    client_id = (
        (settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_ID.strip())
        or os.getenv("GOOGLE_CLIENT_ID", "").strip()
        or os.getenv("VITE_GOOGLE_CLIENT_ID", "").strip()
    )
    is_client_id_configured = bool(client_id)
    logger.info(f"GOOGLE_CLIENT_ID configured: {is_client_id_configured}")
    
    # 2. Verify Google OAuth2 ID Token
    logger.info("Starting Google OAuth2 ID token verification...")
    try:
        req = google_requests.Request()
        # If client_id is configured, audience constraint is checked against it.
        # If not configured, token signature is verified against Google public keys.
        idinfo = id_token.verify_oauth2_token(
            request.credential,
            req,
            audience=client_id if client_id else None,
            clock_skew_in_seconds=10
        )
        logger.info("Google token verification succeeded")
    except ValueError as e:
        logger.error(f"Google token verification failed (ValueError): {e}")
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        logger.error(f"Google token verification failed ({type(e).__name__}): {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")
    
    # 3. Extract user information
    email = idinfo.get("email")
    if not email:
        logger.error("Google token payload did not contain an email address")
        raise HTTPException(status_code=400, detail="Google token does not contain a verified email address")
    
    full_name = idinfo.get("name") or idinfo.get("given_name") or email.split("@")[0]
    google_sub = idinfo.get("sub")
    masked_email = f"{email[:3]}***@{email.split('@')[-1]}" if "@" in email else "user"
    logger.info(f"Token verified for email: {masked_email}")
    
    # 4. MongoDB lookup or create user
    try:
        db = get_db()
        user = await db["users"].find_one({"email": email})
        
        if not user:
            user_id = str(uuid.uuid4())
            new_user = {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "hashed_password": None, # OAuth user
                "role": "citizen",
                "auth_provider": "google",
                "google_id": google_sub
            }
            await db["users"].insert_one(new_user)
            user = new_user
            logger.info("Created new user in MongoDB from Google authentication")
        else:
            logger.info("Existing user found in MongoDB")
            
        user_id = str(user.get("id") or user.get("_id"))
        user_role = user.get("role", "citizen")
        user_name = user.get("full_name") or full_name
        
    except Exception as e:
        logger.error(f"MongoDB operation failed during Google auth: {type(e).__name__}: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Database operation failed during authentication")
    
    # 5. Generate JWT token
    try:
        access_token = create_access_token(data={
            "sub": user_id,
            "email": email,
            "role": user_role,
            "full_name": user_name
        })
        logger.info("JWT access token generated successfully for Google user")
    except Exception as e:
        logger.error(f"JWT generation failed: {type(e).__name__}: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to generate authentication token")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": email,
            "role": user_role,
            "full_name": user_name
        }
    }

@router.put("/update_profile")
async def update_profile(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user.get("sub")
    
    update_data = {}
    if user_update.full_name is not None:
        update_data["full_name"] = user_update.full_name
    if user_update.password:
        update_data["hashed_password"] = get_password_hash(user_update.password)
        
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    await db["users"].update_one({"id": user_id}, {"$set": update_data})
    
    # Fetch updated user to generate new token
    user = await db["users"].find_one({"id": user_id})
    user_id = str(user.get("id") or user.get("_id"))
    access_token = create_access_token(data={"sub": user_id, "email": user["email"], "role": user.get("role", "citizen"), "full_name": user.get("full_name")})
    
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user_id, "email": user["email"], "role": user.get("role", "citizen"), "full_name": user.get("full_name")}}

