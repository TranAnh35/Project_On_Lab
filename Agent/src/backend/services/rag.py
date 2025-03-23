import os
import sqlite3
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from models.llm import LLM

# Định nghĩa đường dẫn
DB_PATH = "vector_store.db"
FAISS_INDEX_PATH = "vector_index.faiss"
UPLOADED_FILES_DIR = "uploaded_files"

class RAGService:
    def __init__(self):
        self.llm = LLM()
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.index, self.dimension = self.load_faiss_index()
        self.conn = self.init_db()

    def init_db(self):
        """Khởi tạo SQLite database nếu chưa tồn tại."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_name TEXT UNIQUE,
                content TEXT
            )
        """)
        conn.commit()
        return conn

    def load_faiss_index(self):
        """Tải FAISS index nếu tồn tại, nếu không tạo mới."""
        dimension = 384  # all-MiniLM-L6-v2 có vector 384 chiều
        if os.path.exists(FAISS_INDEX_PATH):
            index = faiss.read_index(FAISS_INDEX_PATH)
        else:
            index = faiss.IndexFlatL2(dimension)
        return index, dimension

    def index_files(self):
        """Đọc file, lưu nội dung vào SQLite, nhúng vector vào FAISS."""
        cursor = self.conn.cursor()
        for file_name in os.listdir(UPLOADED_FILES_DIR):
            file_path = os.path.join(UPLOADED_FILES_DIR, file_name)

            # Kiểm tra nếu file đã được index rồi thì bỏ qua
            cursor.execute("SELECT file_name FROM documents WHERE file_name=?", (file_name,))
            if cursor.fetchone():
                continue

            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Nhúng vector
            vector = self.model.encode(content, convert_to_tensor=False).reshape(1, -1)
            self.index.add(vector)

            # Lưu vào SQLite
            cursor.execute("INSERT INTO documents (file_name, content) VALUES (?, ?)", (file_name, content))
            self.conn.commit()

        # Lưu FAISS index
        faiss.write_index(self.index, FAISS_INDEX_PATH)

    def retrieve_context(self, query):
        """Tìm kiếm file phù hợp nhất bằng FAISS."""
        query_vector = self.model.encode(query, convert_to_tensor=False).reshape(1, -1)
        _, indices = self.index.search(query_vector, 1)  # Lấy 1 kết quả gần nhất
        
        if indices[0][0] == -1:
            return "Không tìm thấy thông tin phù hợp."

        # Lấy nội dung từ SQLite
        cursor = self.conn.cursor()
        doc_id = int(indices[0][0]) + 1

        cursor.execute("SELECT content FROM documents WHERE id=?", (doc_id, ))
        result = cursor.fetchone()     
        print(result)

        return result[0] if result else "Không tìm thấy nội dung."

    async def query(self, question: str) -> str:
        """Tìm kiếm và sinh câu trả lời từ LLM."""
        context = self.retrieve_context(question)
        prompt = f"{context}\n\nCâu hỏi: {question}\nTrả lời:"
        return await self.llm.generate(prompt)
