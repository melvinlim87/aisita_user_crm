import React, { useState, useEffect, useRef } from 'react';
import { Code, Send, ChevronDown } from 'lucide-react';
import { getRequest, postRequest } from '@/services/apiRequest';
import { Message, Model } from '@/types/pages/EAGenerator';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface AnalysisHistoryMessage {
    id: number;
    chat_session_id: number;
    user_id: number;
    history_id: number;
    sender: 'user' | 'assistant';
    status: string;
    text: string;
    metadata: {
      model: string;
      token_usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
      analysis_type: string;
      chart_analysis?: any;
    };
    timestamp: string;
    created_at: string;
    updated_at: string;
  }

interface AnalysisHistoryData {
    id: number;
    user_id: number;
    title: string;
    type: string;
    model: string;
    content: string;
    chart_urls: string[];
    timestamp: string;
    created_at: string;
    updated_at: string;
    chat_messages: AnalysisHistoryMessage[];
  }

const EAGenerator: React.FC = () => {
    const { id: analysisId } = useParams<{ id?: string }>();
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [models, setModels] = useState<Model[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const historyLoadedRef = useRef(false);
      
      
    const fetchAnalysisHistory = async (historyId: string) => {
        if (!historyId) {
          console.log('No history ID provided');
          return;
        }
        
        try {
          const response = await getRequest<AnalysisHistoryData>(`/history/${historyId}`);
          
          if (!response) {
            console.log('No response received from the server');
            return;
          }
          
          console.log('History data loaded:', response);
          // push content to message, message from ai
          setMessages(prev => [
            ...prev,
            {
              id: '2',
              content: response.title,
              sender: 'user',
              timestamp: new Date()
            },
            {
              id: '3',
              content: JSON.parse(response.content).code,
              sender: 'ai',
              timestamp: new Date()
            }
          ]);
        } catch (error) {
          console.error('Failed to fetch analysis history:', error);
          setError(t('FailedToLoadAnalysisHistory'));
        } finally {
        //   setIsLoadingHistory(false);
        }
      };
      
      // Load saved data or history data on component mount
      useEffect(() => {
        // If we have an analysis ID from the URL, load the history
        if (analysisId && !historyLoadedRef.current) {
          console.log('Loading analysis history for ID:', analysisId);
          historyLoadedRef.current = true;
        //   setIsLoadingHistory(true);
          fetchAnalysisHistory(analysisId);
        } 
        // Otherwise load from localStorage as before
        else if (!analysisId) {
          // Load chart preview
          const savedChartPreview = localStorage.getItem('chartAnalysisPreview');
          if (savedChartPreview) {
            try {
              // Try to parse as JSON array
              const parsedData = JSON.parse(savedChartPreview);
            //   setChartPreviews(parsedData);
            } catch (error) {
              // Handle legacy format (direct base64 string)
              console.log('Converting legacy chart preview format');
              // If it starts with data:image, it's a legacy direct base64 string
              if (savedChartPreview.startsWith('data:image')) {
                // setChartPreviews([savedChartPreview]);
                // Update localStorage to new format
                localStorage.setItem('chartAnalysisPreview', JSON.stringify([savedChartPreview]));
              } else {
                // If we can't parse it and it's not a base64 image, clear it
                console.error('Invalid chart preview data in localStorage, clearing');
                localStorage.removeItem('chartAnalysisPreview');
              }
            }
          }
          
          // Load analysis data
          const savedAnalysisData = localStorage.getItem('chartAnalysisData');
          if (savedAnalysisData) {
            try {
            //   setAnalysisData(JSON.parse(savedAnalysisData));
            } catch (error) {
              console.error('Error loading saved analysis data:', error);
            }
          }
        }
        
        // Using fixed model 'gpt-4o' - no need to load from localStorage
      }, [analysisId]);
    

    // Fetch available models on component mount
    useEffect(() => {
        const fetchModels = async () => {
            setIsLoadingModels(true);
            try {
                console.log('Fetching models...');
                const response = await getRequest<Model[]>('/models');
                console.log('Models response:', response);
                if (response) {
                    // Use all models from the endpoint
                    setModels(response);
                    
                    // Set first model as default if available
                    if (response.length > 0) {
                        setSelectedModel(response[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch models:', error);
            } finally {
                setIsLoadingModels(false);
            }
        };
        fetchModels();
    }, []);

    // Reference for the chat container
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    
    // Function to scroll to the bottom of the chat
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };
    
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: t('EA_WelcomeMessage'),
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    
    // Scroll to bottom whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedModel) return;
        let startTime = performance.now();
        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: message,
            sender: 'user',
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        
        try {
            // Create a loading message
            const loadingId = Date.now() + 1;
            const loadingMessage: Message = {
                id: loadingId.toString(),
                content: t('Thinking'), // Simple content, animation will be handled in the UI
                sender: 'ai',
                timestamp: new Date(),
                isLoading: true
            };
            
            setMessages(prev => [...prev, loadingMessage]);
            
            // Prepare request payload
            const requestBody = {
                modelId: selectedModel,
                messages: [
                    {
                        role: "system",
                        content: "You are an expert MetaTrader Expert Advisor (EA) code generator. Based on the trading strategy provided by the user, generate clean, complete MQL4 or MQL5 code (in English, not pseudocode). Return only the final code in your response, inside a markdown block using triple backticks. Do not include explanation, reasoning, or commentary unless asked."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                image: null,
            };
            
            // Send request to API
            const response = await postRequest<{code: string; history_id: number}>('/openrouter/generate-ea', requestBody);
            const endTime = performance.now();
            console.log('Execution Time: ' + (endTime - startTime)/1000 + "s")
            // Remove loading message
            setMessages(prev => prev.filter(msg => msg.id !== loadingId.toString()));
            
            if (response) {
                // Add AI response
                const aiMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    content: response.code || t('AIAnalyzedStrategyDefault'),
                    sender: 'ai',
                    timestamp: new Date(),
                    historyId: response.history_id
                };
                
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error: any) {
            console.error('Failed to generate EA:', error);
            
            // Add error message
            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                content: error.response?.data?.message || t('GenerateEAError'),
                sender: 'ai',
                timestamp: new Date(),
                isError: true
            };
            
            setMessages(prev => [
                ...prev.filter(msg => !msg.isLoading),
                errorMessage
            ]);
        }
    };
    
    return (
        <div className="container mx-auto p-6">
            {/* Header Section */}
            <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-6 mb-6">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
                    {t('ExpertAdvisorGenerator')}
                </h1>
                <p className="text-gray-400">
                    {t('EAGeneratorSubtitle')}
                </p>
            </div>
            
            {/* Main Content - 60/40 Split */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Section - 60% */}
                <div className="w-full md:w-3/5 bg-[#1a1a20] p-6 rounded-lg border border-[#3a3a45]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Code className="w-5 h-5 text-blue-400 mr-2" />
                            <h2 className="text-xl font-semibold text-white">{t('EAGenerator')}</h2>
                        </div>
                        
                        {/* Model Selector */}
                        <div className="flex items-center">
                            <span className="text-white text-xs mr-2 font-medium">{t('ModelLabel')}</span>
                            <div className="relative w-48">
                                <div 
                                    className="flex items-center justify-between bg-[#25252d] text-white text-xs rounded px-3 py-1.5 border border-[#3a3a45] cursor-pointer"
                                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                >
                                    <div className="flex items-center truncate mr-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 flex-shrink-0"></div>
                                        <span className="truncate">
                                            {models.find(m => m.id === selectedModel)?.name || t('SelectAModel')}
                                        </span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                                </div>
                                
                                {isModelDropdownOpen && (
                                    <div>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsModelDropdownOpen(false)}></div>
                                        <div 
                                            className="absolute top-full right-0 w-64 mt-1 bg-[#25252d] border border-[#3a3a45] rounded shadow-lg max-h-48 overflow-y-auto z-50"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {isLoadingModels ? (
                                                <div className="px-3 py-2 text-xs text-white">{t('LoadingModels')}</div>
                                            ) : models.length > 0 ? (
                                                models.map((model) => (
                                                    <div 
                                                        key={model.id}
                                                        className={`px-3 py-2 text-xs cursor-pointer hover:bg-[#3a3a45] ${selectedModel === model.id ? 'bg-[#3a3a45] text-blue-400' : 'text-white'}`}
                                                        onClick={() => {
                                                            setSelectedModel(model.id);
                                                            setIsModelDropdownOpen(false);
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="truncate mr-2">{model.name}</span>
                                                            <span className="text-gray-400 whitespace-nowrap">{model.creditCost} credits</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-xs text-white">{t('NoModelsAvailable')}</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col h-[600px] border border-[#3a3a45] rounded-lg overflow-hidden">
                        {/* Chat Messages */}
                        <div ref={messagesContainerRef} className="flex-grow overflow-y-auto p-4 bg-[#25252d]">
                            {messages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                                >
                                    <div className="relative">
                                        <div 
                                            className={`inline-block max-w-[100%] rounded-lg p-3 ${msg.sender === 'user' 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-[#1a1a20] text-white border border-[#3a3a45]'}`}
                                        >
                                            {msg.isLoading ? (
                                                <div className="whitespace-pre-wrap text-sm italic">
                                                    {t('Thinking')}
                                                    <span className="inline-block animate-bounce mx-0.5">.</span>
                                                    <span className="inline-block animate-bounce mx-0.5" style={{ animationDelay: '0.2s' }}>.</span>
                                                    <span className="inline-block animate-bounce mx-0.5" style={{ animationDelay: '0.4s' }}>.</span>
                                                </div>
                                            ) : (
                                                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                                            )}
                                        </div>
                                        <div 
                                            className={`absolute ${msg.sender === 'user' ? 'right-0 -mr-2' : 'left-0 -ml-2'} -top-2 px-2 py-0.5 rounded-full text-xs font-medium ${msg.sender === 'user' ? 'bg-blue-700 text-blue-100' : 'bg-emerald-700 text-emerald-100'}`}
                                        >
                                            {msg.sender === 'user' ? t('YouLabel') : t('AILabel')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Input Area */}
                        <div className="p-3 bg-[#1a1a20] border-t border-[#3a3a45]">
                            {/* Message Input */}
                            <div className="flex">
                                <textarea
                                    className="flex-grow bg-[#25252d] text-white text-sm rounded-l-lg px-4 py-2 outline-none resize-none border border-[#3a3a45] focus:border-blue-400"
                                    placeholder={t('DescribeStrategyPlaceholder')}
                                    rows={2}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            if (!selectedModel) {
                                                return;
                                            }
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <button 
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg flex items-center justify-center"
                                    onClick={handleSendMessage}
                                    disabled={!selectedModel ? true : false}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Right Section - 40% */}
                <div className="w-full md:w-2/5 bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">{t('StrategyGuide')}</h2>
                    </div>
                    <div className="h-[600px] bg-[#25252d] rounded-lg p-4 overflow-auto">
                        <div className="text-white">
                            <h3 className="text-base font-medium mb-3">{t('StrategyGuideTitle')}</h3>
                            
                            <div className="mb-4">
                                <h4 className="text-blue-400 font-medium mb-2 text-base">1. {t('IndicatorSettings')}</h4>
                                <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                                    <li>{t('Indicator_MA')}</li>
                                    <li>{t('Indicator_RSI')}</li>
                                    <li>{t('Indicator_BB')}</li>
                                </ul>
                            </div>
                            
                            <div className="mb-4">
                                <h4 className="text-blue-400 font-medium mb-2 text-base">2. {t('EntryRules')}</h4>
                                <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                                    <li>{t('Entry_Crossovers')}</li>
                                    <li>{t('Entry_PriceAction')}</li>
                                    <li>{t('Entry_SR')}</li>
                                </ul>
                            </div>
                            
                            <div className="mb-4">
                                <h4 className="text-blue-400 font-medium mb-2 text-base">3. {t('ExitRules')}</h4>
                                <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                                    <li>{t('Exit_TP')}</li>
                                    <li>{t('Exit_SL')}</li>
                                    <li>{t('Exit_Trailing')}</li>
                                </ul>
                            </div>
                            
                            <div className="mb-4">
                                <h4 className="text-blue-400 font-medium mb-2 text-base">4. {t('RiskManagement')}</h4>
                                <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                                    <li>{t('Risk_PositionSizing')}</li>
                                    <li>{t('Risk_MaxOpenPositions')}</li>
                                    <li>{t('Risk_TradingSessions')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EAGenerator;