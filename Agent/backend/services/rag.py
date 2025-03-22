from models.llm import LLM

class RAGService:
    def __init__(self):
        self.llm = LLM()
        self.vector_store = {}  # Giả lập vector store cho RAG

    async def query(self, question: str) -> str:
        # Logic RAG: Retrieve + Generate
        context = "Sample context from vector store"
        prompt = f"{context}\nQuestion: {question}"
        return await self.llm.generate(prompt)