import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import omSymbol from '../assets/images/om_symbol.png'; // Assuming this exists, based on other files

import { API_BASE_URL } from '../config';

interface Message {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: Date;
    role?: 'user' | 'assistant'; // Add role mapping
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
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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

        try {
            // Transform messages for API
            // Include a limited history (e.g., last 5 messages + new one)
            const apiMessages = messages.slice(-5).map(m => ({
                role: m.role || (m.isUser ? 'user' : 'assistant'),
                content: m.text
            }));

            // Add current message
            apiMessages.push({ role: 'user', content: userText });

            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: apiMessages,
                    stream: false // Disabled stream for now to keep frontend simple
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const botMsg: Message = {
                id: Date.now() + 1,
                text: data.response, // Backend returns { response: "..." }
                isUser: false,
                timestamp: new Date(),
                role: 'assistant'
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Error chatting with AI:", error);
            const errorMsg: Message = {
                id: Date.now() + 1,
                text: "Disculpa, he tenido un problema de conexión. ¿Podrías intentarlo de nuevo más tarde? 🙏",
                isUser: false,
                timestamp: new Date(),
                role: 'assistant'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 left-6 z-50 bg-[#becf81] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-[#a9bb6e] transition-all duration-300 flex items-center justify-center group"
                    aria-label="Abrir chat de ayuda"
                >
                    <ChatBubbleLeftRightIcon className="w-8 h-8" />
                    <span className="absolute left-full ml-3 bg-white text-gray-800 text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                        ¿Necesitas ayuda?
                    </span>
                </motion.button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 left-6 z-50 w-[90vw] md:w-96 max-h-[600px] h-[70vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 font-body"
                    >
                        {/* Header */}
                        <div className="bg-[#becf81] p-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <img src={omSymbol} alt="ArunachalaBot" className="w-6 h-6 object-contain opacity-90 invert brightness-0" />
                                    {/* Using filter to make standard image look white/integrated if needed, or just plain image */}
                                </div>
                                <div>
                                    <h3 className="font-headers text-white font-bold text-lg leading-none">Arunachala Bot</h3>
                                    <span className="text-white/80 text-xs flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        En línea
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fdfbf7]">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex w-full ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isUser
                                            ? 'bg-[#becf81] text-white rounded-tr-none'
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start w-full">
                                    <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 shrink-0">
                            <div className="relative flex items-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Escribe tu pregunta..."
                                    className="w-full bg-gray-50 text-gray-800 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#becf81]/50 focus:bg-white border-transparent focus:border-[#becf81] transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="absolute right-2 p-2 bg-[#becf81] text-white rounded-full hover:bg-[#a9bb6e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    <PaperAirplaneIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-gray-400 mt-2">
                                * Este es un asistente virtual, la información puede variar.
                            </p>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
