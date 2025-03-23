import api from '../lib/axios';
import { GenerateContentResponse } from '../types/api';
import { UploadedFile } from '../types/interface';

// Gọi API tạo nội dung từ LLM và RAG
export const generateContent = async (prompt: string): Promise<GenerateContentResponse> => {
  // Lấy thông tin từ RAG
  const ragResponse = await api.get<{ response: string }>('/rag/query', { params: { question: prompt } });
  
  // Lấy thông tin từ LLM
  const llmResponse = await api.get('/generate/content', { params: { prompt, tools_response: ragResponse.data.response } });
  
  return { content: llmResponse.data.content };
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
export const deleteFile = async (filename: string): Promise<void> => {
  const encodedFilename = encodeURIComponent(filename);
  await api.delete(`/files/delete/${encodedFilename}`);
};
