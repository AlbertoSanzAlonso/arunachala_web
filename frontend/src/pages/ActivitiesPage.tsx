import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import NewsletterForm from '../components/NewsletterForm';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';

import lotusFlower from '../assets/images/lotus_flower.png';

interface Activity {
    id: number;
    title: string;
    description: string | null;
    type: string;
    start_date: string | null;
    end_date: string | null;
    location: string | null;
    price: string | null;
    image_url: string | null;
    translations?: any;
    activity_data?: any;
}

interface UserSuggestion {
    id: number;
    activity_id: number | null;
    activity_type: string | null;
    custom_suggestion: string | null;
    comments: string | null;
    created_at: string;
}


const DynamicPoll = ({ activity, userSuggestions, onVote }: { activity: Activity, userSuggestions: UserSuggestion[], onVote: () => void }) => {
    const { t, i18n } = useTranslation();
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyVoted, setAlreadyVoted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const pollOptions = activity.activity_data?.options || [];
    const allowCustom = activity.activity_data?.allow_custom || false;

    const [customText, setCustomText] = useState('');
    const [isCustomActive, setIsCustomActive] = useState(false);
    const [existingProposals, setExistingProposals] = useState<{ text: string; votes: number }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredProposals, setFilteredProposals] = useState<{ text: string; votes: number }[]>([]);

    // Load existing custom proposals when custom option is activated
    useEffect(() => {
        if (isCustomActive && existingProposals.length === 0) {
            fetch(`${API_BASE_URL}/api/suggestions/custom-proposals/${activity.id}`)
                .then(res => res.json())
                .then(data => setExistingProposals(data))
                .catch(err => console.error('Error loading proposals:', err));
        }
    }, [isCustomActive, activity.id, existingProposals.length]);

    // Filter proposals based on input
    useEffect(() => {
        if (customText.trim().length > 0) {
            const filtered = existingProposals.filter(p =>
                p.text.toLowerCase().includes(customText.toLowerCase())
            );
            setFilteredProposals(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setFilteredProposals(existingProposals);
            setShowSuggestions(false);
        }
    }, [customText, existingProposals]);

    const options = pollOptions.map((o: any, index: number) => {
        const lang = (i18n.language || 'es').split('-')[0].toLowerCase();

        // Safety check for translations being a string
        let translations = activity.translations;
        if (typeof translations === 'string') {
            try { translations = JSON.parse(translations); } catch (e) { translations = null; }
        }

        const langTranslations = translations?.[lang];
        let translatedTitle = o.text;

        if (langTranslations && Array.isArray(langTranslations.options)) {
            if (langTranslations.options[index]) {
                translatedTitle = langTranslations.options[index];
            }
        }

        return {
            id: o.text,
            title: translatedTitle,
            icon: o.icon || '✨' // Use the saved icon or default sparkle
        };
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedActivity && !isCustomActive) return;

        setIsSubmitting(true);
        try {
            const payload = {
                activity_id: activity.id,
                activity_type: isCustomActive ? 'custom' : selectedActivity,
                custom_suggestion: isCustomActive ? customText : null,
                comments: comments
            };

            const response = await fetch(`${API_BASE_URL}/api/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSubmitted(true);
                setSubmitError(null);
                onVote();
            } else {
                const data = await response.json();
                if (response.status === 400 && (data.detail?.includes('voto') || data.detail?.includes('propuesta'))) {
                    setAlreadyVoted(true);
                    setSubmitted(true);
                    setSubmitError(null);
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
                    {alreadyVoted ? t('activities.suggestions.already_voted_title', 'Ya hemos recibido tu participación') : t('common.thanks', '¡Gracias!')}
                </h3>
                <p className="text-bark/60 text-sm italic">
                    {alreadyVoted ? t('activities.suggestions.already_voted_desc', 'Muchas gracias por tu interés...') : t('activities.suggestions.vote_recorded', 'Tu voto ha sido registrado correctamente.')}
                </p>
            </motion.div>

        );
    }

    return (
        <div className="bg-white/40 backdrop-blur-md p-5 pb-8 md:pt-10 md:pb-12 md:px-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/20 shadow-xl space-y-10 overflow-hidden">
            {activity.image_url && (
                <div className="h-64 md:h-80 -mt-5 -mx-5 md:-mt-10 md:-mx-12 mb-10 overflow-hidden relative">
                    <img
                        src={activity.image_url.startsWith('http') ? activity.image_url : `${API_BASE_URL}${activity.image_url}`}
                        alt={getTranslated(activity, 'title', i18n.language)}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
                </div>
            )}
            <div className="text-center space-y-3">
                <h3 className="text-2xl md:text-3xl font-headers text-forest uppercase tracking-wider">
                    {getTranslated(activity, 'title', i18n.language)}
                </h3>
                {activity.description && (
                    <p className="text-bark/60 max-w-xl mx-auto italic text-sm">
                        {getTranslated(activity, 'description', i18n.language)}
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8">
                <div className="flex flex-col gap-3">
                    {options.map((option: any) => {
                        const votes = userSuggestions.filter(s => s.activity_id === activity.id && s.activity_type === option.id).length;
                        const isSelected = selectedActivity === option.id && !isCustomActive;

                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                    setSelectedActivity(isSelected ? null : option.id);
                                    setIsCustomActive(false);
                                }}
                                className={`group relative w-full px-4 py-4 md:px-8 md:py-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-4 ${isSelected
                                    ? 'border-matcha bg-matcha/10 shadow-md scale-[1.02]'
                                    : 'border-forest/5 bg-white/50 hover:border-matcha/30 hover:bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{option.icon}</span>
                                    <span className={`text-xs font-bold uppercase tracking-widest text-left ${isSelected ? 'text-forest' : 'text-bark/70'}`}>
                                        {option.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {votes > 0 && (
                                        <span className="text-[10px] font-bold text-matcha bg-matcha/10 px-3 py-1 rounded-full">
                                            {votes} {votes === 1 ? t('activities.suggestions.voto_unit', 'voto') : t('activities.suggestions.voto_plural', 'votos')}
                                        </span>
                                    )}

                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-matcha bg-matcha' : 'border-forest/20'}`}>
                                        {isSelected && <span className="text-[10px] text-white">✓</span>}
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    {allowCustom && (
                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCustomActive(!isCustomActive);
                                    setSelectedActivity(null);
                                }}
                                className={`group relative w-full px-4 py-4 md:px-8 md:py-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-4 ${isCustomActive
                                    ? 'border-matcha bg-matcha/10 shadow-md scale-[1.02]'
                                    : 'border-forest/5 bg-white/50 hover:border-matcha/30 hover:bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">💡</span>
                                    <span className={`text-xs font-bold uppercase tracking-widest text-left ${isCustomActive ? 'text-forest' : 'text-bark/70'}`}>
                                        {t('activities.suggestions.other_option', 'Otra propuesta...')}
                                    </span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isCustomActive ? 'border-matcha bg-matcha' : 'border-forest/20'}`}>
                                    {isCustomActive && <span className="text-[10px] text-white">✓</span>}
                                </div>
                            </button>

                            {isCustomActive && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="px-2 relative"
                                >
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={customText}
                                            onChange={(e) => setCustomText(e.target.value)}
                                            onFocus={() => {
                                                if (existingProposals.length > 0) {
                                                    // Show all proposals if field is empty, or filtered ones if there's text
                                                    if (customText.trim().length === 0) {
                                                        setFilteredProposals(existingProposals);
                                                    }
                                                    setShowSuggestions(true);
                                                }
                                            }}
                                            onBlur={() => {
                                                // Delay to allow click on suggestion
                                                setTimeout(() => setShowSuggestions(false), 200);
                                            }}
                                            placeholder={t('activities.suggestions.placeholder_custom_poll', 'Escribe tu idea aquí...')}
                                            className="w-full bg-white/80 border border-matcha/30 rounded-xl px-6 py-4 text-bark text-sm focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all shadow-inner"
                                            autoFocus
                                        />

                                        {/* Autocomplete Dropdown */}
                                        {showSuggestions && filteredProposals.length > 0 && (
                                            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-matcha/20 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                                                <div className="p-2 bg-matcha/5 border-b border-matcha/10">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-forest/60 px-2">
                                                        💡 Propuestas existentes - Únete a una o crea la tuya
                                                    </p>
                                                </div>
                                                <div className="p-1">
                                                    {filteredProposals.map((proposal, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => {
                                                                setCustomText(proposal.text);
                                                                setShowSuggestions(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-matcha/10 transition-colors group flex items-start justify-between gap-3"
                                                        >
                                                            <div className="flex-grow min-w-0">
                                                                <p className="text-sm font-medium text-bark group-hover:text-forest transition-colors line-clamp-2">
                                                                    {proposal.text}
                                                                </p>
                                                            </div>
                                                            <div className="flex-shrink-0 flex items-center gap-1.5 bg-matcha/10 px-2.5 py-1 rounded-full">
                                                                <span className="text-[10px] font-bold text-matcha">
                                                                    {proposal.votes}
                                                                </span>
                                                                <span className="text-[9px] text-matcha/70">
                                                                    {proposal.votes === 1 ? 'voto' : 'votos'}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-4 border-t border-forest/5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-forest/50 ml-1">
                        {t('activities.suggestions.label_comments', 'Comentarios adicionales')}
                    </label>
                    <textarea
                        rows={2}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder={t('activities.suggestions.placeholder_comments', 'Cuéntanos un poco más...')}
                        className="w-full bg-white/50 border border-forest/10 rounded-2xl px-6 py-4 text-bark text-sm focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || (!selectedActivity && (!isCustomActive || !customText.trim()))}
                    className="w-full py-4 bg-forest text-white rounded-full font-headers uppercase tracking-widest text-sm hover:bg-matcha hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-20 disabled:pointer-events-none"
                >
                    {isSubmitting ? t('common.sending', 'Enviando...') : t('activities.suggestions.vote_now', 'Registrar mi voto')}
                </button>

                {submitError && (
                    <p className="text-red-500 text-xs text-center font-bold animate-pulse">
                        ⚠️ {submitError}
                    </p>
                )}
            </form>
        </div>
    );
};

const GlobalCustomSuggestion = ({ onSubmitted }: { onSubmitted: () => void }) => {
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
                body: JSON.stringify({
                    custom_suggestion: customSuggestion,
                    comments: comments
                })
            });

            if (response.ok) {
                setSubmitted(true);
                setSubmitError(null);
                onSubmitted();
            } else {
                const data = await response.json();
                if (response.status === 400 && (data.detail?.includes('voto') || data.detail?.includes('propuesta'))) {
                    setAlreadyVoted(true);
                    setSubmitted(true);
                    setSubmitError(null);
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
                <p className="text-bark/70 text-sm">
                    {alreadyVoted ? t('activities.suggestions.already_voted_desc') : t('activities.suggestions.thanks_desc')}
                </p>
            </motion.div>

        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-10 bg-white/40 backdrop-blur-sm p-6 pb-10 md:pt-10 md:pb-12 md:px-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/20 shadow-lg">
                <div className="text-center space-y-4">
                    <span className="inline-block px-4 py-1.5 bg-forest/5 text-forest text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
                        {t('activities.suggestions.label_custom_tag', '¿Tienes alguna idea?')}
                    </span>
                    <h3 className="text-2xl font-headers text-forest uppercase tracking-wider">{t('activities.suggestions.custom_title', 'Mándanos tu propuesta')}</h3>
                    <p className="text-bark/60 text-sm italic">{t('activities.suggestions.custom_subtitle', 'Si buscas algo muy específico que no está en la lista anterior, cuéntanoslo aquí.')}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-forest/60 ml-1">{t('activities.suggestions.custom_label', 'Tu propuesta')}</label>
                    <input
                        type="text"
                        required
                        value={customSuggestion}
                        onChange={(e) => setCustomSuggestion(e.target.value)}
                        placeholder={t('activities.suggestions.placeholder_custom', 'Ej: Taller de cocina macrobiótica...')}
                        className="w-full bg-white border border-forest/10 rounded-2xl px-5 py-3 md:px-6 md:py-4 text-bark focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-forest/60 ml-1">{t('activities.suggestions.custom_details_label', 'Detalles o comentarios')}</label>
                    <textarea
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder={t('activities.suggestions.placeholder_comments', 'Cuéntanos un poco más...')}
                        className="w-full bg-white border border-forest/10 rounded-2xl px-5 py-3 md:px-6 md:py-4 text-bark focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !customSuggestion.trim()}
                    className="w-full py-4 bg-matcha text-white rounded-full font-headers uppercase tracking-widest text-sm hover:bg-forest hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-20"
                >
                    {isSubmitting ? t('common.sending', 'Enviando...') : t('activities.suggestions.submit_idea', 'Enviar mi idea')}
                </button>

                {submitError && (
                    <p className="text-red-500 text-xs text-center font-bold animate-pulse">
                        ⚠️ {submitError}
                    </p>
                )}
            </form>
        </div>
    );
};




const ActivitiesPage: React.FC = () => {

    const { t, i18n } = useTranslation();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);

    const fetchData = async () => {
        try {
            const [actRes, sugRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/activities`),
                fetch(`${API_BASE_URL}/api/suggestions`)
            ]);

            if (actRes.ok) {
                const data = await actRes.json();
                setActivities(data || []);
            } else {
                setActivities([]);
            }
            if (sugRes.ok) {
                const data = await sugRes.json();
                setUserSuggestions(data);
            }
        } catch (error) {
            console.error("Error fetching page data:", error);
            setActivities([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    // Open modal automatically if activity ID is in URL
    useEffect(() => {
        if (activities.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const activityId = params.get('activity');

            if (activityId) {
                const activity = activities.find(a => a.id === parseInt(activityId));
                if (activity) {
                    setSelectedActivity(activity);
                    // Clean URL without reloading
                    window.history.replaceState({}, '', '/actividades');
                }
            }
        }
    }, [activities]);

    const formatShortDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return d.toLocaleDateString(i18n.language, {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const ActivityCard = ({ activity, index, onClick }: { activity: Activity, index: number, onClick?: () => void }) => (
        <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={onClick}
            className={`bg-white group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-forest/5 flex flex-col h-full ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
        >
            <div className="h-56 bg-gray-100 overflow-hidden relative">
                {activity.image_url ? (
                    <img
                        src={activity.image_url.startsWith('http') ? activity.image_url : `${API_BASE_URL}${activity.image_url}`}
                        alt={getTranslated(activity, 'title', i18n.language)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                        <img src={lotusFlower} className="w-24" alt="" />
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-forest text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                        {t(`activities.types.${activity.type}`, activity.type)}
                    </span>
                </div>
            </div>

            <div className="p-8 flex-grow flex flex-col text-left">
                <div className="flex-grow">
                    <h3 className="text-2xl font-headers text-forest mb-3 uppercase tracking-tight group-hover:text-matcha transition-colors">
                        {getTranslated(activity, 'title', i18n.language)}
                    </h3>
                    <p className="text-bark/70 text-sm leading-relaxed mb-6 line-clamp-3">
                        {getTranslated(activity, 'description', i18n.language)}
                    </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-forest/5 text-sm font-medium text-forest/80">
                    {activity.start_date && (
                        <div className="flex items-center gap-2">
                            <span className="opacity-50">🗓️</span>
                            <span>{formatShortDate(activity.start_date)}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="opacity-50">📍</span>
                        <span>{activity.location || 'Centro Arunachala'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-matcha font-bold">
                        <span className="opacity-50">💰</span>
                        <span>{activity.price || t('activities.consult_price', 'Consultar precio')}</span>
                    </div>
                </div>

                {onClick && (
                    <div className="mt-6 flex items-center gap-2 text-forest text-xs font-bold uppercase tracking-widest group-hover:gap-4 transition-all duration-300">
                        {t('common.read_more', 'Leer más')}
                        <span>→</span>
                    </div>
                )}
            </div>
        </motion.div>
    );

    const ActivityDetailModal = ({ activity, onClose }: { activity: Activity, onClose: () => void }) => {
        const navigate = (path: string) => {
            window.location.href = path; // Simple navigation
        };

        const addToGoogleCalendar = (act: Activity) => {
            const title = getTranslated(act, 'title', i18n.language);
            const details = getTranslated(act, 'description', i18n.language) || '';
            const location = act.location || 'Centro Arunachala, Cornellà';

            // Dates need to be in YYYYMMDDTHHMMSSZ format
            const formatGDate = (dateStr: string | null) => {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
            };

            const start = formatGDate(act.start_date);
            // If no end date, default to 1 hour after start
            let end = formatGDate(act.end_date);
            if (!end && act.start_date) {
                const d = new Date(act.start_date);
                d.setHours(d.getHours() + 1);
                end = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
            }

            const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&dates=${start}/${end}`;
            window.open(url, '_blank');
        };

        // Block body scroll when modal is open
        useEffect(() => {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }, []);

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-forest/40 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full text-forest hover:bg-forest hover:text-white transition-all shadow-lg"
                    >
                        ✕
                    </button>

                    <div className="overflow-y-auto custom-scrollbar">
                        <div className="h-64 md:h-96 relative">
                            {activity.image_url ? (
                                <img
                                    src={activity.image_url.startsWith('http') ? activity.image_url : `${API_BASE_URL}${activity.image_url}`}
                                    alt={getTranslated(activity, 'title', i18n.language)}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-forest/5 flex items-center justify-center opacity-20">
                                    <img src={lotusFlower} className="w-48" alt="" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-8">
                                <span className="px-4 py-2 bg-matcha text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                                    {t(`activities.types.${activity.type}`, activity.type)}
                                </span>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 space-y-8">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-headers text-forest uppercase tracking-tight mb-4">
                                    {getTranslated(activity, 'title', i18n.language)}
                                </h2>
                                <div className="w-20 h-1 bg-matcha rounded-full" />
                            </div>

                            <p className="text-bark/80 text-lg leading-relaxed whitespace-pre-wrap">
                                {getTranslated(activity, 'description', i18n.language)}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-forest/5 p-8 rounded-3xl border border-forest/10">
                                <div className="space-y-4">
                                    {activity.start_date && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-xl text-forest/50">🗓️</div>
                                            <div>
                                                <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{t('activities.labels.date', 'Fecha de inicio')}</p>
                                                <p className="text-forest font-bold">{formatShortDate(activity.start_date)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {activity.type === 'curso' && activity.end_date && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-xl text-forest/50">🏳️</div>
                                            <div>
                                                <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{t('activities.labels.end_date', 'Fecha de finalización')}</p>
                                                <p className="text-forest font-bold">{formatShortDate(activity.end_date)}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-xl text-forest/50">📍</div>
                                        <div>
                                            <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{t('activities.labels.location', 'Ubicación')}</p>
                                            <p className="text-forest font-bold">{activity.location || 'Centro Arunachala, Cornellà'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-xl text-matcha/50">💰</div>
                                        <div>
                                            <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{t('activities.labels.price', 'Inversión')}</p>
                                            <p className="text-matcha font-bold text-2xl">{activity.price || t('activities.consult_price')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-xl text-forest/50">✨</div>
                                        <div>
                                            <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{t('activities.labels.info', 'Reserva')}</p>
                                            <p className="text-forest text-sm font-medium">{t('activities.labels.info_desc', 'Plazas limitadas por orden de inscripción.')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col md:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/contacto')}
                                    className="flex-1 py-5 bg-forest text-white rounded-full font-headers uppercase tracking-widest text-sm hover:bg-matcha hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                                >
                                    <span>📩</span>
                                    {t('activities.contact_to_signup', 'Contactar para apuntarme')}
                                </button>
                                {activity.start_date && activity.type !== 'curso' && (
                                    <button
                                        onClick={() => addToGoogleCalendar(activity)}
                                        className="flex-1 py-5 bg-matcha text-white rounded-full font-headers uppercase tracking-widest text-sm hover:bg-forest hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        <span>📅</span>
                                        {t('activities.add_to_calendar', 'Añadir al calendario')}
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="px-10 py-5 border-2 border-forest/10 text-forest rounded-full font-headers uppercase tracking-widest text-sm hover:bg-forest/5 transition-all duration-300"
                                >
                                    {t('common.close', 'Cerrar')}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative">
            <Helmet>
                <title>{t('activities.seo.title', 'Actividades y Cursos | Arunachala')}</title>
                <meta name="description" content={t('activities.seo.description', 'Descubre nuestras actividades activas, cursos temporales y eventos especiales en Arunachala.')} />
            </Helmet>

            <Header />

            <main className="flex-grow bg-bone pt-40 md:pt-48 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="mb-8 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        <BackButton />
                    </div>

                    <div className="max-w-6xl mx-auto text-center space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-4 pt-12 md:pt-0"
                        >
                            <h1 className="text-4xl md:text-6xl font-headers text-forest uppercase tracking-wide">
                                {t('activities.title', 'Nuestras Actividades')}
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-matcha to-forest mx-auto rounded-full" />
                            <p className="text-lg md:text-xl text-bark/80 max-w-2xl mx-auto font-light">
                                {t('activities.subtitle', 'Cursos temporales, talleres intensivos y eventos especiales diseñados para tu crecimiento.')}
                            </p>
                        </motion.div>

                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-matcha/30 border-t-matcha rounded-full animate-spin" />
                                <p className="text-matcha font-headers uppercase tracking-widest">{t('common.loading', 'Cargando...')}</p>
                            </div>
                        ) : (
                            <div className="space-y-24 mt-12">
                                {/* Section 1: Cursos */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-3xl font-headers text-forest uppercase tracking-wider">{t('activities.sections.courses', 'Cursos')}</h2>
                                        <div className="flex-grow h-px bg-forest/10" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {activities.filter(a => a.type === 'curso').length > 0 ? (
                                            activities.filter(a => a.type === 'curso').map((activity, index) => (
                                                <ActivityCard key={activity.id} activity={activity} index={index} onClick={() => setSelectedActivity(activity)} />
                                            ))
                                        ) : (
                                            <div className="col-span-full py-12 px-8 bg-forest/5 rounded-3xl border border-dashed border-forest/10 text-forest/40 italic text-left">
                                                {t('activities.no_courses', 'No hay cursos programados en este momento.')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Section 2: Talleres y Eventos */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-3xl font-headers text-forest uppercase tracking-wider">{t('activities.sections.events', 'Talleres y Eventos')}</h2>
                                        <div className="flex-grow h-px bg-forest/10" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {activities.filter(a => ['taller', 'evento', 'retiro'].includes(a.type)).length > 0 ? (
                                            activities.filter(a => ['taller', 'evento', 'retiro'].includes(a.type)).map((activity, index) => (
                                                <ActivityCard key={activity.id} activity={activity} index={index} onClick={() => setSelectedActivity(activity)} />
                                            ))
                                        ) : (
                                            <div className="col-span-full py-12 px-8 bg-forest/5 rounded-3xl border border-dashed border-forest/10 text-forest/40 italic text-left">
                                                {t('activities.no_events', 'No hay talleres o eventos programados próximamente.')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Section 3: Sugerencias Interactiva (Votación) */}
                                <div className="py-12 md:py-20 px-4 md:px-8 bg-forest/5 rounded-[2rem] md:rounded-[3rem] border border-forest/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-matcha/5 rounded-full -mr-64 -mt-64 blur-[100px]" />
                                    <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-forest/5 rounded-full -ml-64 -mb-64 blur-[100px]" />

                                    <div className="relative z-10 flex flex-col gap-12 md:gap-16">
                                        {activities.filter(a => a.type === 'sugerencia').map((activity) => (
                                            <DynamicPoll
                                                key={activity.id}
                                                activity={activity}
                                                userSuggestions={userSuggestions}
                                                onVote={() => fetchData()}
                                            />
                                        ))}

                                        <GlobalCustomSuggestion onSubmitted={() => fetchData()} />
                                    </div>
                                </div>

                                <NewsletterForm />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            {/* Activity Detail Modal */}
            {selectedActivity && (
                <ActivityDetailModal
                    activity={selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                />
            )}
        </div>
    );
};

export default ActivitiesPage;
