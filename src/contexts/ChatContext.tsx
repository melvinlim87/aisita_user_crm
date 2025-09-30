import React, { createContext, useContext, useState, useEffect } from 'react';
import { Conversation } from '@/types/common/ChatContext';

interface ChatContextType {
  currentConversation: Conversation | null;
  isLoading: boolean;
  selectedModel: string | null;
  sessionId: number | null;
  setSessionId: (id: number) => void;
  setSelectedModel: (modelId: string) => void;
  sendMessage: (content: string, modelId?: string, isAiResponse?: boolean, isLoading?: boolean) => Promise<string>;
  startNewConversation: (analysisId: string) => void;
  clearConversation: () => void;
  addHistoryMessages: (initialMessage: string, messages: Array<{content: string, sender: 'user' | 'ai', modelId?: string}>) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  // Load saved conversation and session ID on component mount
  useEffect(() => {
    const savedConversation = localStorage.getItem('chatConversation');
    const savedSessionId = localStorage.getItem('chatSessionId');
    const savedSelectedModel = localStorage.getItem('selectedModel');
    
    if (savedConversation) {
      setCurrentConversation(JSON.parse(savedConversation));
    }
    
    if (savedSessionId) {
      setSessionId(parseInt(savedSessionId));
    }
    
    if (savedSelectedModel) {
      setSelectedModel(savedSelectedModel);
    }
  }, []);
  
  // Save conversation and session ID whenever they change
  useEffect(() => {
    if (currentConversation) {
      localStorage.setItem('chatConversation', JSON.stringify(currentConversation));
    }
    
    if (sessionId) {
      localStorage.setItem('chatSessionId', sessionId.toString());
    }
    
    if (selectedModel) {
      localStorage.setItem('selectedModel', selectedModel);
    }
  }, [currentConversation, sessionId, selectedModel]);

  const startNewConversation = (analysisId: string) => {
    const newConversation: Conversation = {
      id: 'conv-' + Date.now(),
      analysisId,
      messages: []
    };
    
    setCurrentConversation(newConversation);
    setSessionId(null);
    localStorage.removeItem('chatSessionId');
    localStorage.removeItem('chatConversation');
    localStorage.removeItem('selectedModel');
    // Keep chartPreview when starting a new conversation
    // We want the chart to persist even when starting a new chat
  };
  
  const clearConversation = () => {
    setCurrentConversation(null);
    setSessionId(null);
    localStorage.removeItem('chatSessionId');
    localStorage.removeItem('chatConversation');
    localStorage.removeItem('selectedModel');
    localStorage.removeItem('chartPreview');
    localStorage.removeItem('chartAnalysisHistoryId');
    
    // Notify components about the chart being cleared
    window.dispatchEvent(new Event('chartPreviewUpdate'));
    
    // Dispatch specific event to clear chart in ChartAnalysis component
    console.log('Dispatching clearChartFromConversation event');
    window.dispatchEvent(new Event('clearChartFromConversation'));
  };

  const sendMessage = async (content: string, modelId?: string, isAiResponse = false, isLoading = false): Promise<string> => {
    if (!currentConversation) {
      // Check if we have a saved history ID to use
      const savedHistoryId = localStorage.getItem('chartAnalysisHistoryId');
      startNewConversation(savedHistoryId || 'analysis-' + Date.now());
    }
    
    setIsLoading(true);
    try {
      const messageId = 'msg-' + Date.now();
      const message = {
        id: messageId,
        sender: isAiResponse ? 'ai' : 'user',
        content,
        timestamp: new Date().toISOString(),
        ...(modelId ? { modelId } : {}),
        ...(isLoading ? { isLoading } : {})
      } as const;
      
      setCurrentConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, message]
        };
      });
      
      return messageId;
    } catch (error) {
      console.error('Failed to send message:', error);
      return 'error-' + Date.now();
    } finally {
      if (!isLoading) {
        setIsLoading(false);
      }
    }
  };


  // Add history messages directly to the conversation state without using sendMessage
  // This prevents multiple reloads and message overwriting
  const addHistoryMessages = (initialMessage: string, messages: Array<{content: string, sender: 'user' | 'ai', modelId?: string}>) => {
    if (!currentConversation) {
      // Get the analysis ID from the URL or localStorage
      const savedHistoryId = localStorage.getItem('chartAnalysisHistoryId');
      startNewConversation(savedHistoryId || 'history-' + Date.now());
    }
    
    // First, add the initial AI analysis message
    const initialMessageObj = {
      id: 'initial-' + Date.now(),
      sender: 'ai',
      content: initialMessage,
      timestamp: new Date().toISOString(),
      modelId: selectedModel || undefined
    } as const;
    
    // Then add all the chat messages
    const formattedMessages = messages.map((msg, index) => ({
      id: `history-${Date.now()}-${index}`,
      sender: msg.sender,
      content: msg.content,
      timestamp: new Date(Date.now() + index * 1000).toISOString(), // Ensure proper ordering
      modelId: msg.modelId || selectedModel || undefined
    }));
    
    // Update the conversation state with all messages at once
    setCurrentConversation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [initialMessageObj, ...formattedMessages]
      };
    });
  };

  return (
    <ChatContext.Provider
      value={{
        currentConversation,
        isLoading,
        selectedModel,
        sessionId,
        setSessionId,
        setSelectedModel,
        sendMessage,
        startNewConversation,
        clearConversation,
        addHistoryMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  ) as React.ReactElement;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};