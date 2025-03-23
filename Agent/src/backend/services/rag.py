import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from services.vector_db import VectorDB
from models.llm import LLM

FAISS_INDEX_PATH = "faiss_index.bin"
CHUNK_MAPPING_PATH = "chunk_mapping.npy"

class RAGService:
    def __init__(self):
        self.uploaded_files_dir = "uploaded_files"
        self.vector_db = VectorDB()
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.llm = LLM()
        self.chunk_id_mapping = []  # List để lưu mapping
        self.load_or_create_index()

    def load_or_create_index(self):
        """Tải hoặc tạo mới FAISS index và chunk mapping"""
        try:
            if os.path.exists(FAISS_INDEX_PATH) and os.path.exists(CHUNK_MAPPING_PATH):
                self.index = faiss.read_index(FAISS_INDEX_PATH)
                self.chunk_id_mapping = np.load(CHUNK_MAPPING_PATH).tolist()
                print("Đã tải FAISS index và chunk mapping")
            else:
                # Tạo index mới với kích thước vector phù hợp
                vector_size = self.model.get_sentence_embedding_dimension()
                self.index = faiss.IndexFlatL2(vector_size)
                self.chunk_id_mapping = []
                print("Đã tạo FAISS index mới")
        except Exception as e:
            print(f"Lỗi khi tải/tạo FAISS index: {str(e)}")
            raise

    def index_files(self):
        """Index tất cả các file trong thư mục uploaded_files"""
        try:
            # Lấy danh sách các file trong thư mục
            files = os.listdir(self.uploaded_files_dir)
            
            # Xóa index cũ và mapping cũ
            self.index = faiss.IndexFlatL2(self.model.get_sentence_embedding_dimension())
            self.chunk_id_mapping = []
            
            for file_name in files:
                if file_name.endswith(('.txt', '.pdf', '.doc', '.docx')):
                    file_path = os.path.join(self.uploaded_files_dir, file_name)
                    try:
                        # Xử lý file với VectorDB
                        self.vector_db.process_file(file_path)
                        
                        # Lấy chunks từ database
                        chunks = self.vector_db.get_chunks_by_file(file_name)
                        
                        # Xử lý từng chunk
                        for chunk_id, content, chunk_index in chunks:
                            # Tạo vector embedding
                            vector = self.model.encode(content, convert_to_tensor=False).reshape(1, -1)
                            self.index.add(vector)
                            # Lưu mapping giữa FAISS index và chunk_id
                            self.chunk_id_mapping.append(chunk_id)
                            
                    except Exception as e:
                        print(f"Lỗi khi xử lý file {file_name}: {str(e)}")
                        continue
            
            # Lưu FAISS index và chunk mapping
            faiss.write_index(self.index, FAISS_INDEX_PATH)
            np.save(CHUNK_MAPPING_PATH, np.array(self.chunk_id_mapping))
                    
        except Exception as e:
            print(f"Lỗi khi index files: {str(e)}")
            raise

    def retrieve_context(self, query):
        """Tìm kiếm file phù hợp nhất bằng FAISS."""
        try:
            # Tạo vector embedding cho câu hỏi
            query_vector = self.model.encode(query, convert_to_tensor=False).reshape(1, -1)
            
            # Tìm kiếm 3 kết quả gần nhất
            distances, indices = self.index.search(query_vector, 3)
            
            if indices[0][0] == -1 or len(self.chunk_id_mapping) == 0:
                return "Không tìm thấy thông tin phù hợp."

            # Lấy nội dung từ các chunks gần nhất
            contexts = []
            for idx in indices[0]:
                if idx != -1 and idx < len(self.chunk_id_mapping):
                    # Lấy chunk_id từ mapping
                    chunk_id = self.chunk_id_mapping[idx]
                    content = self.vector_db.get_chunk_by_id(chunk_id)
                    if content:
                        contexts.append(content)

            # Kết hợp các contexts thành một đoạn văn bản
            if contexts:
                return "\n".join(contexts)
            return "Không tìm thấy nội dung phù hợp."

        except Exception as e:
            print(f"Lỗi khi tìm kiếm context: {str(e)}")
            return "Có lỗi xảy ra khi tìm kiếm thông tin."

    async def query(self, question: str) -> str:
        """Tìm kiếm và sinh câu trả lời từ LLM."""
        try:
            # Lấy context từ FAISS
            context = self.retrieve_context(question)
            
            # Sử dụng generateContent với context từ RAG
            return context

        except Exception as e:
            print(f"Lỗi khi xử lý câu hỏi: {str(e)}")
            return "Xin lỗi, tôi không thể xử lý câu hỏi của bạn lúc này."
