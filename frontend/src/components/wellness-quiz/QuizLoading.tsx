import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const QuizLoading: React.FC = () => {
    const { t } = useTranslation();

    return (
        <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-16 shadow-xl border border-bark/5 max-w-2xl mx-auto flex flex-col items-center"
        >
            <div className="w-16 h-16 border-4 border-forest/20 border-t-forest rounded-full animate-spin mb-6"></div>
            <p className="text-xl text-forest font-headers animate-pulse">
                {t('home.quiz.loading_ai')}
            </p>
            <p className="text-sm text-bark/50 mt-4 max-w-xs mx-auto">
                {t('home.quiz.analyzing')}
            </p>
        </motion.div>
    );
};

export default QuizLoading;
