import api from '../lib/axios';
import { GenerateContentResponse, UploadedFile, RAGResponse } from '../types/api';

// Gọi API tạo nội dung từ LLM
export const generateContent = async (prompt: string): Promise<GenerateContentResponse> => {
  const response = await api.get('/generate/content', { params: { prompt } });
  return response.data;
};

// Gọi API lấy danh sách file đã upload
export const fetchFiles = async (): Promise<UploadedFile[]> => {
  const response = await api.get<{ files: UploadedFile[] }>("/files/files");
  return response.data.files;
};

// Upload file lên server
export const uploadFile = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  await api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // Sau khi upload, đồng bộ vào vector database
  await api.post("/rag/sync-files");
};

// Xóa file khỏi server
export const deleteFile = async (fileId: string): Promise<void> => {
  await api.delete(`/files/delete/${fileId}`);
};

// Gửi truy vấn RAG
export const queryRAG = async (question: string): Promise<RAGResponse> => {
  const response = await api.get<{ response: string }>('/rag/query', { params: { question } });
  return response.data;
};
