import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const WellnessQuiz: React.FC = () => {
    const { t } = useTranslation();
    const [started, setStarted] = useState(false);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    const [result, setResult] = useState<'yoga' | 'therapy' | null>(null);

    const questions_translated = t('home.quiz.questions', { returnObjects: true }) as any[];

    // Maintain the same IDs and logic structure but use translated text
    const QUESTIONS = [
        {
            id: 1,
            question: questions_translated[0]?.question,
            options: [
                { id: 'tired', text: questions_translated[0]?.options.tired, icon: '😴' },
                { id: 'stiff', text: questions_translated[0]?.options.stiff, icon: '🤕' },
                { id: 'energetic', text: questions_translated[0]?.options.energetic, icon: '⚡' },
                { id: 'seeking', text: questions_translated[0]?.options.seeking, icon: '🙏' },
            ]
        },
        {
            id: 2,
            question: questions_translated[1]?.question,
            options: [
                { id: 'relax', text: questions_translated[1]?.options.relax, score: { therapy: 2, yoga: 0 } },
                { id: 'heal', text: questions_translated[1]?.options.heal, score: { therapy: 2, yoga: 1 } },
                { id: 'flow', text: questions_translated[1]?.options.flow, score: { therapy: 0, yoga: 2 } },
                { id: 'clarity', text: questions_translated[1]?.options.clarity, score: { therapy: 1, yoga: 2 } },
            ]
        }
    ];

    const RECOMMENDATIONS: any = {
        yoga: {
            title: t('home.quiz.results.yoga.title'),
            description: t('home.quiz.results.yoga.description'),
            cta: t('home.quiz.results.yoga.cta'),
            link: "yoga",
            image: "🧘‍♀️"
        },
        therapy: {
            title: t('home.quiz.results.therapy.title'),
            description: t('home.quiz.results.therapy.description'),
            cta: t('home.quiz.results.therapy.cta'),
            link: "masajes-y-terapias",
            image: "💆‍♂️"
        }
    };

    const handleStart = () => setStarted(true);

    const handleAnswer = (option: any) => {
        const newAnswers = [...answers, option];
        setAnswers(newAnswers);

        if (currentQIndex < QUESTIONS.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
        } else {
            calculateResult(newAnswers);
        }
    };

    const calculateResult = (finalAnswers: any[]) => {
        let yogaScore = 0;
        let therapyScore = 0;

        finalAnswers.forEach(ans => {
            if (['energetic', 'seeking', 'flow', 'clarity'].includes(ans.id)) yogaScore++;
            if (['tired', 'stiff', 'relax', 'heal'].includes(ans.id)) therapyScore++;
        });

        setResult(yogaScore > therapyScore ? 'yoga' : 'therapy');
    };

    const resetQuiz = () => {
        setStarted(false);
        setCurrentQIndex(0);
        setAnswers([]);
        setResult(null);
    };

    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(`/${path}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <section className="py-20 px-4 bg-bone text-bark overflow-hidden relative">
            <div className="max-w-4xl mx-auto text-center relative z-10">

                <AnimatePresence mode="wait">
                    {!started && !result && (
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
                                onClick={handleStart}
                                className="bg-forest text-bone text-lg md:text-xl font-bold py-4 px-12 rounded-full hover:bg-matcha hover:text-forest transition-all duration-300 shadow-lg transform hover:scale-105"
                            >
                                {t('home.quiz.cta_start')}
                            </button>
                        </motion.div>
                    )}

                    {started && !result && (
                        <motion.div
                            key={`question-${currentQIndex}`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-xl border border-bark/5 max-w-2xl mx-auto"
                        >
                            <div className="mb-8">
                                <span className="text-sm uppercase tracking-widest text-forest/60">
                                    {t('home.quiz.progress', { current: currentQIndex + 1, total: QUESTIONS.length })}
                                </span>
                                <div className="w-full bg-bark/10 h-1 mt-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-forest h-full transition-all duration-500"
                                        style={{ width: `${((currentQIndex + 1) / QUESTIONS.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <h3 className="text-2xl md:text-4xl font-headers text-bark mb-10">
                                {QUESTIONS[currentQIndex].question}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {QUESTIONS[currentQIndex].options.map((option: any) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAnswer(option)}
                                        className="p-6 rounded-xl bg-bone border-2 border-bark/10 hover:border-forest/50 hover:bg-forest/5 transition-all duration-300 text-left flex items-center gap-4 group"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{option.icon || '✨'}</span>
                                        <span className="font-medium text-bark/90 group-hover:text-forest">{option.text}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#Fdfbf7] rounded-3xl p-10 md:p-16 shadow-2xl border-2 border-forest/10 max-w-3xl mx-auto relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-matcha to-forest"></div>

                            <div className="text-6xl mb-6">{RECOMMENDATIONS[result].image}</div>

                            <h3 className="text-sm uppercase tracking-[0.3em] text-forest mb-2">{t('home.quiz.recommendation_title')}</h3>
                            <h2 className="text-3xl md:text-5xl font-headers text-bark mb-6">
                                {RECOMMENDATIONS[result].title}
                            </h2>

                            <p className="text-xl text-bark/80 mb-10 leading-relaxed max-w-2xl mx-auto">
                                {RECOMMENDATIONS[result].description}
                            </p>

                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => handleNavigation(RECOMMENDATIONS[result].link)}
                                    className="bg-forest text-bone text-lg font-bold py-4 px-10 rounded-full hover:bg-matcha hover:text-forest transition-all duration-300 shadow-lg"
                                >
                                    {RECOMMENDATIONS[result].cta}
                                </button>
                                <button
                                    onClick={resetQuiz}
                                    className="text-forest underline underline-offset-4 hover:text-matcha transition-colors py-2"
                                >
                                    {t('home.quiz.restart')}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default WellnessQuiz;
