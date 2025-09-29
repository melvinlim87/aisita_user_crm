import React, { createContext, useContext, useState } from 'react';
import { Message, Conversation } from '../types';
import { MOCK_CONVERSATION } from '../constants';

interface ChatContextType {
  currentConversation: Conversation | null;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  startNewConversation: (analysisId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(MOCK_CONVERSATION);
  const [isLoading, setIsLoading] = useState(false);

  const startNewConversation = (analysisId: string) => {
    const newConversation: Conversation = {
      id: 'conv-' + Date.now(),
      analysisId,
      messages: []
    };
    
    setCurrentConversation(newConversation);
  };

  const sendMessage = async (content: string) => {
    if (!currentConversation) return;
    
    setIsLoading(true);
    try {
      // Add user message
      const userMessage: Message = {
        id: 'msg-' + Date.now(),
        sender: 'user',
        content,
        timestamp: new Date().toISOString()
      };
      
      setCurrentConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, userMessage]
        };
      });
      
      // Simulate AI response delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate AI response
      const aiMessage: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        content: generateAIResponse(content),
        timestamp: new Date().toISOString()
      };
      
      setCurrentConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, aiMessage]
        };
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simple AI response generator for demo purposes
  const generateAIResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('rsi') || lowerCaseMessage.includes('relative strength')) {
      return `The RSI (Relative Strength Index) on this chart is showing a reading of 58, which is in the neutral territory but leaning bullish. This indicates moderate buying pressure. 

The RSI is not yet in overbought territory (typically above 70), so there's still room for the price to move higher before we might expect a reversal. However, watch for potential divergences where the price makes new highs but the RSI doesn't - this could signal weakening momentum.`;
    }
    
    if (lowerCaseMessage.includes('macd') || lowerCaseMessage.includes('moving average convergence')) {
      return `The MACD (Moving Average Convergence Divergence) indicator on this chart is showing a bullish crossover, with the MACD line crossing above the signal line. This typically indicates increasing bullish momentum.

The histogram is also gradually increasing in height, confirming the strengthening bullish momentum. This MACD signal, combined with the price action breaking above resistance, suggests a potential continuation of the uptrend.`;
    }
    
    if (lowerCaseMessage.includes('support') || lowerCaseMessage.includes('resistance')) {
      return `I've identified several key support and resistance levels on this chart:

1. **Major Support**: $41,200 - This level has been tested twice and held, showing strong buying interest.

2. **Minor Support**: $42,350 - Previous resistance that has now flipped to support.

3. **Current Resistance**: $44,500 - The price has struggled to break above this level on three occasions.

4. **Major Resistance**: $46,800 - The previous swing high that will likely act as strong resistance if the price moves up.

The current price action is consolidating between support at $42,350 and resistance at $44,500. A breakout from this range would likely signal the next significant move.`;
    }
    
    if (lowerCaseMessage.includes('trend') || lowerCaseMessage.includes('direction')) {
      return `The overall trend on this BTC/USD chart is bullish, as evidenced by:

1. **Higher Lows and Higher Highs**: The price is making a series of higher lows and higher highs, which is the definition of an uptrend.

2. **Moving Averages**: The price is trading above both the 50-period and 200-period EMAs, with the 50 EMA crossing above the 200 EMA (a bullish "golden cross").

3. **Trend Lines**: The ascending trend line connecting the recent lows remains intact.

4. **Volume Analysis**: Higher trading volumes during price advances compared to declines, indicating stronger buying pressure.

However, be cautious as the price approaches the major resistance level at $44,500, which could temporarily halt the uptrend if it fails to break through.`;
    }
    
    // Default response
    return `Based on my analysis of the chart, I can see several interesting patterns forming. The price action shows a consolidation phase after a period of upward momentum. 

Key technical indicators suggest moderately bullish sentiment, with the moving averages aligned in an upward configuration. Volume analysis indicates increased buyer interest during recent price advances.

What specific aspect of this chart would you like me to analyze in more detail? I can provide insights on trend direction, support/resistance levels, technical indicators, or potential trading strategies.`;
  };

  return (
    <ChatContext.Provider
      value={{
        currentConversation,
        isLoading,
        sendMessage,
        startNewConversation
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};