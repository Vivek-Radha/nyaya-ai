from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import get_current_user
from app.core.database import get_db
from datetime import datetime

router = APIRouter()

class JudgmentCreate(BaseModel):
    title: str
    summary: str
    url: str = ""

@router.get("/")
async def get_judgments(user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        db = get_db()
        cursor = db["judgments"].find({"user_id": user_id}).sort("saved_at", -1)
        judgments = await cursor.to_list(length=100)
        for j in judgments:
            j["id"] = str(j.pop("_id"))
        return {"judgments": judgments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def save_judgment(judgment: JudgmentCreate, user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        db = get_db()
        
        new_judgment = {
            "user_id": user_id,
            "title": judgment.title,
            "summary": judgment.summary,
            "url": judgment.url,
            "saved_at": datetime.utcnow()
        }
        
        result = await db["judgments"].insert_one(new_judgment)
        new_judgment["id"] = str(result.inserted_id)
        new_judgment.pop("_id", None)
        return {"judgment": new_judgment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{judgment_id}")
async def delete_judgment(judgment_id: str, user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        db = get_db()
        from bson.objectid import ObjectId
        try:
            judgment_obj_id = ObjectId(judgment_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid judgment ID format")
            
        result = await db["judgments"].delete_one({"_id": judgment_obj_id, "user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Judgment not found or unauthorized")
            
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
