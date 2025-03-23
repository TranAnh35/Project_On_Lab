import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatBox } from './components/ChatBox';
import { DocumentUploader } from './components/DocumentUploader';

function App() {
  const [showUploader, setShowUploader] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onUploadClick={() => setShowUploader(true)} />
      <ChatBox />
      
      {showUploader && (
        <DocumentUploader
          onClose={() => setShowUploader(false)}
        />
      )}
    </div>
  );
}

export default App;