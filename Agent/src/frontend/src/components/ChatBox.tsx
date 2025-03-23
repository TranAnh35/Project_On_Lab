import React, { useState, useEffect, useCallback } from 'react';
import { Send, Square, X, Paperclip, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Message } from '../types/interface';
import { generateContent } from '../services/api';
import { ChatBoxProps } from '../types/interface';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';

export const ChatBox: React.FC<ChatBoxProps> = ({ uploadedFiles, selectedFiles, onFileSelect, onUploadClick }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedContent, setDisplayedContent] = useState<string>(''); // Nội dung hiển thị dần
  const [stoppedContent, setStoppedContent] = useState<string | null>(null);
  const [currentBotMessage, setCurrentBotMessage] = useState<Message | null>(null); // Tin nhắn bot đang hiển thị
  const [isTyping, setIsTyping] = useState(false); // Trạng thái đang in kết quả
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [chatFiles, setChatFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles);
    setChatFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt', '.md'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await generateContent(input);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        sender: 'bot',
        timestamp: new Date(),
      };
      setCurrentBotMessage(botMessage);
      setDisplayedContent('');
      setIsTyping(true); // Bắt đầu quá trình in
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, something went wrong.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setChatFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleWebSearch = () => {
    setIsWebSearchEnabled(!isWebSearchEnabled);
  };

  const handleStopTyping = () => {
    setIsTyping(false);
    setStoppedContent(displayedContent); // Lưu nội dung đã hiển thị trước khi dừng
  };

  // Hiệu ứng typewriter
  useEffect(() => {
    if (isTyping && currentBotMessage && displayedContent !== currentBotMessage.content) {
      const timer = setTimeout(() => {
        setDisplayedContent((prev) =>
          currentBotMessage.content.slice(0, prev.length + 1)
        );
      }, 0.1); // Tốc độ gõ
      return () => clearTimeout(timer);
    } else if (isTyping && currentBotMessage && displayedContent === currentBotMessage.content) {
      // Nội dung đã hiển thị đầy đủ, tự động chuyển isTyping thành false
      setIsTyping(false);
    }
    // Không tự động đặt isTyping thành false khi in hết để người dùng có thể dừng bất cứ lúc nào
  }, [currentBotMessage, displayedContent, isTyping]);

  const renderContent = (content: string, isTypingContent: boolean = false) => {
    const displayText = isTypingContent ? displayedContent : content;
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    const elements = [];

    displayText.replace(codeBlockRegex, (match, lang, code, index) => {
      if (index > lastIndex) {
        const textBefore = displayText.slice(lastIndex, index);
        elements.push(
          <div key={`${lastIndex}-text`} className="leading-relaxed">
            <ReactMarkdown
              components={{
                ul: ({ node, ...props }) => <ul className="list-disc pl-5" {...props} />,
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
              }}
            >
              {textBefore}
            </ReactMarkdown>
          </div>
        );
      }

      elements.push(
        <SyntaxHighlighter
          key={index}
          language={lang || 'text'}
          style={solarizedlight}
          customStyle={{ margin: '0.5rem 0' }}
        >
          {code.trim()}
        </SyntaxHighlighter>
      );

      lastIndex = index + match.length;
      return match;
    });

    if (lastIndex < displayText.length) {
      const remainingText = displayText.slice(lastIndex);
      elements.push(
        <div key={`${lastIndex}-text`} className="leading-relaxed">
          <ReactMarkdown
            components={{
              ul: ({ node, ...props }) => <ul className="list-disc pl-5" {...props} />,
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
            }}
          >
            {remainingText}
          </ReactMarkdown>
        </div>
      );
    }

    return elements.length > 0 ? elements : (
      <div className="leading-relaxed">
        <ReactMarkdown
          components={{
            ul: ({ node, ...props }) => <ul className="list-disc pl-5" {...props} />,
            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
          }}
        >
          {displayText}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] pt-16">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm opacity-80">Attached files:</p>
                  {message.attachments.map((file) => (
                    <div key={file.id} className="text-sm opacity-90">
                      📎 {file.name}
                    </div>
                  ))}
                </div>
              )}
              {message === currentBotMessage
                ? renderContent(isTyping ? displayedContent : stoppedContent || currentBotMessage.content)
                : renderContent(message.content)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-lg p-3 bg-gray-100 flex items-center justify-center">
              <div className="loader" />
            </div>
          </div>
        )}
      </div>
      
      {showFileSelector && (
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Select Files</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFileSelector(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className={`p-2 rounded cursor-pointer ${
                  selectedFiles.some((f) => f.id === file.id)
                    ? 'bg-blue-100'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => onFileSelect(file)}
              >
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-200 bg-white p-4" {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="flex flex-col space-y-2 max-w-4xl mx-auto">
          {chatFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chatFiles.map((file, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center space-x-1"
                >
                  <span className="truncate max-w-xs">{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div 
            className={`flex items-center space-x-2 rounded-xl p-2 border transition-colors duration-200 ${
              isDragActive 
                ? 'bg-blue-50 border-blue-300' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                className="shrink-0 hover:bg-gray-200"
              >
                <Paperclip className="h-5 w-5 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleWebSearch}
                className={`shrink-0 transition-colors duration-200 ${
                  isWebSearchEnabled 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'hover:bg-gray-200'
                }`}
              >
                <Globe className="h-5 w-5" />
              </Button>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (isTyping ? handleStopTyping() : handleSend())}
              placeholder={isWebSearchEnabled ? "Search the web..." : "Message Gemini"}
              className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-900 placeholder-gray-500 text-sm outline-none"
              onClick={(e) => e.stopPropagation()}
              disabled={isLoading}
            />
            {isTyping ? (
              <Button 
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStopTyping();
                }} 
                className="shrink-0 text-white rounded-lg bg-blue-600 hover:bg-blue-700"
                size="icon"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSend();
                }} 
                className="shrink-0 text-white rounded-lg bg-blue-600 hover:bg-blue-700"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};