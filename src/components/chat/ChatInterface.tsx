import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronRight, Sparkles, Search, Zap } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import Message from './Message';
import Button from '../common/Button';
import Card from '../common/Card';
import { META_TEXT_GRADIENT, QUICK_ANALYSIS_PROMPTS } from '../../constants';

const ChatInterface: React.FC = () => {
  const { currentConversation, sendMessage, isLoading } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Technical Analysis');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim());
      setInputValue('');
      
      // Focus back on the input after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What trading pattern do you see forming?",
    "Analyze the RSI indicator",
    "Identify support and resistance levels",
    "What's the overall trend direction?"
  ];

  return (
    <Card 
      variant="elevated" 
      className="flex flex-col h-full border-l border-[#3a3a45]"
    >
      <div className="px-6 py-4 border-b border-[#3a3a45] space-y-3">
        <div>
          <h2 className={`text-lg font-semibold ${META_TEXT_GRADIENT}`}>
            Chart Analysis
          </h2>
          <p className="text-sm text-gray-400">
            Ask questions about the chart to receive AI-powered insights
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversation..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-[#25252d] border border-[#3a3a45] rounded-md py-1.5 pl-9 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#94a3b8]"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
        {currentConversation?.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-10">
            <div className="w-16 h-16 rounded-full bg-[#3a3a45] flex items-center justify-center mb-4">
              <Sparkles className={`w-8 h-8 ${META_TEXT_GRADIENT}`} />
            </div>
            <h3 className="text-lg font-medium mb-2">
              Ask about your financial chart
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-md">
              Get AI-powered insights on chart patterns, technical indicators, and potential trading strategies
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              {QUICK_ANALYSIS_PROMPTS.map(({ category }) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#3a3a45] text-white'
                      : 'text-gray-400 hover:bg-[#25252d]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 gap-2 w-full max-w-md">
              {QUICK_ANALYSIS_PROMPTS
                .find(p => p.category === selectedCategory)
                ?.prompts.map((prompt, index) => (
                <button
                  key={index}
                  className="text-left px-4 py-2.5 bg-[#2d2d36] rounded-md text-sm text-[#e2e8f0] hover:bg-[#3a3a45] transition-all duration-200 flex items-center justify-between group hover:scale-[1.02] glow-border"
                  onClick={() => {
                    setInputValue(prompt);
                    setTimeout(() => {
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    }, 0);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{prompt}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {currentConversation?.messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-[#3a3a45]">
        <div className="relative">
          <textarea
            ref={inputRef}
            className="w-full bg-[#25252d] border border-[#3a3a45] rounded-md py-3 px-4 pr-12 text-[#e2e8f0] placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-[#94a3b8] focus:border-[#94a3b8]"
            placeholder="Ask about the chart..."
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button
            variant="primary"
            size="sm"
            className="absolute right-2 bottom-2"
            onClick={handleSendMessage}
            isLoading={isLoading}
            disabled={inputValue.trim() === '' || isLoading}
            icon={!isLoading ? <Send className="w-4 h-4" /> : undefined}
          >
            {!isLoading && 'Send'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;