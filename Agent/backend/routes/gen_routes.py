from fastapi import APIRouter
from services.generator import GeneratorService

router = APIRouter()
gen_service = GeneratorService()

@router.get("/content")
async def generate_content(prompt: str):
    return {"content": await gen_service.generate_content(prompt)}