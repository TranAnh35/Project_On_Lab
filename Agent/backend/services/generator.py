from models.llm import LLM

class GeneratorService:
    def __init__(self):
        self.llm = LLM()

    async def generate_content(self, prompt: str) -> str:
        return await self.llm.generate(prompt)