import os
import fitz  
import logging
from PIL import Image
from google import genai

logger = logging.getLogger(__name__)

def extract_text_from_image(image_path: str) -> str:
    """Extracts text from a single image using Gemini."""
    try:
        client = genai.Client()
        image = Image.open(image_path)
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[image, "Extract all the text from this image exactly as written. Output ONLY the extracted text, no commentary."]
        )
        return response.text
    except Exception as e:
        logger.error(f"Error extracting text with Gemini: {e}")
        return ""

def extract_text_from_scanned_pdf(pdf_path: str) -> str:
    """Converts a scanned PDF to images and extracts text using Gemini."""
    doc = fitz.open(pdf_path)
    full_text = ""
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=150) 
        
        temp_img_path = f"{pdf_path}_page_{page_num}.png"
        pix.save(temp_img_path)
        
        try:
            page_text = extract_text_from_image(temp_img_path)
            if page_text:
                full_text += page_text + "\n"
        finally:
            if os.path.exists(temp_img_path):
                os.remove(temp_img_path)
                
    return full_text
