import os
import uuid
import logging
import mimetypes
from datetime import datetime
from fastapi import UploadFile, HTTPException
from pathlib import Path
from typing import List, Dict, Any, Optional

from app.core.database import get_db
import re
from app.services.document_parser import DocumentParser

try:
    import docx
except ImportError:
    docx = None

logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

class DocumentService:
    @staticmethod
    async def process_and_save_upload(file: UploadFile, user_id: str, conversation_id: str) -> Dict[str, Any]:
        """Validates, saves securely, extracts text, and logs metadata."""
        # 1. Validation
        ext = Path(file.filename or "").suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
            
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
            
        if file_size == 0:
            raise HTTPException(status_code=400, detail="File is empty")
            
        mime_type = mimetypes.guess_type(file.filename or "")[0] or "application/octet-stream"
        
        # 2. Secure Local Save
        internal_filename = f"{uuid.uuid4()}{ext}"
        save_path = UPLOAD_DIR / internal_filename
        
        try:
            with open(save_path, "wb") as f:
                f.write(file_content)
        except Exception as e:
            logger.exception("Failed to save file securely")
            raise HTTPException(status_code=500, detail="Failed to save file securely")
            
        # 3. Text Extraction via DocumentParser
        logger.info(f"[DOC] Upload received: {file.filename}")
        logger.info(f"[DOC] File type: {ext}")
        
        parse_result = DocumentParser.parse_document(save_path, mime_type)
        
        if parse_result.get("error"):
            logger.error(f"Document parsing failed: {parse_result['error']}")
            # We don't want to throw an error if it's just OCR failing, but if it completely failed:
            extracted_text = f"[Text extraction failed: {parse_result['error']}]"
        else:
            extracted_text = parse_result.get("text", "")
            
        logger.info(f"[DOC] Parser selected: {parse_result.get('source_type')}")
        logger.info(f"[DOC] OCR required: {parse_result.get('ocr_used')}")
        logger.info(f"[DOC] Extracted characters: {len(extracted_text)}")
            
        # 4. Save Metadata to MongoDB
        db = get_db()
        document_id = str(uuid.uuid4())
        metadata = {
            "document_id": document_id,
            "user_id": user_id,
            "conversation_id": conversation_id,
            "original_filename": file.filename,
            "internal_filename": internal_filename,
            "mime_type": mime_type,
            "file_size": file_size,
            "page_count": parse_result.get("page_count", 0),
            "ocr_used": parse_result.get("ocr_used", False),
            "text_length": len(extracted_text),
            "source_type": parse_result.get("source_type", ""),
            "created_at": datetime.utcnow(),
            "status": "processed"
        }
        
        await db["documents"].insert_one(metadata)
        logger.info(f"[DOC] Document stored: {document_id}")
        
        # PyMongo mutates the metadata dict and adds _id (ObjectId). 
        # We must remove or convert it before returning to FastAPI.
        metadata.pop("_id", None)
        
        # 5. Chunking and Storage
        if extracted_text:
            chunks = DocumentService._chunk_text(extracted_text)
            chunk_docs = []
            for i, chunk in enumerate(chunks):
                chunk_docs.append({
                    "document_id": document_id,
                    "user_id": user_id,
                    "chunk_index": i,
                    "text": chunk
                })
            
            if chunk_docs:
                await db["document_chunks"].insert_many(chunk_docs)
                logger.info(f"[DOC] Stored {len(chunk_docs)} chunks for document {document_id}")
        
        return {
            "metadata": metadata,
            "document_id": document_id
        }

    @staticmethod
    def _chunk_text(text: str, max_chunk_size: int = 2000) -> List[str]:
        """Splits text into meaningful chunks, separated by double newlines."""
        raw_chunks = text.split('\n\n')
        chunks = []
        current_chunk = ""
        for rc in raw_chunks:
            if len(current_chunk) + len(rc) > max_chunk_size:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = rc
            else:
                current_chunk += "\n\n" + rc if current_chunk else rc
        if current_chunk:
            chunks.append(current_chunk)
        return chunks
        
    @staticmethod
    async def get_user_documents(user_id: str, conversation_id: Optional[str] = None) -> List[Dict]:
        db = get_db()
        query = {"user_id": user_id}
        if conversation_id:
            query["conversation_id"] = conversation_id
            
        cursor = db["documents"].find(query).sort("created_at", -1)
        return await cursor.to_list(length=100)
