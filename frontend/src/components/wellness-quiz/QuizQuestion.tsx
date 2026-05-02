import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TreeNode } from './types';

interface QuizQuestionProps {
    currentNode: TreeNode;
    progress: number;
    showCustomInput: boolean;
    customValue: string;
    onBack: () => void;
    onOptionClick: (option: any) => void;
    onCustomSubmit: () => void;
    setShowCustomInput: (show: boolean) => void;
    setCustomValue: (value: string) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
    currentNode,
    progress,
    showCustomInput,
    customValue,
    onBack,
    onOptionClick,
    onCustomSubmit,
    setShowCustomInput,
    setCustomValue
}) => {
    const { t } = useTranslation();

    return (
        <motion.div
            key={currentNode.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-xl border border-bark/5 max-w-2xl mx-auto"
        >
            <div className="mb-8 flex items-center justify-between gap-4">
                <button
                    onClick={onBack}
                    className="text-forest hover:text-matcha flex items-center gap-1 transition-colors text-sm font-bold uppercase tracking-widest"
                >
                    ← {t('common.back')}
                </button>
                <div className="flex-1 max-w-[200px]">
                    <div className="w-full bg-bark/10 h-1 rounded-full overflow-hidden">
                        <div
                            className="bg-forest h-full transition-all duration-500"
                            style={{ width: `${(progress / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-forest/60">
                    {t('home.quiz.progress', { current: progress, total: 4 })}
                </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-headers text-bark mb-10 leading-snug">
                {t(currentNode.questionKey)}
            </h3>

            {!showCustomInput ? (
                <div className="grid grid-cols-1 gap-4">
                    {currentNode.options.map((option, idx) => (
                        <button
                            key={option.id}
                            onClick={() => onOptionClick(option)}
                            className="p-5 rounded-xl bg-bone border-2 border-bark/5 hover:border-forest/50 hover:bg-forest/5 transition-all duration-300 text-left flex items-center gap-4 group"
                        >
                            <div className="w-8 h-8 rounded-full border border-forest/30 flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-bone transition-colors shrink-0 font-bold">
                                {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-lg font-light text-bark/90 group-hover:text-forest transition-colors">
                                {t(option.textKey)}
                            </span>
                        </button>
                    ))}
                    <button
                        onClick={() => setShowCustomInput(true)}
                        className="p-5 rounded-xl border-2 border-dashed border-bark/20 hover:border-forest/50 hover:bg-forest/5 transition-all duration-300 text-left flex items-center gap-4 text-bark/60 hover:text-forest"
                    >
                        <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center font-bold">
                            {currentNode.id === 'L4-FINAL' ? '✎' : '+'}
                        </div>
                        <span className="text-lg font-light italic">
                            {currentNode.id === 'L4-FINAL' ? t('home.quiz.l4.options.yes') : t('home.quiz.other')}
                        </span>
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <textarea
                        autoFocus
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder={t('home.quiz.custom_placeholder', 'Escribe aquí tu respuesta...')}
                        className="w-full p-6 bg-bone rounded-2xl border-2 border-forest/20 focus:border-forest focus:outline-none min-h-[150px] text-lg font-light"
                    />
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowCustomInput(false)}
                            className="px-8 py-3 rounded-full border-2 border-forest text-forest font-bold hover:bg-forest/5 transition-all"
                        >
                            {t('home.quiz.cancel')}
                        </button>
                        <button
                            disabled={!customValue.trim()}
                            onClick={onCustomSubmit}
                            className="flex-1 px-8 py-3 rounded-full bg-forest text-bone font-bold hover:bg-matcha hover:text-forest transition-all shadow-lg disabled:opacity-50"
                        >
                            {t('home.quiz.confirm')}
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default QuizQuestion;
