// Định nghĩa kiểu dữ liệu cho phản hồi từ endpoint /generate/content
export interface GenerateContentResponse {
  content: string;
}
  
// Định nghĩa kiểu dữ liệu cho thông điệp trong ChatBox (đã có trong ChatBox.tsx, có thể tái sử dụng)
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
}