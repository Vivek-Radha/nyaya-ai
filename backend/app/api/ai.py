from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from app.services.ai_engine import AIEngine
from app.services.ocr_service import OCRService
from app.core.security import get_current_user
from app.ai.graph import run_agent
from app.ai.schemas import AIChatRequest, AIChatResponse
import uuid

router = APIRouter()

class DraftRequest(BaseModel):
    case_details: str
    document_type: str

import logging

logger = logging.getLogger(__name__)

from fastapi import Form
from typing import List, Optional
from app.services.document_service import DocumentService

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    conversation_id: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    try:
        user_id = user.get("sub") or user.get("id")
        convo_id = conversation_id or str(uuid.uuid4())
        
        doc_result = await DocumentService.process_and_save_upload(file, user_id, convo_id)
        
        return {
            "document_id": doc_result["document_id"],
            "conversation_id": convo_id,
            "metadata": doc_result["metadata"]
        }
    except HTTPException as he:
        logger.error(f"HTTPException during file upload: {he.detail}")
        raise he
    except Exception as e:
        logger.exception(f"Unexpected error processing document {file.filename}")
        raise HTTPException(status_code=500, detail="Document uploaded, but readable text could not be extracted.")

@router.post("/chat")
async def chat_with_ai(
    message: str = Form(...),
    conversation_id: Optional[str] = Form(None),
    document_id: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    try:
        user_id = user.get("sub") or user.get("id")
        logger.info(f"Ask AI Request received for user_id={user_id}")
        logger.info(f"Query: {message}")
        
        convo_id = conversation_id or str(uuid.uuid4())
        
        logger.info("[AI] Request received")
        
        # If document_id is provided, add it to the conversation state
        from app.core.database import get_db
        db = get_db()
        
        conversation = await db["conversations"].find_one({"conversation_id": convo_id, "user_id": user_id})
        messages = conversation.get("messages", []) if conversation else []
        active_document_ids = conversation.get("document_ids", []) if conversation else []
        
        if document_id and document_id not in active_document_ids:
            active_document_ids.append(document_id)
            
        attachment_metadata = [{"document_id": did} for did in active_document_ids]
        if attachment_metadata:
            logger.info(f"[AI] Using attached document_ids: {active_document_ids}")
            
        logger.info("[AI] LangGraph started")
        
        response = await run_agent(
            user_id=user_id,
            message=message,
            conversation_id=convo_id,
            messages=messages,
            attachments=attachment_metadata,
            document_text=None # Deprecated, chunks will be retrieved in graph
        )
        
        if response.get("error"):
            logger.error(f"[AI] LangGraph returned error: {response['error']}")
            return {"error": response["error"]}
            
        logger.info(f"[AI] Response returned to frontend. Intent: {response.get('intent')}")
        
        new_messages = messages + [
            {"role": "user", "content": message},
            {"role": "assistant", "content": response.get("response", "")}
        ]
        
        from datetime import datetime
        await db["conversations"].update_one(
            {"conversation_id": convo_id, "user_id": user_id},
            {"$set": {
                "messages": new_messages,
                "document_ids": active_document_ids,
                "updated_at": datetime.utcnow()
            }},
            upsert=True
        )
        
        return {
            "conversation_id": convo_id,
            "message": response.get("response", ""),
            "sources": response.get("sources", []),
            "intent": response.get("intent", "unknown"),
            "actions": response.get("actions", []),
            "disclaimer": response.get("disclaimer", "")
        }
    except Exception as e:
        logger.exception("Full exception traceback in Ask AI endpoint:")
        return {"error": str(e)}

@router.post("/draft")
def generate_draft(request: DraftRequest, user: dict = Depends(get_current_user)):
    try:
        response = AIEngine.generate_draft(request.case_details, request.document_type)
        return {"draft": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ocr")
def process_document(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    content = file.file.read()
    text = OCRService.extract_text_from_image(content)
    return {"extracted_text": text}

@router.get("/conversations")
async def get_conversations(user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        from app.core.database import get_db
        db = get_db()
        cursor = db["conversations"].find({"user_id": user_id}).sort("updated_at", -1)
        conversations = await cursor.to_list(length=50)
        for c in conversations:
            c.pop("_id", None)
        return {"conversations": conversations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        from app.core.database import get_db
        db = get_db()
        conversation = await db["conversations"].find_one({"conversation_id": conversation_id, "user_id": user_id})
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        conversation.pop("_id", None)
        return {"conversation": conversation}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        from app.core.database import get_db
        db = get_db()
        result = await db["conversations"].delete_one({"conversation_id": conversation_id, "user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
