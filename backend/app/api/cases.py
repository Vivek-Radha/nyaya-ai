from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.core.security import get_current_user
from app.core.database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

class CaseCreate(BaseModel):
    title: str
    description: str
    status: str = "Open"

@router.get("/")
async def get_cases(user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        db = get_db()
        cursor = db["cases"].find({"user_id": user_id}).sort("created_at", -1)
        cases = await cursor.to_list(length=100)
        for c in cases:
            c["id"] = str(c.pop("_id"))
        return {"cases": cases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_case(case: CaseCreate, user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        db = get_db()
        new_case = {
            "user_id": user_id,
            "title": case.title,
            "description": case.description,
            "status": case.status,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await db["cases"].insert_one(new_case)
        new_case["id"] = str(result.inserted_id)
        new_case.pop("_id", None)
        return {"case": new_case}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{case_id}")
async def delete_case(case_id: str, user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        db = get_db()
        
        try:
            case_obj_id = ObjectId(case_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid case ID format")
            
        # Delete case
        result = await db["cases"].delete_one({"_id": case_obj_id, "user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Case not found or unauthorized")
            
        # Cascade delete timeline events for this case
        await db["timeline"].delete_many({"case_id": case_id, "user_id": user_id})
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
