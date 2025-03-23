// Định nghĩa kiểu dữ liệu cho phản hồi từ endpoint /generate/content
export interface GenerateContentResponse {
  content: string;
}

// Phản hồi từ RAG API
export interface RAGResponse {
  response: string;
}