import os
import fitz  
from paddleocr import PaddleOCR
import logging

logger = logging.getLogger(__name__)

_ocr_instance = None

def get_ocr():
    global _ocr_instance
    if _ocr_instance is None:
        _ocr_instance = PaddleOCR(use_angle_cls=True, lang='en')
    return _ocr_instance

def extract_text_from_image(image_path: str) -> str:
    """Extracts text from a single image using PaddleOCR."""
    result = get_ocr().ocr(image_path, cls=True)
    if not result or result[0] is None:
        return ""
    
    text = ""
    for line in result[0]:
        
        text += line[1][0] + "\n"
    return text

def extract_text_from_scanned_pdf(pdf_path: str) -> str:
    """Converts a scanned PDF to images and extracts text using PaddleOCR."""
    doc = fitz.open(pdf_path)
    full_text = ""
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=300) 
        
        
        temp_img_path = f"{pdf_path}_page_{page_num}.png"
        pix.save(temp_img_path)
        
        
        try:
            page_text = extract_text_from_image(temp_img_path)
            full_text += page_text + "\n"
        finally:
            if os.path.exists(temp_img_path):
                os.remove(temp_img_path)
                
    return full_text
