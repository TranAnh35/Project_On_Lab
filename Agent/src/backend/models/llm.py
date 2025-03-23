import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

class LLM:
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    async def generateContent(self, prompt: str, tools_response: str = None) -> str:
        """Tạo nội dung từ prompt và thông tin từ RAG"""
        try:
            if tools_response:
                # Kết hợp prompt gốc với thông tin từ RAG
                combined_prompt = f"""Dựa trên thông tin sau đây, hãy trả lời câu hỏi một cách tự nhiên và đầy đủ:

                Thông tin từ tài liệu:
                {tools_response}

                Câu hỏi: {prompt}

                Hãy trả lời một cách tự nhiên, kết hợp thông tin từ tài liệu với kiến thức của bạn:"""
            else:
                combined_prompt = prompt

            # Gọi API để tạo nội dung
            response = await self.model.generate_content_async(combined_prompt)
            
            return response.text

        except Exception as e:
            print(f"Lỗi khi tạo nội dung: {str(e)}")
            return "Xin lỗi, tôi không thể tạo nội dung lúc này."