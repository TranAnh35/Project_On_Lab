import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatBox } from './components/ChatBox';
import { DocumentUploader } from './components/DocumentUploader';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

function App() {
  const [showUploader, setShowUploader] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileUpload = (files: File[]) => {
    const newFiles = files.map(file => ({
      id: Date.now().toString(),
      name: file.name,
      size: file.size
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const handleFileDelete = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onUploadClick={() => setShowUploader(true)} />
      <ChatBox />
      
      {showUploader && (
        <DocumentUploader
          onClose={() => setShowUploader(false)}
          uploadedFiles={uploadedFiles}
          onFileUpload={handleFileUpload}
          onFileDelete={handleFileDelete}
        />
      )}
    </div>
  );
}

export default App;