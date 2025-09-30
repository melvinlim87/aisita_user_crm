import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { postRequest } from '@/services/apiRequest';
import { META_TEXT_GRADIENT } from '@/constants';
import { useTranslation } from 'react-i18next';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChartAnalysisChatProps {
  analysisId?: number;
  chartSymbol?: string;
  chartTimeframe?: string;
  selectedModel?: string;
}

const ChartAnalysisChat: React.FC<ChartAnalysisChatProps> = ({ 
  analysisId,
  chartSymbol = 'Unknown', 
  chartTimeframe = 'Unknown',
  // selectedModel = 'mistralai/mistral-small-3.2-24b-instruct:free' // Default model if none provided
  // selectedModel = 'meta-llama/llama-3.2-11b-vision-instruct:free'
  // selectedModel = 'deepseek/deepseek-r1-0528:free'
  // selectedModel = 'google/gemma-3-12b-it:free'
  selectedModel = 'qwen/qwen2.5-vl-32b-instruct:free'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input on mount and load saved messages
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Load saved chat messages from localStorage
    const savedMessages = localStorage.getItem('chatConversation');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert from {content, sender} format to {role, content} format
        const formattedMessages = parsedMessages.map((msg: any) => ({
          role: msg.sender === 'ai' ? 'assistant' : 'user',
          content: msg.content
        }));
        setMessages(formattedMessages);
        
        // Also load session ID if available
        const savedSessionId = localStorage.getItem('chartAnalysisSessionId');
        if (savedSessionId) {
          setSessionId(parseInt(savedSessionId, 10));
        }
      } catch (error) {
        console.error('Failed to load saved chat messages:', error);
      }
    }
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      // Add user message to UI
      const userMessage = inputValue.trim();
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setInputValue('');
      setIsLoading(true);
      
      let chartAnalysisData = localStorage.getItem('chartAnalysisData');
      console.log(chartAnalysisData)
      try {
        // Create request payload
        const requestBody = {
          modelId: selectedModel, // Use the selected model from props
          analysisType: "Technical",
          ...(sessionId ? { session_id: sessionId.toString() } : {}),
          ...(analysisId ? { history_id: analysisId.toString() } : {}),
          messages: [
            {
              role: "system",
              content: `You are a helpful trading assistant. Here is the recent chart analysis: \nChart Analysis: ${chartAnalysisData}`
            },
            {
              role: "user",
              content: userMessage
            }
          ]
        };
        console.log(requestBody)
        
        // Send request to the API
        const response = await postRequest<{ reply: string; session_id: number }>(
          '/openrouter/send-chat', 
          requestBody
        );
        console.log(response)
        
        // Add AI response to UI
        if (response && response.reply) {
          setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
          
          // Save session ID for conversation continuity
          if (response.session_id) {
            setSessionId(response.session_id);
            localStorage.setItem('chartAnalysisSessionId', response.session_id.toString());
          }
          
          // Save updated messages to localStorage
          const updatedMessages = [...messages, { role: 'user', content: userMessage }, { role: 'assistant', content: response.reply }];
          localStorage.setItem('chatConversation', JSON.stringify(
            updatedMessages.map(msg => ({
              content: msg.content,
              sender: msg.role === 'assistant' ? 'ai' : 'user',
              timestamp: new Date().toISOString()
            }))
          ));
        }
      } catch (error: any) {
        console.error('Failed to get AI response:', error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: error.response?.data?.message || t('ErrorGenericTrySupport') 
        }]);
      } finally {
        setIsLoading(false);
        // Re-focus on input after sending
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        handleSendMessage();
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem('chatConversation');
    localStorage.removeItem('chartAnalysisSessionId');
  };

  return (
    <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-semibold ${META_TEXT_GRADIENT}`}>{t('ChatDiscussion')}</h3>
        <button 
          onClick={clearChat}
          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
          aria-label={t('ClearChat')}
          title={t('ClearChat')}
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      {/* Messages container */}
      <div className="h-[250px] overflow-y-auto mb-4 bg-[#25252d] rounded-lg p-3">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center py-4">
            {t('AskQuestionsAboutAnalysis')}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-900/30 ml-8' 
                    : 'bg-gray-800 mr-8'
                }`}
              >
                <div className="text-sm font-semibold mb-1">
                  {msg.role === 'user' ? t('YouLabel') : t('AIAssistant')}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-800 mr-8 p-3 rounded-lg">
                <div className="text-sm font-semibold mb-1">{t('AIAssistant')}</div>
                <div className="flex space-x-1 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="flex items-center bg-[#25252d] rounded-lg overflow-hidden">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('AskQuestionAboutChartPlaceholder')}
          className="flex-1 bg-transparent border-none text-sm p-3 focus:outline-none resize-none h-[42px] max-h-[120px]"
          style={{ minHeight: '42px' }}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className={`p-3 text-white ${
            !inputValue.trim() || isLoading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'opacity-100 cursor-pointer'
          }`}
          aria-label={t('SendMessage')}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Chart Discussion Buttons Section */}
      <div className="mt-4 border-t border-[#3a3a45] pt-4">
        <h3 className="text-sm font-medium text-white mb-3">✅ {t('ChartDiscussionButtons')}</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setInputValue(t('Btn_BuyTradeNow'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            🟢 {t('Btn_BuyTradeNow')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_WaitRetestSupport'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            📉 {t('Btn_WaitRetestSupport')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_CloseIfBreaksBelow'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            ⚠️ {t('Btn_CloseIfBreaksBelow')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_WhenSetTP'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            🎯 {t('Btn_WhenSetTP')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_TightenOrWidenSL'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            🛑 {t('Btn_TightenOrWidenSL')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_TrustBuySignalWithoutConf'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            📊 {t('Btn_TrustBuySignalWithoutConf')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_FollowRiskReward'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            💬 {t('Btn_FollowRiskReward')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_StrongReversalOrPullback'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            🔍 {t('Btn_StrongReversalOrPullback')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_WhichTimeframe'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            🧭 {t('Btn_WhichTimeframe')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_WaitMoreBullish'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            📈 {t('Btn_WaitMoreBullish')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_SellTradeNow'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            📉 {t('Btn_SellTradeNow')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_WaitRetestResistance'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            🔄 {t('Btn_WaitRetestResistance')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_CloseIfBreaksAbove'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            ⚠️ {t('Btn_CloseIfBreaksAbove')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_WaitMoreBearish'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            📉 {t('Btn_WaitMoreBearish')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_SpotChartPatterns'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            📊 {t('Btn_SpotChartPatterns')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_WhatIndicatorsSuggest'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            📈 {t('Btn_WhatIndicatorsSuggest')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_AnyDivergence'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            🔍 {t('Btn_AnyDivergence')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_CompareStructureVsAnalysis'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            ⚖️ {t('Btn_CompareStructureVsAnalysis')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_AnyNewsEvents'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            📰 {t('Btn_AnyNewsEvents')}
          </button>
          
          <button
            onClick={() => setInputValue(t('Btn_WouldYouSuggestTrading'))}
            className="px-3 py-2 bg-[#25252d] hover:bg-[#2d2d36] text-white text-xs rounded-md transition-colors flex items-center"
          >
            💡 {t('Btn_WouldYouSuggestTrading')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartAnalysisChat;
