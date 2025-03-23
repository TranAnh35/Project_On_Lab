from fastapi import APIRouter, UploadFile, File
from services.pdf_reader import PdfReaderService

router = APIRouter()
pdf_service = PdfReaderService()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    with open(file.filename, "wb") as f:
        f.write(await file.read())
    text = await pdf_service.read_pdf(file.filename)
    return {"content": text}