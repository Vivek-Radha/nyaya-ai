import pytesseract
from PIL import Image
import io

class OCRService:
    @staticmethod
    def extract_text_from_image(image_bytes: bytes) -> str:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            return f"OCR Failed: {str(e)}"
