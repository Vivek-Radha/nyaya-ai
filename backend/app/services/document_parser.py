import logging
from pathlib import Path
from typing import Dict, Any
import io

from app.services.ocr_service import OCRService

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import docx
except ImportError:
    docx = None

logger = logging.getLogger(__name__)

class DocumentParser:
    @staticmethod
    def parse_document(file_path: Path, mime_type: str) -> Dict[str, Any]:
        """
        Parses a document and returns a structured object.
        """
        ext = file_path.suffix.lower()
        
        result = {
            "text": "",
            "source_type": ext.lstrip('.'),
            "ocr_used": False,
            "page_count": 0,
            "error": None
        }

        try:
            if ext == '.pdf':
                result = DocumentParser._parse_pdf(file_path, result)
            elif ext == '.docx':
                result = DocumentParser._parse_docx(file_path, result)
            elif ext == '.txt':
                result = DocumentParser._parse_txt(file_path, result)
            elif ext in ['.png', '.jpg', '.jpeg', '.webp']:
                result = DocumentParser._parse_image(file_path, result)
            else:
                result["error"] = f"Unsupported file type: {ext}"
        except Exception as e:
            logger.exception(f"Parsing failed for {file_path}")
            result["error"] = str(e)

        return result

    @staticmethod
    def _parse_pdf(file_path: Path, result: Dict[str, Any]) -> Dict[str, Any]:
        if not fitz:
            result["error"] = "PyMuPDF not installed"
            return result

        try:
            doc = fitz.open(file_path)
            result["page_count"] = len(doc)
            
            text_parts = []
            needs_ocr = False
            
            # First pass: try fast text extraction
            for i, page in enumerate(doc):
                text = page.get_text()
                if text.strip():
                    text_parts.append(f"--- Page {i+1} ---\n{text.strip()}")
            
            extracted = "\n\n".join(text_parts)
            
            # If less than 50 chars per page on average, it's likely a scanned PDF
            if len(extracted.strip()) < (len(doc) * 50):
                needs_ocr = True
            
            if needs_ocr:
                logger.info(f"[DOC] PDF requires OCR: {file_path}")
                result["ocr_used"] = True
                ocr_parts = []
                for i, page in enumerate(doc):
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # Zoom for better OCR
                    img_bytes = pix.tobytes("png")
                    ocr_text = OCRService.extract_text_from_image(img_bytes)
                    if ocr_text:
                        ocr_parts.append(f"--- Page {i+1} ---\n{ocr_text.strip()}")
                result["text"] = "\n\n".join(ocr_parts)
            else:
                result["text"] = extracted
                
            doc.close()
        except Exception as e:
            logger.exception(f"PDF parsing error: {e}")
            result["error"] = str(e)
            
        return result

    @staticmethod
    def _parse_docx(file_path: Path, result: Dict[str, Any]) -> Dict[str, Any]:
        if not docx:
            result["error"] = "python-docx not installed"
            return result
            
        try:
            doc = docx.Document(file_path)
            parts = []
            
            # python-docx doesn't provide a perfect sequential read out of the box for mixed elements,
            # but we can read paragraphs and tables.
            for p in doc.paragraphs:
                if p.text.strip():
                    parts.append(p.text.strip())
                    
            for table in doc.tables:
                parts.append("--- Table ---")
                for row in table.rows:
                    row_data = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_data:
                        parts.append(" | ".join(row_data))
                        
            result["text"] = "\n\n".join(parts)
        except Exception as e:
            logger.exception(f"DOCX parsing error: {e}")
            result["error"] = str(e)
            
        return result

    @staticmethod
    def _parse_txt(file_path: Path, result: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Fallback reading
            try:
                result["text"] = file_path.read_text(encoding='utf-8')
            except UnicodeDecodeError:
                result["text"] = file_path.read_text(encoding='latin-1')
        except Exception as e:
            logger.exception(f"TXT parsing error: {e}")
            result["error"] = str(e)
        return result

    @staticmethod
    def _parse_image(file_path: Path, result: Dict[str, Any]) -> Dict[str, Any]:
        try:
            result["ocr_used"] = True
            with open(file_path, "rb") as f:
                img_bytes = f.read()
            result["text"] = OCRService.extract_text_from_image(img_bytes)
        except Exception as e:
            logger.exception(f"Image parsing error: {e}")
            result["error"] = str(e)
        return result
