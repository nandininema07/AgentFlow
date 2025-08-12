# api/file_controller.py
import os
from typing import (
    Dict,  # Add this import at the top
    List,
)

from api import file_service  # Import the file service
from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile):
    """Uploads a file and returns its URL."""
    try:
        return await file_service.upload_file(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[str])
async def list_files():
    """Lists all uploaded files."""
    return await file_service.list_files()


@router.delete("/", response_model=Dict[str, str])
async def delete_all_files(background_tasks: BackgroundTasks):
    """Deletes all uploaded files in the background."""
    background_tasks.add_task(file_service.delete_all_files)
    return {"message": "Deletion of all files started in the background."}
