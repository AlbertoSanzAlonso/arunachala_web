import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import puter from '@heyputer/puter.js';
import omSymbol from '../assets/images/om_symbol.png';
import { API_BASE_URL } from '../config';

interface Message {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: Date;
    role?: 'user' | 'assistant';
    sources?: string[];
    isStreaming?: boolean;
}

const INITIAL_MESSAGE: Message = {
    id: 0,
    text: "¡Namasté! 🙏 Bienvenido a Arunachala. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre horarios, clases de yoga, o terapias.",
    isUser: false,
    timestamp: new Date(),
    role: 'assistant'
};

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
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

            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    stream: true
                }),
            });

            if (!response.ok) throw new Error('Backend failed');

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
                                setMessages(prev => prev.map(m =>
                                    m.id === botMsgId ? { ...m, text: accumulatedText } : m
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
                        setMessages(prev => prev.map(m =>
                            m.id === botMsgId ? { ...m, text: accumulatedText } : m
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
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 left-6 z-50 bg-[#becf81] text-white p-4 rounded-full shadow-2xl hover:shadow-[0_0_20px_rgba(190,207,129,0.6)] hover:bg-[#a9bb6e] transition-all duration-300 flex items-center justify-center group"
                    aria-label="Abrir chat de ayuda"
                >
                    <ChatBubbleLeftRightIcon className="w-8 h-8" />
                    <span className="absolute left-full ml-3 bg-white text-[#5c6b3c] text-xs font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#becf81]/20 pointer-events-none">
                        ¿Cómo puedo ayudarte? ✨
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
                        className="fixed bottom-6 left-6 z-50 w-[92vw] md:w-[400px] max-h-[650px] h-[75vh] flex flex-col bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 font-body"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#becf81] to-[#a9bb6e] p-5 flex items-center justify-between shrink-0 shadow-md">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/40 shadow-inner"
                                >
                                    <img src={omSymbol} alt="ArunachalaBot" className="w-7 h-7 object-contain opacity-90 invert brightness-0" />
                                </motion.div>
                                <div>
                                    <h3 className="font-headers text-white font-bold text-xl leading-none">Arunachala Bot</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                                        <span className="text-white/90 text-[11px] font-medium tracking-wide flex items-center gap-1 uppercase">
                                            Namasté 🙏 Online
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
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
                                        className={`max-w-[85%] p-4 rounded-2xl text-[14.5px] leading-relaxed shadow-sm transition-all ${msg.isUser
                                            ? 'bg-gradient-to-br from-[#becf81] to-[#99aa66] text-white rounded-tr-none shadow-[#becf81]/20'
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none shadow-gray-200/50'
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap">{msg.text}</div>
                                        {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-[#becf81] animate-pulse rounded-full align-middle"></span>}

                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-2 border-t border-gray-100/50 flex flex-wrap gap-2">
                                                <span className="text-[10px] uppercase font-bold text-gray-400 block w-full mb-1 flex items-center gap-1">
                                                    <BookmarkIcon className="w-3 h-3" /> Fuentes consultadas:
                                                </span>
                                                {msg.sources.map((s, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-medium border border-gray-200">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
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
                                    placeholder="Escribe tu pregunta..."
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
                            <p className="text-[10px] text-center text-gray-400 mt-3 font-medium tracking-tight">
                                ✨ Inteligencia Artificial entrenada para Arunachala ✨
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
