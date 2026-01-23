import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Mock Data for Quiz
const QUESTIONS = [
    {
        id: 1,
        question: "¿Cómo te sientes hoy?",
        options: [
            { id: 'tired', text: 'Cansado y estresado', icon: '😴' }, // Leads to Therapy
            { id: 'stiff', text: 'Con tensión física', icon: '🤕' }, // Leads to Yoga/Therapy
            { id: 'energetic', text: 'Con energía para moverme', icon: '⚡' }, // Leads to Yoga
            { id: 'seeking', text: 'Buscando paz interior', icon: '🙏' }, // Leads to Meditation/Yoga
        ]
    },
    {
        id: 2,
        question: "¿Qué es lo que más necesitas ahora mismo?",
        options: [
            { id: 'relax', text: 'Desconectar y relajarme', score: { therapy: 2, yoga: 0 } },
            { id: 'heal', text: 'Aliviar dolor muscular', score: { therapy: 2, yoga: 1 } },
            { id: 'flow', text: 'Fluir y fortalecer', score: { therapy: 0, yoga: 2 } },
            { id: 'clarity', text: 'Claridad mental', score: { therapy: 1, yoga: 2 } },
        ]
    }
];

const RECOMMENDATIONS = {
    yoga: {
        title: "Tu camino es el Yoga",
        description: "Tu cuerpo pide movimiento consciente y conexión. Te recomendamos unirte a nuestras clases de Vinyasa Flow o Hatha Yoga para canalizar esa energía.",
        cta: "Ver Horarios de Yoga",
        link: "yoga", // ID to scroll to
        image: "🧘‍♀️"
    },
    therapy: {
        title: "Necesitas Sanación y Descanso",
        description: "Es momento de parar y cuidar de ti. Nuestras terapias holísticas o un masaje relajante son justo lo que necesitas para restaurar tu equilibrio.",
        cta: "Reservar Terapia",
        link: "therapies", // ID to scroll to
        image: "💆‍♂️"
    }
};

const WellnessQuiz: React.FC = () => {
    const [started, setStarted] = useState(false);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    const [result, setResult] = useState<keyof typeof RECOMMENDATIONS | null>(null);

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
        // Simple logic: Count 'therapy' vs 'yoga' leanings
        // This is a naive implementation for demo purposes
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
                            <h2 className="text-3xl md:text-5xl font-headers text-forest mb-6">¿Cómo estás hoy?</h2>
                            <p className="text-xl md:text-2xl text-bark/80 mb-10 font-light leading-relaxed">
                                Descubre qué experiencia de Arunachala resuena mejor contigo en este momento.
                                <br />Toma solo unos segundos.
                            </p>
                            <button
                                onClick={handleStart}
                                className="bg-forest text-bone text-lg md:text-xl font-bold py-4 px-12 rounded-full hover:bg-matcha hover:text-forest transition-all duration-300 shadow-lg transform hover:scale-105"
                            >
                                Descubrir mi momento
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
                                <span className="text-sm uppercase tracking-widest text-forest/60">Pregunta {currentQIndex + 1} de {QUESTIONS.length}</span>
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

                            <h3 className="text-sm uppercase tracking-[0.3em] text-forest mb-2">Tu Recomendación Personalizada</h3>
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
                                    Volver a empezar
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
