import React, { useState, useRef, useEffect } from 'react';
import { getRequest, postRequest } from '@/services/apiRequest';
import { Send, ChevronRight, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { useChat } from '@contexts/ChatContext';
import Card from '@components/common/Card';
import { META_TEXT_GRADIENT, QUICK_ANALYSIS_PROMPTS } from '../../constants';

interface Model {
  id: string;
  name: string;
  description?: string;
  premium?: boolean;
  creditCost?: number;
  beta?: boolean;
  provider?: string;
}

interface ChatInterfaceProps {
  externalModels?: Model[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ externalModels }) => {
  const { currentConversation, sendMessage, isLoading, selectedModel, setSelectedModel, sessionId, setSessionId, clearConversation } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Technical Analysis');
  const [tempLoadingMessage, setTempLoadingMessage] = useState(false);
  const [chartUploaded, setChartUploaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change or loading state changes
    setTimeout(scrollToBottom, 100);
  }, [currentConversation?.messages, tempLoadingMessage]);
  
  // Check for chart on mount and update when localStorage changes
  useEffect(() => {
    const checkForChart = () => {
      const hasChart = !!localStorage.getItem('chartPreview');
      setChartUploaded(hasChart);
      // Removed console.log to reduce console noise
    };
    
    // Check immediately on mount
    checkForChart();
    
    // Custom event for chart updates (within the same window)
    // Use 'any' type here to handle both CustomEvent and standard Event
    const handleChartUpdate = (_: any) => {
      console.log('Chart update event received');
      checkForChart();
    };
    
    // Storage event for changes from other windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chartPreview') {
        console.log('Storage changed for chartPreview');
        checkForChart();
      }
    };
    
    // Listen for both custom and storage events
    window.addEventListener('chartPreviewUpdate', handleChartUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    // Check again after a moment in case events were missed during page load
    const intervalId = setInterval(checkForChart, 1000);
    setTimeout(checkForChart, 100);
    setTimeout(checkForChart, 500);
    
    return () => {
      window.removeEventListener('chartPreviewUpdate', handleChartUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Use external models or fetch models if not provided
  useEffect(() => {
    const fetchModels = async () => {
      // If external models are provided, use them
      if (externalModels && externalModels.length > 0) {
        console.log('Using external models:', externalModels);
        setModels(externalModels);
        
        // Set first non-premium model as default if none selected
        if (!selectedModel) {
          const defaultModel = externalModels.find(model => !model.premium) || externalModels[0];
          if (defaultModel) {
            setSelectedModel?.(defaultModel.id);
          }
        }
        return;
      }
      
      // Otherwise fetch models from API
      setIsLoadingModels(true);
      try {
        console.log('Fetching models...');
        const response = await getRequest<Model[]>('/models');
        console.log('Models response:', response);
        if (response) {
          // Use all models from the endpoint
          setModels(response);
          
          // Set first non-premium model as default if available
          if (!selectedModel) {
            const defaultModel = response.find(model => !model.premium) || response[0];
            if (defaultModel) {
              setSelectedModel?.(defaultModel.id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };
    
    fetchModels();
  }, [externalModels, selectedModel, setSelectedModel]);

  useEffect(() => {
    // Focus on the input field when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading && selectedModel) {
      // Add user message to the UI
      sendMessage(inputValue.trim(), selectedModel);
      
      // Store the user message to clear input
      const userMessageContent = inputValue.trim();
      setInputValue('');
      
      // Focus back on the input after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
      
      // Show temporary loading indicator
      setTempLoadingMessage(true);
      
      try {
        // Create request payload for the new endpoint
        // Get chart analysis history_id from localStorage if available
        const chartAnalysisHistoryId = localStorage.getItem('chartAnalysisHistoryId');
        
        const requestBody = {
          modelId: selectedModel,
          analysisType: "Technical",
          // Include session_id if available for conversation continuity
          ...(sessionId ? { session_id: sessionId } : {}),
          // Include history_id if available for chart analysis reference
          ...(chartAnalysisHistoryId ? { history_id: parseInt(chartAnalysisHistoryId) } : {}),
          messages: [
            {
              role: "system",
              content: "You are a helpful trading assistant. Here is the recent chart analysis: Symbol: AUD/USD, Timeframe: 15M, Current Price: 0.7087"
            },
            {
              role: "user",
              content: userMessageContent
            }
          ]
        };
        
        // Send request to the new endpoint
        const response = await postRequest<{ assistant: string; session_id: number; metadata?: { model: string; token_usage: any } }>(
          '/openrouter/send-chat', 
          requestBody
        );
        
        // Add AI response to the UI
        if (response && response.assistant) {
          // Hide the temporary loading indicator
          setTempLoadingMessage(false);
          
          // Add the actual AI response
          await sendMessage(response.assistant, selectedModel, true);
          
          // Save the session_id from the response
          if (response.session_id) {
            setSessionId(response.session_id);
          }
          
          // Ensure chart upload state stays correct after sending message
          // This fixes the issue where chart state becomes false after AI response
          if (localStorage.getItem('chartPreview')) {
            setChartUploaded(true);
            console.log('Maintaining chart uploaded state: true');
          }
          
          // Ensure we scroll to the bottom after adding the new message
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error('Failed to get AI response:', error);
        setTempLoadingMessage(false);
        await sendMessage('Sorry, I encountered an error processing your request.', selectedModel, true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading && selectedModel) {
        handleSendMessage();
      }
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
      className="flex flex-col h-full border border-[#3a2a15] rounded-lg overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-[#3a2a15] bg-[#0b0b0e]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-lg font-semibold ${META_TEXT_GRADIENT}`}>
              Chart Analysis
            </h2>
            <p className="text-sm text-gray-400">
              Ask questions about the chart to receive AI-powered insights
            </p>
          </div>
          
          <button
            onClick={clearConversation}
            className="text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-900/20"
            title="Start a New Chat"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="h-[500px] overflow-y-auto p-4 bg-[#15120c] scrollbar-thin">
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
                      : 'text-gray-400 hover:bg-[#15120c]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 gap-2 w-full max-w-md">
              {suggestedQuestions.map((prompt, index) => (
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
              <div 
                key={message.id} 
                className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div className="relative">
                  <div 
                    className={`inline-block max-w-[100%] rounded-lg p-3 ${message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#0b0b0e] text-white border border-[#3a2a15]'}`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>
                  <div 
                    className={`absolute ${message.sender === 'user' ? 'right-0 -mr-2' : 'left-0 -ml-2'} -top-2 px-2 py-0.5 rounded-full text-xs font-medium ${message.sender === 'user' ? 'bg-blue-700 text-blue-100' : 'bg-emerald-700 text-emerald-100'}`}
                  >
                    {message.sender === 'user' ? 'You' : 'AI'}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Temporary loading indicator */}
            {tempLoadingMessage && (
              <div className="mb-4 text-left">
                <div className="relative">
                  <div className="inline-block max-w-[85%] rounded-lg p-3 bg-[#0b0b0e] text-white border border-[#3a2a15]">
                    <div className="whitespace-pre-wrap text-sm italic">
                      Thinking
                      <span className="inline-block animate-bounce mx-0.5">.</span>
                      <span className="inline-block animate-bounce mx-0.5" style={{ animationDelay: '0.2s' }}>.</span>
                      <span className="inline-block animate-bounce mx-0.5" style={{ animationDelay: '0.4s' }}>.</span>
                    </div>
                  </div>
                  <div className="absolute left-0 -ml-2 -top-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-700 text-emerald-100">
                    AI
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-3 bg-[#0b0b0e] border-t border-[#3a2a15]">
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>AI Model</span>
            {selectedModel && (
              <span>{models.find(m => m.id === selectedModel)?.creditCost} credits</span>
            )}
          </div>
          <select
            value={selectedModel || ''}
            onChange={(e) => setSelectedModel?.(e.target.value)}
            className="w-full bg-[#15120c] border border-[#3a2a15] rounded-md py-2 px-3 text-[#e2e8f0] text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            disabled={isLoadingModels}
          >
            {isLoadingModels ? (
              <option>Loading models...</option>
            ) : models.length > 0 ? (
              <>
                <optgroup label="Free Models" className="text-gray-300">
                  {models.filter(m => !m.premium).map((model) => (
                    <option key={model.id} value={model.id} title={model.description}>
                      {model.name} • {model.creditCost} credits
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Premium Models" className="text-gray-300">
                  {models.filter(m => m.premium).map((model) => (
                    <option key={model.id} value={model.id} title={model.description}>
                      {model.name} • {model.creditCost} credits
                    </option>
                  ))}
                </optgroup>
              </>
            ) : (
              <option>No models available</option>
            )}
          </select>
          {selectedModel && (
            <div className="text-xs text-gray-400">
              {models.find(m => m.id === selectedModel)?.description}
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <div className="flex">
          <textarea
            ref={inputRef}
            className="flex-grow bg-[#15120c] text-white text-sm rounded-l-lg px-4 py-2 outline-none resize-none border border-[#3a2a15] focus:border-blue-400"
            placeholder={chartUploaded ? "Ask about the chart..." : "Upload a chart first to start chatting"}
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || !chartUploaded}
          />
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || isLoading || !chartUploaded}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;