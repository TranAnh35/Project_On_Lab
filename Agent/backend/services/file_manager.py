import os
from fastapi import UploadFile
from typing import List

UPLOAD_FOLDER = "uploaded_files"

# Tạo thư mục nếu chưa có
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def save_file(file: UploadFile) -> str:
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    return file_path

def delete_file(file_name: str) -> bool:
    file_path = os.path.join(UPLOAD_FOLDER, file_name)
    if os.path.exists(file_path):
        os.remove(file_path)
        return True
    return False

def list_files() -> List[dict]:
    files = []
    for file_name in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, file_name)
        size = os.path.getsize(file_path)
        files.append({"name": file_name, "size": size, "path": file_path})
    return files
