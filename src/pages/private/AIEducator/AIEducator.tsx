import React, { useState, useEffect, useRef } from 'react';
import { Code, Send, ChevronDown } from 'lucide-react';
import { getRequest, postRequest } from '@/services/apiRequest';
import { Message, Model } from '@/types/pages/EAGenerator';
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

const AIEducator: React.FC = () => {
    const { t } = useTranslation();
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData || '{}');
    const [message, setMessage] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [models, setModels] = useState<Model[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [error, setError] = useState<string | null>(null);
   
    // Fetch available models on component mount
    // useEffect(() => {
    //     const fetchModels = async () => {
    //         setIsLoadingModels(true);
    //         try {
    //             console.log('Fetching models...');
    //             const response = await getRequest<Model[]>('/models');
    //             console.log('Models response:', response);
    //             if (response) {
    //                 // Use all models from the endpoint
    //                 setModels(response);
                    
    //                 // Set first model as default if available
    //                 if (response.length > 0) {
    //                     setSelectedModel(response[0].id);
    //                 }
    //             }
    //         } catch (error) {
    //             console.error('Failed to fetch models:', error);
    //         } finally {
    //             setIsLoadingModels(false);
    //         }
    //     };
    //     fetchModels();
    // }, []);

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
            content: t('AIEducator_WelcomeMessage'),
            sender: 'ai',
            timestamp: new Date()
        }
    ]);

    const fetchPreviousHistory = async () => {
        try {
            const response = await postRequest<any>('/openrouter/ai-educator-history', {
                user_id: user.id
            });
            if (response && response.success && response.data.length) {
                setMessages(messages.concat(response.data));
            }
        } catch (error) {
            console.error('Failed to fetch previous history:', error);
        }
    };
    
    // Scroll to bottom whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchPreviousHistory()
    }, []);

    const handleSendMessage = async () => {
        if (!message.trim()) return;
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
                user_id: user.id,
                question: message,
                // last message from ai
                lastMessage: messages[messages.length - 1],
            };
            
            // Send request to API
            const response = await postRequest<{code: string; history_id: number}>('/openrouter/ai-educator', requestBody);
            const endTime = performance.now();
            console.log('Execution Time: ' + (endTime - startTime)/1000 + "s")
            // Remove loading message
            setMessages(prev => prev.filter(msg => msg.id !== loadingId.toString()));
            console.log(response)
            if (response) {
                // Add AI response
                const aiMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    content: response.code || t('AIEducator_DefaultResponse'),
                    sender: 'ai',
                    timestamp: new Date(),
                    historyId: response.history_id
                };
                
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error: any) {
            console.error('Failed to generate AI response:', error);
            
            // Add error message
            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                content: error.response?.data?.message || t('ErrorGenericTrySupport'),
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
                    {t('AIEducator_Title')}
                </h1>
                <p className="text-gray-400">
                    {t('AIEducator_Subtitle')}
                </p>
            </div>
            
            {/* Main Content - 60/40 Split */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Section - 60% */}
                <div className="w-full md:w-3/5 bg-[#1a1a20] p-6 rounded-lg border border-[#3a3a45]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Code className="w-5 h-5 text-blue-400 mr-2" />
                            <h2 className="text-xl font-semibold text-white">{t('AIEducator_AITradingEducator')}</h2>
                        </div>
                        
                        {/* Model Selector */}
                        <div className="flex items-center">
                            {/* <span className="text-white text-xs mr-2 font-medium">Model:</span>
                            <div className="relative w-48">
                                <div 
                                    className="flex items-center justify-between bg-[#25252d] text-white text-xs rounded px-3 py-1.5 border border-[#3a3a45] cursor-pointer"
                                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                >
                                    <div className="flex items-center truncate mr-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 flex-shrink-0"></div>
                                        <span className="truncate">
                                            {models.find(m => m.id === selectedModel)?.name || 'Select a model'}
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
                                                <div className="px-3 py-2 text-xs text-white">Loading models...</div>
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
                                                <div className="px-3 py-2 text-xs text-white">No models available</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div> */}
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
                                    placeholder={t('AIEducator_TextareaPlaceholder')}
                                    rows={2}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <button 
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg flex items-center justify-center"
                                    onClick={handleSendMessage}
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
                        <h2 className="text-xl font-semibold text-white">{t('AIEducator_LearningGuide')}</h2>
                    </div>
                    {/* Hide scrollbar for the guide panel (keep scroll functionality) */}
                    <style>{`
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>
                    <div className="h-[600px] bg-[#25252d] rounded-lg p-4 overflow-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none]">
                        <div className="text-white">
                            <h3 className="text-base font-medium mb-3">{t('AIEducator_WhatWeWillLearn')}</h3>
                            
                            <div className="mb-4">
                                <h4 className="text-blue-400 font-medium mb-2 text-base">{t('AIEducator_Section1_Title')}</h4>
                                <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                                    <li>{t('AIEducator_Section1_Item1')}</li>
                                    <li>{t('AIEducator_Section1_Item2')}</li>
                                    <li>{t('AIEducator_Section1_Item3')}</li>
                                </ul>
                            </div>
                            
                            <div className="mb-4">
                                <h4 className="text-blue-400 font-medium mb-2 text-base">{t('AIEducator_Section2_Title')}</h4>
                                <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                                    <li>{t('AIEducator_Section2_Item1')}</li>
                                    <li>{t('AIEducator_Section2_Item2')}</li>
                                    <li>{t('AIEducator_Section2_Item3')}</li>
                                </ul>
                            </div>
                            
                            <div className="mb-4">
                                <h4 className="text-blue-400 font-medium mb-2 text-base">{t('AIEducator_Section3_Title')}</h4>
                                <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                                    <li>{t('AIEducator_Section3_Item1')}</li>
                                    <li>{t('AIEducator_Section3_Item2')}</li>
                                    <li>{t('AIEducator_Section3_Item3')}</li>
                                </ul>
                            </div>
                            
                            <div className="mb-4">
                                <h4 className="text-blue-400 font-medium mb-2 text-base">{t('AIEducator_Section4_Title')}</h4>
                                <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                                    <li>{t('AIEducator_Section4_Item1')}</li>
                                    <li>{t('AIEducator_Section4_Item2')}</li>
                                    <li>{t('AIEducator_Section4_Item3')}</li>
                                </ul>
                            </div>
                            
                            <div className="mb-4">
                                <h4 className="text-blue-400 font-medium mb-2 text-base">{t('AIEducator_Section5_Title')}</h4>
                                <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                                    <li>{t('AIEducator_Section5_Item1')}</li>
                                    <li>{t('AIEducator_Section5_Item2')}</li>
                                    <li>{t('AIEducator_Section5_Item3')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIEducator;