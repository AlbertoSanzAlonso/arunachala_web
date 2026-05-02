import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'config';

interface GlobalCustomSuggestionProps {
    onSubmitted: () => void;
}

const GlobalCustomSuggestion: React.FC<GlobalCustomSuggestionProps> = ({ onSubmitted }) => {
    const { t } = useTranslation();
    const [customSuggestion, setCustomSuggestion] = useState('');
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyVoted, setAlreadyVoted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customSuggestion.trim()) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ custom_suggestion: customSuggestion, comments: comments })
            });

            if (response.ok) {
                setSubmitted(true);
                onSubmitted();
            } else {
                const data = await response.json();
                if (response.status === 400 && (data.detail?.includes('voto') || data.detail?.includes('propuesta'))) {
                    setAlreadyVoted(true);
                    setSubmitted(true);
                } else {
                    setSubmitError(data.detail || 'Error al enviar la propuesta');
                }
            }
        } catch (error) {
            console.error("Error submitting custom suggestion:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto text-center py-8 px-8 bg-matcha/10 rounded-[2rem] border border-matcha/20"
            >
                <h4 className="text-forest font-headers uppercase tracking-wider mb-2">
                    {alreadyVoted ? '💡 ' + t('activities.suggestions.already_voted_title') : '💡 ' + t('activities.suggestions.idea_received')}
                </h4>
                <p className="text-bark/70 text-sm">{alreadyVoted ? t('activities.suggestions.already_voted_desc') : t('activities.suggestions.thanks_desc')}</p>
            </motion.div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-10 bg-white/40 backdrop-blur-sm p-6 pb-10 md:pt-10 md:pb-12 md:px-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/20 shadow-lg">
                <div className="text-center space-y-4">
                    <span className="inline-block px-4 py-1.5 bg-forest/5 text-forest text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">{t('activities.suggestions.label_custom_tag')}</span>
                    <h3 className="text-2xl font-headers text-forest uppercase tracking-wider">{t('activities.suggestions.custom_title')}</h3>
                    <p className="text-bark/60 text-sm italic">{t('activities.suggestions.custom_subtitle')}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-forest/60 ml-1">{t('activities.suggestions.custom_label')}</label>
                    <input
                        type="text"
                        required
                        value={customSuggestion}
                        onChange={(e) => setCustomSuggestion(e.target.value)}
                        placeholder={t('activities.suggestions.placeholder_custom')}
                        className="w-full bg-white border border-forest/10 rounded-2xl px-5 py-3 md:px-6 md:py-4 text-bark focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-forest/60 ml-1">{t('activities.suggestions.custom_details_label')}</label>
                    <textarea
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder={t('activities.suggestions.placeholder_comments')}
                        className="w-full bg-white border border-forest/10 rounded-2xl px-5 py-3 md:px-6 md:py-4 text-bark focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all resize-none"
                    />
                </div>

                <button type="submit" disabled={isSubmitting || !customSuggestion.trim()} className="w-full py-4 bg-matcha text-white rounded-full font-headers uppercase tracking-widest text-sm hover:bg-forest hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-20">
                    {isSubmitting ? t('common.sending') : t('activities.suggestions.submit_idea')}
                </button>
                {submitError && <p className="text-red-500 text-xs text-center font-bold animate-pulse">⚠️ {submitError}</p>}
            </form>
        </div>
    );
};

export default GlobalCustomSuggestion;
