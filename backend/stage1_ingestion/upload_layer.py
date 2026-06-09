import os
import shutil
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload_file(upload_file: UploadFile) -> str:
    """
    Saves an uploaded file to the local directory temporarily.
    """
    if not upload_file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    
    allowed_extensions = {".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"}
    ext = os.path.splitext(upload_file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File extension {ext} not allowed.")
    
    file_path = os.path.join(UPLOAD_DIR, upload_file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
    finally:
        upload_file.file.close()
        
    return file_path
