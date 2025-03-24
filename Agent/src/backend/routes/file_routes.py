from fastapi import APIRouter, UploadFile, File, HTTPException
from services.file_manager import save_file, delete_file, list_files, read_uploaded_file
from services.vector_db import VectorDB
from urllib.parse import unquote

router = APIRouter()
vector_db = VectorDB()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = save_file(file)
    return {"message": "File uploaded successfully", "file_path": file_path}

@router.get("/files")
async def get_files():
    return {"files": list_files()}

@router.delete("/delete/{file_name}")
async def delete_uploaded_file(file_name: str):
    decoded_filename = unquote(file_name)
    print("delete file: " + decoded_filename)
    
    # Xóa file khỏi hệ thống
    if delete_file(decoded_filename):
        # Xóa dữ liệu khỏi database
        vector_db.delete_file_from_db(decoded_filename)
        return {"message": "File deleted successfully"}
    raise HTTPException(status_code=404, detail="File not found")

@router.post("/read")
async def read_file(file: UploadFile = File(...)):
    """
    Đọc nội dung file được gửi trực tiếp từ frontend.
    """
    try:
        content = await read_uploaded_file(file)
        return {"file_name": file.filename, "content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")