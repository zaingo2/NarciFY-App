
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { GoogleGenAI, Chat } from "@google/genai";
import { useTranslation } from '../hooks/useTranslation';
import { useUsage } from '../contexts/UsageContext';

export const ChatWidget: React.FC = () => {
    const { t } = useTranslation();
    const { consumeCredit } = useUsage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const isInitialized = useRef(false);
    
    // Set initial message and initialize chat client
    useEffect(() => {
        if (t && !isInitialized.current) {
            setMessages([{ role: 'model', text: t('chatWidget.initialMessage') }]);
            
            let apiKey = '';
            // 1. Try standard Vite import.meta.env
            try {
                if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
                    apiKey = import.meta.env.VITE_API_KEY;
                }
            } catch (e) { /* ignore */ }

            // 2. Try process.env fallback
            if (!apiKey) {
                try {
                    if (typeof process !== 'undefined' && process.env) {
                        if (process.env.VITE_API_KEY) apiKey = process.env.VITE_API_KEY;
                        else if (process.env.API_KEY) apiKey = process.env.API_KEY;
                    }
                } catch (e) { /* ignore */ }
            }

            if (apiKey) {
                try {
                    const ai = new GoogleGenAI({ apiKey: apiKey });
                    chatRef.current = ai.chats.create({
                        model: 'gemini-flash-lite-latest',
                        config: {
                            systemInstruction: 'You are a friendly and concise AI assistant for the NarciFY app. Provide supportive and brief answers to user questions about relationships and personal well-being. Keep responses under 100 words.',
                        }
                    });
                } catch (error) {
                    console.error("Failed to initialize GoogleGenAI:", error);
                    setMessages(prev => [...prev, { role: 'model', text: "Failed to initialize AI Chat." }]);
                    chatRef.current = null;
                }
            } else {
                 console.warn("VITE_API_KEY is not set. Chat widget AI features disabled.");
                 setMessages(prev => [...prev, { role: 'model', text: t('chatWidget.apiKeyError', { variableName: 'VITE_API_KEY' }) }]);
            }
            isInitialized.current = true;
        }
    }, [t]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        if (!chatRef.current) {
            setMessages(prev => [...prev, { role: 'model', text: t('chatWidget.apiKeyError', { variableName: 'VITE_API_KEY' }) }]);
            return;
        }

        // Check Usage Limit
        if (!consumeCredit()) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chatRef.current.sendMessageStream({ message: input });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '...' }]);

            for await (const chunk of result) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: modelResponse };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'model', text: t('chatWidget.errorMessage') }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={`fixed bottom-8 right-8 transition-all duration-300 ${isOpen ? 'w-11/12 max-w-md h-3/4 max-h-[600px] shadow-2xl rounded-xl' : 'w-16 h-16 rounded-full' } bg-slate-800 flex flex-col z-50`}>
                {isOpen ? (
                    <>
                        <header className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h3 className="font-bold text-lg text-slate-50">{t('chatWidget.title')}</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-slate-50">
                                <i className="fa fa-times fa-lg"></i>
                            </button>
                        </header>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-50'}`}>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                             {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-700 text-slate-50 px-4 py-2 rounded-2xl">
                                        <div className="flex items-center space-x-1">
                                            <span className="h-2 w-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 bg-slate-300 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                             )}
                            <div ref={messagesEndRef} />
                        </div>
                        <footer className="p-4 border-t border-slate-700">
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    className="flex-1 p-2 border rounded-l-lg bg-slate-900 border-slate-700 text-slate-50 focus:ring-pink-300 focus:border-pink-300 disabled:bg-slate-800"
                                    placeholder={t('chatWidget.placeholder')}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                                    disabled={isLoading}
                                />
                                <button onClick={handleSend} disabled={isLoading} className="bg-teal-500 text-white px-4 py-2 rounded-r-lg hover:bg-teal-600 disabled:bg-teal-500/50">
                                    <i className="fa fa-paper-plane"></i>
                                </button>
                            </div>
                        </footer>
                    </>
                ) : (
                     <button onClick={() => setIsOpen(true)} className="w-full h-full bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-600">
                        <i className="fa fa-comments fa-2x"></i>
                    </button>
                )}
            </div>
        </>
    );
};
