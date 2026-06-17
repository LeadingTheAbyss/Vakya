import os
import fitz  
import logging
from PIL import Image
import base64
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)

def extract_text_from_image(image_path: str) -> str:
    """Extracts text from a single image using Gemini via LangChain."""
    try:
        llm = ChatGroq(model="llama-3.2-11b-vision-preview")
        
        # We need to make sure the image is saved properly and we can read it as bytes
        with open(image_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            
        message = HumanMessage(
            content=[
                {"type": "text", "text": "Extract all the text from this image exactly as written. Output ONLY the extracted text, no commentary."},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_data}"}}
            ]
        )
        response = llm.invoke([message])
        return response.content
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
