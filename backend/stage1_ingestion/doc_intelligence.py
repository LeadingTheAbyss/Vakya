import os
import fitz  # PyMuPDF
import docx
from langdetect import detect

from stage1_ingestion.ocr_engine import extract_text_from_scanned_pdf, extract_text_from_image

def is_digital_pdf(pdf_path: str) -> bool:
    """Checks if a PDF contains selectable text."""
    doc = fitz.open(pdf_path)
    text_length = 0
    # Check first few pages
    for i in range(min(3, len(doc))):
        page = doc.load_page(i)
        text_length += len(page.get_text("text").strip())
    
    # If there is meaningful text, it's digital
    return text_length > 50

def extract_text_from_digital_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    return text

def extract_text_from_docx(docx_path: str) -> str:
    doc = docx.Document(docx_path)
    return "\n".join([para.text for para in doc.paragraphs])

def detect_document_language(text: str) -> str:
    """Detects the primary language of the text."""
    if not text.strip():
        return "unknown"
    try:
        # Detect on the first 1000 characters for speed
        return detect(text[:1000])
    except Exception:
        return "unknown"

def process_document(file_path: str) -> dict:
    """
    Main pipeline entrypoint for a document.
    Returns a dict with metadata and extracted text.
    """
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    doc_type = "unknown"
    
    if ext == ".pdf":
        if is_digital_pdf(file_path):
            doc_type = "digital_pdf"
            text = extract_text_from_digital_pdf(file_path)
        else:
            doc_type = "scanned_pdf"
            text = extract_text_from_scanned_pdf(file_path)
            
    elif ext in [".doc", ".docx"]:
        doc_type = "digital_docx"
        text = extract_text_from_docx(file_path)
        
    elif ext in [".png", ".jpg", ".jpeg"]:
        doc_type = "image"
        text = extract_text_from_image(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")
        
    language = detect_document_language(text)
    
    return {
        "file_path": file_path,
        "doc_type": doc_type,
        "language": language,
        "raw_text": text
    }
