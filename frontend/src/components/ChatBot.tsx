import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import puter from '@heyputer/puter.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import omSymbol from '../assets/images/om_symbol.png';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../utils/imageUtils';
import { useUIStore } from '../store/uiStore';

interface Message {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: Date;
    role?: 'user' | 'assistant';
    sources?: string[];
    isStreaming?: boolean;
}

// Eliminated INITIAL_MESSAGE constant to use dynamic state


const ChatBot: React.FC = () => {
    const { i18n, t } = useTranslation();
    const { isChatOpen: isOpen, openChat, closeChat } = useUIStore();
    const [isActive, setIsActive] = useState(true);
    const [botAvatar, setBotAvatar] = useState<string | null>(null);

    // Initial state with translation
    const [messages, setMessages] = useState<Message[]>([{
        id: 0,
        text: t('chatbot.welcome', "¡Namasté! 🙏 Bienvenido a Arunachala. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre horarios, clases de yoga, o terapias."), // Fallback
        isUser: false,
        timestamp: new Date(),
        role: 'assistant'
    }]);

    // Update welcome message on language change
    useEffect(() => {
        setMessages(prev => {
            if (prev.length > 0 && prev[0].id === 0) {
                const newWelcome = t('chatbot.welcome');
                // Only update if text changed to avoid loops
                if (prev[0].text !== newWelcome) {
                    const newMessages = [...prev];
                    newMessages[0] = { ...newMessages[0], text: newWelcome };
                    return newMessages;
                }
            }
            return prev;
        });
    }, [i18n.language, t]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchPersonalization = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/site-config/chatbot_avatar_url`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.value) setBotAvatar(getImageUrl(data.value));
                }
            } catch (error) {
                console.error("Error fetching bot avatar:", error);
            }
        };

        const fetchConfig = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/config`);
                if (response.ok) {
                    const data = await response.json();
                    setIsActive(data.is_active ?? true);
                }
            } catch (error) {
                console.error("Error fetching bot config:", error);
            }
        };

        fetchConfig();
        fetchPersonalization();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue;
        const userMsg: Message = {
            id: Date.now(),
            text: userText,
            isUser: true,
            timestamp: new Date(),
            role: 'user'
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        const botMsgId = Date.now() + 1;
        const initialBotMsg: Message = {
            id: botMsgId,
            text: "",
            isUser: false,
            timestamp: new Date(),
            role: 'assistant',
            isStreaming: true
        };
        setMessages(prev => [...prev, initialBotMsg]);

        try {
            const apiMessages = messages.slice(-5).map(m => ({
                role: m.role || (m.isUser ? 'user' : 'assistant'),
                content: m.text
            }));
            apiMessages.push({ role: 'user', content: userText });

            console.log("Creating chat request with language:", i18n.language);

            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    stream: true,
                    language: i18n.language
                }),
            });

            if (!response.ok) throw new Error('Backend failed');

            // If backend returns JSON instead of SSE (e.g. no AI keys configured)
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('text/event-stream')) {
                const data = await response.json();
                const text = data.response || data.detail || 'Lo siento, el servicio no está disponible en este momento. 🙏';
                setMessages(prev => prev.map(m =>
                    m.id === botMsgId ? { ...m, text, isStreaming: false } : m
                ));
                return;
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader');

            const decoder = new TextDecoder();
            let accumulatedText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.replace('data: ', '').trim();
                        if (jsonStr === '[DONE]') continue;

                        try {
                            const data = JSON.parse(jsonStr);
                            if (data.content) {
                                accumulatedText += data.content;
                                const contentToUpdate = accumulatedText;
                                setMessages(prev => prev.map(m =>
                                    m.id === botMsgId ? { ...m, text: contentToUpdate } : m
                                ));
                            }
                            if (data.sources) {
                                setMessages(prev => prev.map(m =>
                                    m.id === botMsgId ? { ...m, sources: data.sources } : m
                                ));
                            }
                            if (data.error) throw new Error(data.error);
                        } catch (e) {
                            console.error("Error parsing stream chunk", e);
                        }
                    }
                }
            }

            if (!accumulatedText) throw new Error('Empty response from backend');

            setMessages(prev => prev.map(m =>
                m.id === botMsgId ? { ...m, isStreaming: false } : m
            ));

        } catch (error) {
            console.warn("Backend Chat failed, falling back to Puter.js:", error);

            try {
                // FALLBACK TO PUTER.JS
                const puterResponse = await puter.ai.chat(userText, {
                    model: 'gpt-4o-mini',
                    stream: true
                });

                let accumulatedText = "";
                // Puter.js stream is an async generator
                for await (const part of (puterResponse as any)) {
                    if (part?.text) {
                        accumulatedText += part.text;
                        const textToUpdate = accumulatedText;
                        setMessages(prev => prev.map(m =>
                            m.id === botMsgId ? { ...m, text: textToUpdate } : m
                        ));
                    }
                }

                setMessages(prev => prev.map(m =>
                    m.id === botMsgId ? { ...m, isStreaming: false, text: accumulatedText || "Lo siento, ha habido un problema. 🙏" } : m
                ));

            } catch (puterError) {
                console.error("Puter Error:", puterError);
                setMessages(prev => prev.map(m =>
                    m.id === botMsgId ? { ...m, isStreaming: false, text: "Disculpa, he tenido un problema técnico persistente. ¿Podrías intentarlo más tarde? 🙏" } : m
                ));
            }
        } finally {
            setIsTyping(false);
        }
    };

    if (!isActive) return null;

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={openChat}
                    className="fixed bottom-8 md:bottom-6 left-6 z-[60] bg-[#becf81] text-white p-4 rounded-full shadow-2xl hover:shadow-[0_0_20px_rgba(190,207,129,0.6)] hover:bg-[#a9bb6e] transition-all duration-300 flex items-center justify-center group"
                    aria-label="Abrir chat de ayuda"
                >
                    <ChatBubbleLeftRightIcon className="w-8 h-8" />
                    <span className="absolute left-full ml-3 bg-white text-[#5c6b3c] text-xs font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#becf81]/20 pointer-events-none">
                        {t('chatbot.tooltip', "¿Cómo puedo ayudarte? ✨")}
                    </span>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                </motion.button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9, x: -20 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9, x: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[60] w-[calc(100vw-32px)] md:w-[400px] max-h-[85vh] md:max-h-[650px] h-[55vh] md:h-[75vh] flex flex-col bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 font-body"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#becf81] to-[#a9bb6e] p-5 flex items-center justify-between shrink-0 shadow-md">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/40 shadow-inner"
                                >
                                    {botAvatar ? (
                                        <img src={botAvatar} alt="ArunachalaBot" className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <img src={omSymbol} alt="ArunachalaBot" className="w-7 h-7 object-contain opacity-90 invert brightness-0" />
                                    )}
                                </motion.div>
                                <div>
                                    <h3 className="font-headers text-white font-bold text-xl leading-none">Arunachala Bot</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                                        <span className="text-white/90 text-[11px] font-medium tracking-wide flex items-center gap-1 uppercase">
                                            {t('chatbot.status', "Namasté 🙏 Online")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={closeChat}
                                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#fdfbf7]/50 scroll-smooth">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex w-full flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-4 rounded-2xl text-[14.5px] leading-relaxed shadow-sm transition-all prose prose-sm max-w-none ${msg.isUser
                                            ? 'bg-gradient-to-br from-[#becf81] to-[#99aa66] text-white rounded-tr-none shadow-[#becf81]/20 prose-invert prose-p:text-white prose-headings:text-white'
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none shadow-gray-200/50 prose-a:text-[# becf81] hover:prose-a:text-[#a9bb6e]'
                                            }`}
                                    >
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                a: ({ node, children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline font-medium">{children}</a>
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                        {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-[#becf81] animate-pulse rounded-full align-middle"></span>}
                                    </div>
                                    <span className={`text-[10px] mt-1.5 text-gray-400 px-1 font-medium ${msg.isUser ? 'mr-1' : 'ml-1'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </motion.div>
                            ))}
                            {isTyping && !messages[messages.length - 1].isStreaming && (
                                <div className="flex justify-start w-full">
                                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-[#becf81] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-[#becf81] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-[#becf81] rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-2" />
                        </div>

                        {/* Input Area */}
                        <div className="p-5 bg-white border-t border-gray-100 shrink-0">
                            <form onSubmit={handleSendMessage} className="relative flex items-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={t('chatbot.placeholder', "Escribe tu pregunta...")}
                                    className="w-full bg-gray-50 text-gray-800 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[#becf81]/30 focus:bg-white border-gray-100 focus:border-[#becf81] transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="absolute right-2 p-3 bg-[#becf81] text-white rounded-xl hover:bg-[#a9bb6e] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:scale-105 active:scale-95"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5 -rotate-12" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
