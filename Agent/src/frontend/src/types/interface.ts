// Định nghĩa kiểu dữ liệu cho thông điệp trong ChatBox (đã có trong ChatBox.tsx, có thể tái sử dụng)
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  attachments?: UploadedFile[];
}
  
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

export interface DocumentUploaderProps {
  onClose: () => void;
}

export interface ChatBoxProps {
  uploadedFiles: UploadedFile[];
  selectedFiles: UploadedFile[];
  onFileSelect: (file: UploadedFile) => void;
  onUploadClick: () => void;
}