# ai_agent_builder/file_service.py
import os
import uuid
from typing import List
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = "_data/uploaded"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

async def upload_file(file: UploadFile) -> dict:
    """Saves the uploaded file to disk and returns its metadata as JSON."""
    try:
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        file_size = os.path.getsize(file_path)

        # Return metadata as JSON
        return {
            "size": file_size,
            "path": file_path,
            "url": f"http://localhost:8000/public/{unique_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

async def list_files() -> List[str]:
    """Lists all uploaded files (just the filenames)."""
    try:
        return [f for f in os.listdir(UPLOAD_DIR) if os.path.isfile(os.path.join(UPLOAD_DIR, f))]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")

async def delete_all_files():
    """Deletes all files in the upload directory."""
    try:
        for filename in os.listdir(UPLOAD_DIR):
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
        print("All files deleted successfully.")
    except Exception as e:
        print(f"Error deleting files: {str(e)}")
