import React, { useState, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from './ui/button';
import { Message } from '../types/api';
import { generateContent } from '../services/api';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';

export const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedContent, setDisplayedContent] = useState<string>(''); // Nội dung hiển thị dần
  const [stoppedContent, setStoppedContent] = useState<string | null>(null);
  const [currentBotMessage, setCurrentBotMessage] = useState<Message | null>(null); // Tin nhắn bot đang hiển thị
  const [isTyping, setIsTyping] = useState(false); // Trạng thái đang in kết quả

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

      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (isTyping ? handleStopTyping() : handleSend())}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {isTyping ? (
            <Button variant="destructive" onClick={handleStopTyping}>
              <Square className="h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={handleSend} disabled={isLoading}>
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};