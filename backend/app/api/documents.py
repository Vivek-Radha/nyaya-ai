from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from app.core.security import get_current_user
from app.core.database import get_db

router = APIRouter()

@router.get("/")
async def get_documents(user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        db = get_db()
        cursor = db["documents"].find({"user_id": user_id}).sort("created_at", -1)
        docs = await cursor.to_list(length=100)
        for d in docs:
            d["id"] = str(d.pop("_id"))
            # Don't send huge extracted text back to frontend list
            d.pop("content", None)
            d.pop("extracted_text", None) 
        return {"documents": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{document_id}")
async def delete_document(document_id: str, user: dict = Depends(get_current_user)):
    try:
        user_id = user.get("sub") or user.get("id")
        db = get_db()
        
        # Delete document metadata
        result = await db["documents"].delete_one({"document_id": document_id, "user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Document not found or unauthorized")
            
        # Cascade delete document chunks
        await db["document_chunks"].delete_many({"document_id": document_id, "user_id": user_id})
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{document_id}/view")
async def view_document(document_id: str, download: bool = False, user: dict = Depends(get_current_user)):
    try:
        from fastapi.responses import FileResponse
        from pathlib import Path
        import os
        
        user_id = user.get("sub") or user.get("id")
        db = get_db()
        
        doc = await db["documents"].find_one({"document_id": document_id, "user_id": user_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found or unauthorized")
            
        internal_filename = doc.get("internal_filename")
        if not internal_filename:
            raise HTTPException(status_code=404, detail="File path not found in database")
            
        file_path = Path("uploads") / internal_filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Physical file not found on server")
            
        original_filename = doc.get("original_filename", "document")
        media_type = doc.get("mime_type", "application/octet-stream")
        
        headers = {}
        if download:
            # Setting content-disposition to attachment forces a download
            headers["Content-Disposition"] = f'attachment; filename="{original_filename}"'
        else:
            headers["Content-Disposition"] = f'inline; filename="{original_filename}"'
            
        return FileResponse(
            path=str(file_path),
            media_type=media_type,
            headers=headers,
            filename=original_filename if download else None
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
