import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'config';

// Sub-components
import QuizIntro from './QuizIntro';
import QuizQuestion from './QuizQuestion';
import QuizLoading from './QuizLoading';
import QuizResults from './QuizResults';

// Data & Types
import { QUIZ_TREE, PROMPT_LABELS } from './constants';
import { Answer } from './types';

const WellnessQuiz: React.FC = () => {
    const { t, i18n } = useTranslation();
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
            await fetchRecommendation(newHistory);
        }
    };

    const handleCustomSubmit = () => {
        if (!customValue.trim()) return;
        const defaultNext = currentNode.options[0]?.next;
        handleOptionClick({ id: 'OTHER', text: customValue, next: defaultNext });
    };

    const fetchRecommendation = async (finalHistory: Answer[]) => {
        setLoadingAI(true);
        const conversationPath = finalHistory.map(h => `P: ${h.question} R: ${h.answer}`).join('\n');

        const currentLang = (i18n.language.split('-')[0] || 'es') as keyof typeof PROMPT_LABELS;
        const L = PROMPT_LABELS[currentLang] || PROMPT_LABELS.es;

        const prompt = `
${L.intro}
${conversationPath}

${L.instr}
**${L.h1}** ${L.h1_desc}
**${L.h2}** ${L.h2_desc}
**${L.h3}** ${L.h3_desc}
**${L.h4}** ${L.h4_desc}
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

    return (
        <section className="py-20 px-4 bg-bone text-bark overflow-hidden relative">
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <AnimatePresence mode="wait">
                    {!started && !aiResponse && (
                        <QuizIntro onStart={handleStart} />
                    )}

                    {started && !aiResponse && !loadingAI && currentNode && (
                        <QuizQuestion
                            currentNode={currentNode}
                            progress={progress}
                            showCustomInput={showCustomInput}
                            customValue={customValue}
                            onBack={handleBack}
                            onOptionClick={handleOptionClick}
                            onCustomSubmit={handleCustomSubmit}
                            setShowCustomInput={setShowCustomInput}
                            setCustomValue={setCustomValue}
                        />
                    )}

                    {loadingAI && (
                        <QuizLoading />
                    )}

                    {aiResponse && (
                        <QuizResults
                            aiResponse={aiResponse}
                            onReset={handleStart}
                        />
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default WellnessQuiz;
