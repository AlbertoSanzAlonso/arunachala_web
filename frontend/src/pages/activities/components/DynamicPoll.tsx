import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'config';
import { getTranslated } from 'utils/translate';
import { getImageUrl } from 'utils/imageUtils';
import ShareButton from 'components/ui/ShareButton';

interface Activity {
    id: number;
    title: string;
    description: string | null;
    image_url: string | null;
    translations?: any;
    activity_data?: any;
}

interface UserSuggestion {
    id: number;
    activity_id: number | null;
    activity_type: string | null;
}

interface DynamicPollProps {
    activity: Activity;
    userSuggestions: UserSuggestion[];
    onVote: () => void;
    showShare?: boolean;
}

const DynamicPoll: React.FC<DynamicPollProps> = ({ activity, userSuggestions, onVote, showShare = true }) => {
    const { t, i18n } = useTranslation();
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyVoted, setAlreadyVoted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isMultiple = activity.activity_data?.allow_multiple || false;
    const pollOptions = activity.activity_data?.options || [];

    const options = pollOptions.map((o: any, index: number) => {
        const lang = (i18n.language || 'es').split('-')[0].toLowerCase();
        let translations = activity.translations;
        if (typeof translations === 'string') {
            try { translations = JSON.parse(translations); } catch (e) { translations = null; }
        }
        const langTranslations = translations?.[lang];
        let translatedTitle = o.text;
        if (langTranslations && Array.isArray(langTranslations.options) && langTranslations.options[index]) {
            translatedTitle = langTranslations.options[index];
        }
        return { id: o.text, title: translatedTitle, icon: o.icon || '✨' };
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOptions.length === 0) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activity_id: activity.id,
                    activity_type: selectedOptions.join(','),
                    comments: comments
                })
            });

            if (response.ok) {
                setSubmitted(true);
                onVote();
            } else {
                const data = await response.json();
                if (response.status === 400 && (data.detail?.includes('voto') || data.detail?.includes('propuesta'))) {
                    setAlreadyVoted(true);
                    setSubmitted(true);
                } else {
                    setSubmitError(data.detail || 'Error al registrar el voto');
                }
            }
        } catch (error) {
            console.error("Error submitting vote:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/20 shadow-xl text-center space-y-6"
            >
                <div className="text-5xl">{alreadyVoted ? '💡' : '✅'}</div>
                <h3 className="text-xl font-headers text-forest uppercase tracking-widest">
                    {alreadyVoted ? t('activities.suggestions.already_voted_title') : t('common.thanks')}
                </h3>
                <p className="text-bark/60 text-sm italic">
                    {alreadyVoted ? t('activities.suggestions.already_voted_desc') : t('activities.suggestions.vote_recorded')}
                </p>
            </motion.div>
        );
    }

    return (
        <div className="bg-white/40 backdrop-blur-md p-5 pb-8 md:pt-10 md:pb-12 md:px-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/20 shadow-xl space-y-10 overflow-hidden relative">
            {activity.image_url && (
                <div className="h-64 md:h-80 -mt-5 -mx-5 md:-mt-10 md:-mx-12 mb-10 overflow-hidden relative">
                    <img src={getImageUrl(activity.image_url)} alt={getTranslated(activity, 'title', i18n.language)} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
                </div>
            )}
            {showShare && (
                <div className="absolute top-4 right-4 z-10">
                    <ShareButton
                        url={`/actividades?activity=${activity.id}`}
                        title={getTranslated(activity, 'title', i18n.language)}
                        text={t('activities.suggestions.share_text')}
                        className="p-3 bg-white/60 backdrop-blur-md rounded-full text-forest hover:bg-forest hover:text-white shadow-sm transition-all focus:outline-none"
                        iconClassName="w-5 h-5"
                        showLabel={true}
                    />
                </div>
            )}
            <div className="text-center space-y-3">
                <h3 className="text-2xl md:text-3xl font-headers text-forest uppercase tracking-wider">{getTranslated(activity, 'title', i18n.language)}</h3>
                {activity.description && <p className="text-bark/60 max-w-xl mx-auto italic text-sm">{getTranslated(activity, 'description', i18n.language)}</p>}
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8">
                <div className="flex flex-col gap-3">
                    {options.map((option: any) => {
                        const votes = userSuggestions.filter(s => s.activity_id === activity.id && s.activity_type?.split(',').map(x => x.trim()).includes(option.id)).length;
                        const isSelected = selectedOptions.includes(option.id);
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                    if (isMultiple) {
                                        setSelectedOptions(prev => prev.includes(option.id) ? prev.filter(x => x !== option.id) : [...prev, option.id]);
                                    } else {
                                        setSelectedOptions(isSelected ? [] : [option.id]);
                                    }
                                }}
                                className={`group relative w-full px-4 py-4 md:px-8 md:py-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-4 ${isSelected ? 'border-matcha bg-matcha/10 shadow-md scale-[1.02]' : 'border-forest/5 bg-white/50 hover:border-matcha/30 hover:bg-white'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{option.icon}</span>
                                    <span className={`text-xs font-bold uppercase tracking-widest text-left ${isSelected ? 'text-forest' : 'text-bark/70'}`}>{option.title}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {votes > 0 && <span className="text-[10px] font-bold text-matcha bg-matcha/10 px-3 py-1 rounded-full">{votes} {votes === 1 ? t('activities.suggestions.voto_unit') : t('activities.suggestions.voto_plural')}</span>}
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-matcha bg-matcha' : 'border-forest/20'}`}>
                                        {isSelected && <span className="text-[10px] text-white">✓</span>}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-4 pt-4 border-t border-forest/5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-forest/50 ml-1">{getTranslated(activity, 'custom_field_label', i18n.language) || activity.activity_data?.custom_field_label || t('activities.suggestions.label_comments')}</label>
                    <textarea
                        rows={2}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder={t('activities.suggestions.placeholder_comments')}
                        className="w-full bg-white/50 border border-forest/10 rounded-2xl px-6 py-4 text-bark text-sm focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all resize-none"
                    />
                </div>

                <button type="submit" disabled={isSubmitting || selectedOptions.length === 0} className="w-full py-4 bg-forest text-white rounded-full font-headers uppercase tracking-widest text-sm hover:bg-matcha hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-20">
                    {isSubmitting ? t('common.sending') : t('activities.suggestions.vote_now')}
                </button>
                {submitError && <p className="text-red-500 text-xs text-center font-bold animate-pulse">⚠️ {submitError}</p>}
            </form>
        </div>
    );
};

export default DynamicPoll;
