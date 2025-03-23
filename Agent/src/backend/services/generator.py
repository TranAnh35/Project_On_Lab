from models.llm import LLM

class GeneratorService:
    def __init__(self):
        self.llm = LLM()

    async def generate_content(self, prompt, tools_response: str = None) -> str:
        return await self.llm.generateContent(prompt, tools_response)