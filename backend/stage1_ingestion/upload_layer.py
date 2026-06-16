import os
import shutil
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = "/tmp/uploads"

def save_upload_file(upload_file: UploadFile) -> str:
    """
    Saves an uploaded file to the /tmp directory temporarily.
    /tmp is the only writable directory on Vercel serverless functions.
    """
    if not upload_file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Move makedirs inside the function so it doesn't run at import time
    # (which would crash Vercel's read-only filesystem on cold start)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

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
