from fastapi import APIRouter
from services.web_search import WebSearchService

router = APIRouter()
web_service = WebSearchService()

@router.get("/search")
async def web_search(query: str):
    return {"results": await web_service.search(query)}