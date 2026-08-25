from typing import List, Dict, Any, Optional
from app.core.database import get_db

async def search_documents(query: str, user_id: str, case_id: Optional[str] = None) -> List[Dict]:
    db = get_db()
    # Basic text search using regex
    match_query = {
        "user_id": user_id, 
        "$or": [
            {"title": {"$regex": query, "$options": "i"}}, 
            {"content": {"$regex": query, "$options": "i"}}
        ]
    }
    if case_id:
        match_query["case_id"] = case_id
        
    cursor = db["documents"].find(match_query).limit(5)
    docs = await cursor.to_list(length=5)
    return [{"id": str(d["_id"]), "title": d.get("title", ""), "content": d.get("content", "")[:500]} for d in docs]

async def analyze_document(document_id: str, user_id: str) -> Dict[str, Any]:
    db = get_db()
    from bson.objectid import ObjectId
    try:
        obj_id = ObjectId(document_id)
    except Exception:
        obj_id = document_id
        
    doc = await db["documents"].find_one({"_id": obj_id, "user_id": user_id})
    if not doc:
        return {"error": "Document not found or unauthorized"}
    
    return {"title": doc.get("title"), "content": doc.get("content", "")[:2000], "type": doc.get("type", "Unknown")}

async def search_cases(query: str, user_id: str) -> List[Dict]:
    db = get_db()
    cursor = db["cases"].find({
        "user_id": user_id, 
        "$or": [
            {"title": {"$regex": query, "$options": "i"}}, 
            {"description": {"$regex": query, "$options": "i"}}
        ]
    }).limit(5)
    cases = await cursor.to_list(length=5)
    return [{"id": str(c["_id"]), "title": c.get("title"), "status": c.get("status")} for c in cases]

async def get_case_timeline(case_id: str, user_id: str) -> List[Dict]:
    db = get_db()
    from bson.objectid import ObjectId
    try:
        obj_id = ObjectId(case_id)
    except Exception:
        obj_id = case_id
        
    # Verify case belongs to user first
    case = await db["cases"].find_one({"_id": obj_id, "user_id": user_id})
    if not case:
        return [{"error": "Case not found or unauthorized."}]
        
    cursor = db["timeline"].find({"case_id": str(obj_id), "user_id": user_id}).sort("event_date", 1).limit(20)
    events = await cursor.to_list(length=20)
    if not events:
        return [{"message": "No timeline events found for this case."}]
    return [{"date": e.get("event_date"), "description": e.get("description")} for e in events]

def explain_legal_issue(issue: str, context: str) -> str:
    return f"Proceed to explain the issue '{issue}' in simple terms using context: {context}. Remember to state this is general info."

def draft_legal_document(document_type: str, case_context: str) -> str:
    return f"Draft a {document_type} based on: {case_context}. Make it professional."
