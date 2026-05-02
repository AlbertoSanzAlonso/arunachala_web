import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface QuizIntroProps {
    onStart: () => void;
}

const QuizIntro: React.FC<QuizIntroProps> = ({ onStart }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/50 backdrop-blur-md rounded-3xl p-10 md:p-16 shadow-xl border border-bark/5"
        >
            <h2 className="text-3xl md:text-5xl font-headers text-forest mb-6">{t('home.quiz.title')}</h2>
            <p className="text-xl md:text-2xl text-bark/80 mb-10 font-light leading-relaxed whitespace-pre-line">
                {t('home.quiz.subtitle')}
            </p>
            <button
                onClick={onStart}
                className="bg-forest text-bone text-lg md:text-xl font-bold py-4 px-12 rounded-full hover:bg-matcha hover:text-forest transition-all duration-300 shadow-lg transform hover:scale-105"
            >
                {t('home.quiz.cta_start')}
            </button>
        </motion.div>
    );
};

export default QuizIntro;
