import api from '../lib/axios';
import { GenerateContentResponse, UploadedFile } from '../types/api';

export const generateContent = async (prompt: string): Promise<GenerateContentResponse> => {
  const response = await api.get('/generate/content', {
    params: { prompt },
  });
  return response.data;
};

export const fetchFiles = async (): Promise<UploadedFile[]> => {
  const response = await api.get<{ files: UploadedFile[] }>("/files/files");
  return response.data.files;
};

export const uploadFile = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  await api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteFile = async (fileId: string): Promise<void> => {
  await api.delete(`/files/delete/${fileId}`);
};