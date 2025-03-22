from fastapi import APIRouter
from services.rag import RAGService

router = APIRouter()
rag_service = RAGService()

@router.get("/query")
async def rag_query(question: str):
    return {"response": await rag_service.query(question)}