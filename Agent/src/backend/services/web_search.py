class WebSearchService:
    async def search(self, query: str) -> str:
        # Giả lập tìm kiếm web (có thể tích hợp API như Google Search)
        return f"Web search results for: {query}"