import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

// Define the structure of a node in the decision tree
interface TreeNode {
    id: string;
    questionKey: string; // Translation key for the question
    options: {
        id: string; // Internal ID for logic
        textKey: string; // Translation key for the option
        next?: string; // ID of the next node. If undefined, it's a leaf.
    }[];
}

// Tree Definition based on User Request
const QUIZ_TREE: Record<string, TreeNode> = {
    'root': {
        id: 'root',
        questionKey: 'home.quiz.l1.question',
        options: [
            { id: 'A', textKey: 'home.quiz.l1.options.A', next: 'L2-A' },
            { id: 'B', textKey: 'home.quiz.l1.options.B', next: 'L2-B' },
            { id: 'C', textKey: 'home.quiz.l1.options.C', next: 'L2-C' }
        ]
    },
    'L2-A': {
        id: 'L2-A',
        questionKey: 'home.quiz.l2.A.question',
        options: [
            { id: 'A1', textKey: 'home.quiz.l2.A.options.A1', next: 'L3-A1' },
            { id: 'A2', textKey: 'home.quiz.l2.A.options.A2', next: 'L3-A2' }
        ]
    },
    'L2-B': {
        id: 'L2-B',
        questionKey: 'home.quiz.l2.B.question',
        options: [
            { id: 'B1', textKey: 'home.quiz.l2.B.options.B1', next: 'L3-B1' },
            { id: 'B2', textKey: 'home.quiz.l2.B.options.B2', next: 'L3-B2' }
        ]
    },
    'L2-C': {
        id: 'L2-C',
        questionKey: 'home.quiz.l2.C.question',
        options: [
            { id: 'C1', textKey: 'home.quiz.l2.C.options.C1', next: 'L3-C1' },
            { id: 'C2', textKey: 'home.quiz.l2.C.options.C2', next: 'L3-C2' }
        ]
    },
    'L3-A1': {
        id: 'L3-A1',
        questionKey: 'home.quiz.l3.A1.question',
        options: [
            { id: 'A1-1', textKey: 'home.quiz.l3.A1.options.1', next: 'L4-FINAL' },
            { id: 'A1-2', textKey: 'home.quiz.l3.A1.options.2', next: 'L4-FINAL' }
        ]
    },
    'L3-A2': {
        id: 'L3-A2',
        questionKey: 'home.quiz.l3.A2.question',
        options: [
            { id: 'A2-1', textKey: 'home.quiz.l3.A2.options.1', next: 'L4-FINAL' },
            { id: 'A2-2', textKey: 'home.quiz.l3.A2.options.2', next: 'L4-FINAL' }
        ]
    },
    'L3-B1': {
        id: 'L3-B1',
        questionKey: 'home.quiz.l3.B1.question',
        options: [
            { id: 'B1-1', textKey: 'home.quiz.l3.B1.options.1', next: 'L4-FINAL' },
            { id: 'B1-2', textKey: 'home.quiz.l3.B1.options.2', next: 'L4-FINAL' }
        ]
    },
    'L3-B2': {
        id: 'L3-B2',
        questionKey: 'home.quiz.l3.B2.question',
        options: [
            { id: 'B2-1', textKey: 'home.quiz.l3.B2.options.1', next: 'L4-FINAL' },
            { id: 'B2-2', textKey: 'home.quiz.l3.B2.options.2', next: 'L4-FINAL' }
        ]
    },
    'L3-C1': {
        id: 'L3-C1',
        questionKey: 'home.quiz.l3.C1.question',
        options: [
            { id: 'C1-1', textKey: 'home.quiz.l3.C1.options.1', next: 'L4-FINAL' },
            { id: 'C1-2', textKey: 'home.quiz.l3.C1.options.2', next: 'L4-FINAL' }
        ]
    },
    'L3-C2': {
        id: 'L3-C2',
        questionKey: 'home.quiz.l3.C2.question',
        options: [
            { id: 'C2-1', textKey: 'home.quiz.l3.C2.options.1', next: 'L4-FINAL' },
            { id: 'C2-2', textKey: 'home.quiz.l3.C2.options.2', next: 'L4-FINAL' }
        ]
    },
    'L4-FINAL': {
        id: 'L4-FINAL',
        questionKey: 'home.quiz.l4.question',
        options: [
            { id: 'NO_EXTRA', textKey: 'home.quiz.l4.options.no' }
            // 'OTHER' is implicitly handled by the UI
        ]
    }
};

interface Answer {
    question: string;
    answer: string;
    nodeId: string;
}

const WellnessQuiz: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [started, setStarted] = useState(false);
    const [currentNodeId, setCurrentNodeId] = useState<string>('root');
    const [history, setHistory] = useState<Answer[]>([]);
    const [loadingAI, setLoadingAI] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customValue, setCustomValue] = useState("");

    const currentNode = QUIZ_TREE[currentNodeId];
    const progress = Math.min((history.length + 1), 4);

    const handleStart = () => {
        setStarted(true);
        setCurrentNodeId('root');
        setHistory([]);
        setAiResponse(null);
        setShowCustomInput(false);
        setCustomValue("");
    };

    const handleBack = () => {
        if (history.length === 0) {
            setStarted(false);
            return;
        }
        const lastStep = history[history.length - 1];
        setCurrentNodeId(lastStep.nodeId);
        setHistory(history.slice(0, -1));
        setShowCustomInput(false);
        setCustomValue("");
    };

    const handleOptionClick = async (option: { id: string, textKey?: string, text?: string, next?: string }) => {
        const answerText = option.text || t(option.textKey || '');
        const questionText = t(currentNode.questionKey);

        const newHistory = [...history, { question: questionText, answer: answerText, nodeId: currentNodeId }];
        setHistory(newHistory);
        setShowCustomInput(false);
        setCustomValue("");

        if (option.next) {
            setCurrentNodeId(option.next);
        } else {
            await fetchRecommendation(newHistory, answerText);
        }
    };

    const handleCustomSubmit = () => {
        if (!customValue.trim()) return;
        // Move to the next node of the FIRST option as a default flow, or finish if no next
        const defaultNext = currentNode.options[0]?.next;
        handleOptionClick({ id: 'OTHER', text: customValue, next: defaultNext });
    };

    const fetchRecommendation = async (finalHistory: Answer[], lastAnswer: string) => {
        setLoadingAI(true);
        const conversationPath = finalHistory.map(h => `P: ${h.question} R: ${h.answer}`).join('\n');

        const promptLabels = {
            es: {
                intro: 'Analiza mi camino de respuestas en el cuestionario "Un Momento para Escucharte":',
                instr: 'Genera mi hoja de ruta de bienestar personalizada en exactamente 4 bloques. Deriva hacia Terapias/Masajes si el malestar es físico/localizado, y hacia Yoga si el malestar es emocional/mental. USA EL FORMATO DE BOTONES: [[BUTTON:Saber más|/URL]]. PROHIBIDO poner ":" o "." tras los títulos en negrita.',
                h1: 'Sobre lo que nos has compartido',
                h2: 'Nuestra propuesta para ti',
                h3: 'Un recurso para profundizar',
                h4: 'Un pequeño apoyo para ahora'
            },
            en: {
                intro: 'Analyze my answers path in the "A Moment to Listen to Yourself" quiz:',
                instr: 'Generate my personalized wellness roadmap in exactly 4 blocks. Lean towards Therapies/Massages if the discomfort is physical/localized/acute, and towards Yoga if it is emotional/mental/stress. USE BUTTON FORMAT: [[BUTTON:Learn more|/URL]]. FORBIDDEN to put ":" or "." after bold headers.',
                h1: 'About what you shared',
                h2: 'Our proposal for you',
                h3: 'A resource to deepen',
                h4: 'A little support for now'
            },
            ca: {
                intro: 'Analitza el meu camí de respostes en el qüestionari "Un moment per Escoltar-te":',
                instr: 'Genera el meu full de ruta de benestar personalitzat en exactament 4 blocs. Deriva cap a Teràpies/Massatges si el malestar és físic/localitzat, i cap a Ioga si el malestar és emocional/mental. UTILITZA EL FORMAT DE BOTONS: [[BUTTON:Saber-ne més|/URL]]. PROHIBIT posar ":" o "." després dels títols en negreta.',
                h1: 'Sobre el que ens has compartit',
                h2: 'La nostra proposta per a tu',
                h3: 'Un recurs per aprofundir',
                h4: 'Un petit suport per ara'
            }
        };

        const currentLang = (i18n.language.split('-')[0] || 'es') as keyof typeof promptLabels;
        const L = promptLabels[currentLang] || promptLabels.es;

        const prompt = `
${L.intro}
${conversationPath}

${L.instr}
**${L.h1}** (Análisis breve)
**${L.h2}** (Menciona UNA actividad real: clase, masaje, terapia o actividad)
**${L.h3}** (Menciona UN contenido real: artículo o meditación)
**${L.h4}** (Consejo práctico inmediato)
        `;

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }],
                    stream: false,
                    language: i18n.language,
                    is_quiz: true
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.response) {
                    setAiResponse(data.response);
                } else {
                    setAiResponse(t('home.quiz.fallback_response', 'Gracias por compartir. Te esperamos en el centro.'));
                }
            } else {
                setAiResponse(t('home.quiz.error_ai', 'Lo siento, no pudimos conectar con el especialista virtual. Por favor, acércate al centro y te asesoraremos personalmente.'));
            }
        } catch (error) {
            console.error(error);
            setAiResponse(t('home.quiz.error_connection', 'Hubo un error de conexión. Inténtalo de nuevo más tarde.'));
        } finally {
            setLoadingAI(false);
        }
    };

    const resetQuiz = () => {
        handleStart();
    };

    return (
        <section className="py-20 px-4 bg-bone text-bark overflow-hidden relative">
            <div className="max-w-4xl mx-auto text-center relative z-10">

                <AnimatePresence mode="wait">
                    {!started && !aiResponse && (
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

                    {started && !aiResponse && !loadingAI && currentNode && (
                        <motion.div
                            key={currentNodeId}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-xl border border-bark/5 max-w-2xl mx-auto"
                        >
                            <div className="mb-8 flex items-center justify-between gap-4">
                                <button
                                    onClick={handleBack}
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
                                            onClick={() => handleOptionClick(option)}
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
                                            {currentNodeId === 'L4-FINAL' ? '✎' : '+'}
                                        </div>
                                        <span className="text-lg font-light italic">
                                            {currentNodeId === 'L4-FINAL' ? t('home.quiz.l4.options.yes') : t('home.quiz.other')}
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
                                            onClick={handleCustomSubmit}
                                            className="flex-1 px-8 py-3 rounded-full bg-forest text-bone font-bold hover:bg-matcha hover:text-forest transition-all shadow-lg disabled:opacity-50"
                                        >
                                            {t('home.quiz.confirm')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {loadingAI && (
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
                    )}

                    {aiResponse && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#Fdfbf7] rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-forest/10 max-w-4xl mx-auto relative overflow-hidden text-left"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-matcha to-forest"></div>

                            <div className="text-center mb-8">
                                <span className="text-4xl">🌿</span>
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
