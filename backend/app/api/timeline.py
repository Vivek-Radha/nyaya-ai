from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import get_current_user
from app.core.database import get_db
from datetime import datetime
from bson.objectid import ObjectId

router = APIRouter()

class TimelineEvent(BaseModel):
    case_id: str
    description: str
    event_date: str

@router.get("/{case_id}")
async def get_timeline(case_id: str, user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        db = get_db()
        cursor = db["timeline"].find({"case_id": case_id, "user_id": user_id}).sort("event_date", 1)
        events = await cursor.to_list(length=100)
        for e in events:
            e["id"] = str(e.pop("_id"))
        return {"timeline": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def add_timeline_event(event: TimelineEvent, user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        db = get_db()
        
        # Verify case ownership
        try:
            case_obj_id = ObjectId(event.case_id)
        except:
            case_obj_id = event.case_id
            
        case = await db["cases"].find_one({"_id": case_obj_id, "user_id": user_id})
        if not case:
            raise HTTPException(status_code=403, detail="Case not found or unauthorized")
            
        new_event = {
            "user_id": user_id,
            "case_id": str(case_obj_id),
            "description": event.description,
            "event_date": event.event_date,
            "created_at": datetime.utcnow()
        }
        
        result = await db["timeline"].insert_one(new_event)
        new_event["id"] = str(result.inserted_id)
        new_event.pop("_id", None)
        return {"event": new_event}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{event_id}")
async def delete_timeline_event(event_id: str, user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        db = get_db()
        
        try:
            event_obj_id = ObjectId(event_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid event ID format")
            
        result = await db["timeline"].delete_one({"_id": event_obj_id, "user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Timeline event not found or unauthorized")
            
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
