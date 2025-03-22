from fastapi import APIRouter, UploadFile, File, HTTPException
from services.file_manager import save_file, delete_file, list_files

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = save_file(file)
    return {"message": "File uploaded successfully", "file_path": file_path}

@router.get("/files")
async def get_files():
    return {"files": list_files()}

@router.delete("/delete/{file_name}")
async def delete_uploaded_file(file_name: str):
    if delete_file(file_name):
        return {"message": "File deleted successfully"}
    raise HTTPException(status_code=404, detail="File not found")
