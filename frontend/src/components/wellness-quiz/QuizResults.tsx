import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

interface QuizResultsProps {
    aiResponse: string;
    onReset: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ aiResponse, onReset }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#Fdfbf7] rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-forest/10 max-w-4xl mx-auto relative overflow-hidden text-left"
        >
            <div className="text-center mb-8">
                <img 
                    src="/logo_transparent_v2.webp" 
                    alt="Arunachala Logo" 
                    className="h-20 w-auto mx-auto object-contain"
                />
                <h3 className="text-sm uppercase tracking-[0.3em] text-forest mt-4 mb-2">{t('home.quiz.recommendation_title')}</h3>
            </div>

            <div className="prose prose-stone max-w-none prose-headings:font-headers prose-headings:text-forest prose-p:text-bark/80 prose-p:font-light prose-p:text-lg prose-strong:text-matcha prose-strong:font-bold">
                {aiResponse.split('\n').map((line, i) => {
                    if (!line.trim()) return <div key={i} className="h-4"></div>;

                    if (line.includes('[[BUTTON:')) {
                        const buttons = line.match(/\[\[BUTTON:.*?\|.*?\]\]/g);
                        return (
                            <div key={i} className="flex flex-wrap gap-3 my-4">
                                {buttons?.map((btn, j) => {
                                    const match = btn.match(/\[\[BUTTON:(.*?)\|(.*?)\]\]/);
                                    if (!match) return null;
                                    const [, label, url] = match;
                                    const isInternal = url.startsWith('/');

                                    if (isInternal) {
                                        return (
                                            <Link
                                                key={j}
                                                to={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-2.5 bg-matcha/10 text-forest font-bold rounded-xl border border-matcha/20 hover:bg-forest hover:text-white transition-all shadow-sm flex items-center gap-2 group no-underline"
                                            >
                                                {label}
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                            </Link>
                                        );
                                    }

                                    const finalUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
                                    return (
                                        <a
                                            key={j}
                                            href={finalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-2.5 bg-matcha/10 text-forest font-bold rounded-xl border border-matcha/20 hover:bg-forest hover:text-white transition-all shadow-sm flex items-center gap-2 group no-underline"
                                        >
                                            {label}
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                        </a>
                                    );
                                })}
                            </div>
                        );
                    }

                    const parts = line.split(/(\*\*.*?\*\*)/g);

                    return (
                        <p key={i} className="mb-3 leading-relaxed">
                            {parts.map((part, j) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                    return (
                                        <strong key={j} className="text-forest font-bold text-xl block mt-4 mb-2">
                                            {part.replace(/\*\*/g, '')}
                                        </strong>
                                    );
                                }
                                return <span key={j}>{part}</span>;
                            })}
                        </p>
                    );
                })}
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center mt-12 pt-8 border-t border-forest/10">
                <button
                    onClick={() => navigate('/contacto')}
                    className="bg-forest text-bone text-lg font-bold py-4 px-10 rounded-full hover:bg-matcha hover:text-forest transition-all duration-300 shadow-lg"
                >
                    {t('home.quiz.appointment')}
                </button>
                <button
                    onClick={onReset}
                    className="text-forest underline underline-offset-4 hover:text-matcha transition-colors py-2"
                >
                    {t('home.quiz.restart')}
                </button>
            </div>
        </motion.div>
    );
};

export default QuizResults;
