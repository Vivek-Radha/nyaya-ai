from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
import uuid
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.config import settings
from app.core.security import get_current_user

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
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user_id, "email": user_in.email, "role": user_in.role, "full_name": user_in.full_name}}

@router.post("/login")
async def login(user_in: UserLogin):
    db = get_db()
    user = await db["users"].find_one({"email": user_in.email})
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not verify_password(user_in.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"], "role": user.get("role", "citizen"), "full_name": user.get("full_name")})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user["id"], "email": user["email"], "role": user.get("role", "citizen"), "full_name": user.get("full_name")}}

@router.post("/google")
async def google_auth(request: GoogleLoginRequest):
    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            request.credential, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )

        email = idinfo.get("email")
        full_name = idinfo.get("name", "")
        
        db = get_db()
        user = await db["users"].find_one({"email": email})
        
        if not user:
            # Create a new user if one doesn't exist
            user_id = str(uuid.uuid4())
            user = {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "hashed_password": None, # OAuth users don't have a password
                "role": "citizen",
                "auth_provider": "google",
                "google_id": idinfo.get("sub")
            }
            await db["users"].insert_one(user)

        access_token = create_access_token(data={"sub": user["id"], "email": user["email"], "role": user.get("role", "citizen"), "full_name": user.get("full_name")})
        return {"access_token": access_token, "token_type": "bearer", "user": {"id": user["id"], "email": user["email"], "role": user.get("role", "citizen"), "full_name": user.get("full_name")}}

    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

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
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"], "role": user.get("role", "citizen"), "full_name": user.get("full_name")})
    
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user["id"], "email": user["email"], "role": user.get("role", "citizen"), "full_name": user.get("full_name")}}
