// src/components/layout/FloatingChatButton.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, User } from 'lucide-react';
import { Message } from '@/types/pages/EAGenerator';
import { postRequest } from '@/services/apiRequest';
import { useTranslation } from 'react-i18next';

interface ChatbotMessage {
    user_id: number;
    sender: string;
    status: string;
    text: string;
    metadata: string;
    timestamp: string;
}

interface ChatBotHistory {
    success: boolean;
    data: ChatbotMessage[];
}

const FloatingChatButton: React.FC = () => {
    const { t } = useTranslation();
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData || '{}');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: t('WelcomeChatMessage'),
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [message, setMessage] = useState('');
    const messageRef = useRef<HTMLDivElement>(null)
    
    // load chat history, get from request
    useEffect(() => {
        const getChatHistory = async () => {
            try {
                const response = await postRequest<{ success: boolean; data: ChatbotMessage[] }>(
                    '/openrouter/chatbot-history',
                    { user_id: user.id }
                );
                let data = response.data
                data.map((d,dk) => {
                    setMessages(prev => [...prev, {
                        id: dk.toString(),
                        content: d.text,
                        sender: d.sender === 'user' ? 'user' : 'ai',
                        timestamp: new Date(d.timestamp)
                    }])
                })
            } catch (error) {
                console.error('Failed to load chat history:', error);
            }
        };
        getChatHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        messageRef.current?.scrollTo({ top: messageRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (preMessage: string | null = null) => {
        if (!message.trim() && !preMessage) return;
        // Add user message
        // scroll to bottom whenever user enter new message
        messageRef.current?.scrollTo({ top: messageRef.current.scrollHeight, behavior: 'smooth' });
        const userMessage: Message = {
            id: Date.now().toString(),  
            content: preMessage ? preMessage : message,
            sender: 'user',
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        
        try {
            // Create a loading message
            const timestamp = new Date()
            const loadingId = Date.now() + 1;
            const loadingMessage: Message = {
                id: loadingId.toString(),
                content: t('Thinking'), // Simple content, animation will be handled in the UI
                sender: 'ai',
                timestamp: timestamp,
                isLoading: true
            };
            
            setMessages(prev => [...prev, loadingMessage]);
            
            // Prepare request payload
            const requestBody = {
                message: preMessage ? preMessage : message,
                sender: 'user',
                timestamp: timestamp
            };
            
            // Send request to API
            const response = await postRequest<{code: string; history_id: number}>('/openrouter/chatbot', requestBody);
            // Remove loading message
            await setMessages(prev => prev.filter(msg => msg.id !== loadingId.toString()));
            
            if (response) {
                // Add AI response
                const aiMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    content: `${response.code}` || t('GenericHello'),
                    sender: 'ai',
                    timestamp: new Date(),
                    historyId: response.history_id
                };
                
                await setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error: any) {
            console.error('Failed to generate EA:', error);
            
            // Add error message
            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                content: error?.response?.data?.message || t('ErrorGenericTrySupport'),
                sender: 'ai',
                timestamp: new Date(),
                isError: true
            };
            
            await setMessages(prev => [
                ...prev.filter(msg => !msg.isLoading),
                errorMessage
            ]);
            
        }
    };

    const convertNewLineToHTML = (text: string) => {
        return text.replace(/\n/g, '<br />');
    }

    return (
        <>
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-8 right-8 bg-blue-400 hover:bg-blue-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50"
            aria-label={t('OpenAIChat')}
        >
            <MessageSquare size={24} />
        </button>

        {isOpen && (
            <div className="fixed bottom-24 right-8 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col z-50 overflow-hidden">
            {/* Chat header */}
            <div className="bg-blue-400 text-white p-4 flex justify-between items-center">
                <h3 className="font-semibold">{t('AIAssistant')}</h3>
                <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
                aria-label={t('CloseChat')}
                >
                &times;
                </button>
            </div>
            
            {/* Chat messages area */}
            <div className="flex-1 p-4 overflow-y-auto" ref={messageRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block max-w-[95%] p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                            dangerouslySetInnerHTML={{ __html: convertNewLineToHTML(msg.content) }}
                        />
                        {/* show date time timestamp */}
                        {!msg.isLoading && msg.sender === 'ai' && <p className="text-xs text-gray-500 mt-1 text-right max-w-[95%]">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                    </div>
                ))}
            </div>
            
            {/* Suggestion buttons */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-row gap-2 mb-3">
                    <button
                        onClick={() => {
                            const question = t('WhatIsChartAnalysis');
                            return handleSendMessage(question)
                        }}
                        className="text-left p-2 text-sm text-white bg-blue-400 hover:bg-blue-600 rounded-xl transition-colors"
                    >
                        {t('ChartAnalysis')}
                    </button>
                    <button
                        onClick={() => {
                            const question = t('WhatIsChatDiscussion');
                            return handleSendMessage(question)
                        }}
                        className="text-left p-2 text-sm text-white bg-blue-400 hover:bg-blue-600 rounded-xl transition-colors"
                    >
                        {t('ChatDiscussion')}
                    </button>
                    <button
                        onClick={() => {
                            const question = t('WhatIsEAGenerator');
                            return handleSendMessage(question)
                        }}
                        className="text-left p-2 text-sm text-white bg-blue-400 hover:bg-blue-600 rounded-xl transition-colors"
                    >
                        {t('EAGenerator')}
                    </button>
                </div>
                
                {/* Chat input */}
                <div className="flex gap-2">
                <input
                    type="text"
                    placeholder={t('TypeYourMessage')}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                />
                <button onClick={() => handleSendMessage()} className="bg-blue-400 hover:bg-blue-700 text-white px-4 rounded-lg">
                    {t('Send')}
                </button>
                </div>
            </div>
            </div>
        )}
        </>
    );
};

export default FloatingChatButton;