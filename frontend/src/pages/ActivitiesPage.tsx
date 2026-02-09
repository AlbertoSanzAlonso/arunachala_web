import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
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

    const options = activity.activity_data?.options?.map((o: any) => ({
        id: o.text,
        title: o.text,
        icon: o.text.toLowerCase().includes('yoga') ? '🧘' :
            o.text.toLowerCase().includes('retiro') || o.text.toLowerCase().includes('silencio') ? '🤫' :
                o.text.toLowerCase().includes('taller') || o.text.toLowerCase().includes('ayurveda') ? '🍶' :
                    o.text.toLowerCase().includes('niño') ? '🎨' : '✨'
    })) || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedActivity) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activity_id: activity.id,
                    activity_type: selectedActivity,
                    comments: comments
                })
            });

            if (response.ok) {
                setSubmitted(true);
                onVote();
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
                <div className="text-5xl">✅</div>
                <h3 className="text-xl font-headers text-forest uppercase tracking-widest">{t('common.thanks', '¡Gracias!')}</h3>
                <p className="text-bark/60 text-sm italic">{t('activities.suggestions.vote_recorded', 'Tu voto ha sido registrado correctamente.')}</p>
                <button
                    onClick={() => { setSubmitted(false); setSelectedActivity(null); setComments(''); }}
                    className="mt-6 text-[10px] font-bold uppercase tracking-tighter text-matcha hover:underline"
                >
                    {t('activities.suggestions.vote_again', 'Votar de nuevo')}
                </button>
            </motion.div>

        );
    }

    return (
        <div className="bg-white/40 backdrop-blur-md p-5 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/20 shadow-xl space-y-10">
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
                        const isSelected = selectedActivity === option.id;

                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setSelectedActivity(isSelected ? null : option.id)}
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
                    disabled={isSubmitting || !selectedActivity}
                    className="w-full py-4 bg-forest text-white rounded-full font-headers uppercase tracking-widest text-sm hover:bg-matcha hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-20 disabled:pointer-events-none"
                >
                    {isSubmitting ? t('common.sending', 'Enviando...') : t('activities.suggestions.vote_now', 'Registrar mi voto')}
                </button>
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
                onSubmitted();
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
                <h4 className="text-forest font-headers uppercase tracking-wider mb-2">💡 {t('activities.suggestions.idea_received', '¡Idea recibida!')}</h4>
                <p className="text-bark/70 text-sm">{t('activities.suggestions.thanks_desc', 'Muchas gracias por tu propuesta, la estudiaremos con cariño.')}</p>
                <button onClick={() => { setSubmitted(false); setCustomSuggestion(''); setComments(''); }} className="mt-4 text-[10px] font-bold uppercase tracking-tighter text-matcha hover:underline">
                    {t('activities.suggestions.suggest_another', 'Sugerir otra idea')}
                </button>
            </motion.div>

        );
    }

    return (
        <div className="max-w-2xl mx-auto pt-16 mt-16 border-t border-forest/10">
            <div className="text-center space-y-4 mb-10">
                <span className="inline-block px-4 py-1.5 bg-forest/5 text-forest text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
                    {t('activities.suggestions.label_custom_tag', '¿Tienes otra idea?')}
                </span>
                <h3 className="text-2xl font-headers text-forest uppercase tracking-wider">{t('activities.suggestions.custom_title', 'Mándanos tu propuesta')}</h3>
                <p className="text-bark/60 text-sm italic">{t('activities.suggestions.custom_subtitle', 'Si buscas algo muy específico que no está en la lista anterior, cuéntanoslo aquí.')}</p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-6 bg-white/40 backdrop-blur-sm p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/20 shadow-lg">
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
            </form>
        </div>
    );
};


const ActivitiesPage: React.FC = () => {

    const { t, i18n } = useTranslation();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);

    const fetchData = async () => {
        try {
            const [actRes, sugRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/activities`),
                fetch(`${API_BASE_URL}/api/suggestions`)
            ]);

            if (actRes.ok) {
                const data = await actRes.json();
                setActivities(data);
            }
            if (sugRes.ok) {
                const data = await sugRes.json();
                setUserSuggestions(data);
            }
        } catch (error) {
            console.error("Error fetching page data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    const ActivityCard = ({ activity, index }: { activity: Activity, index: number }) => (
        <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-forest/5 flex flex-col h-full"
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
                    <h3 className="text-2xl font-headers text-forest mb-3 uppercase tracking-tight">
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
            </div>
        </motion.div>
    );

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative">
            <Helmet>
                <title>{t('activities.seo.title', 'Actividades y Cursos | Arunachala')}</title>
                <meta name="description" content={t('activities.seo.description', 'Descubre nuestras actividades activas, cursos temporales y eventos especiales en Arunachala.')} />
            </Helmet>

            <Header />

            <main className="flex-grow bg-bone pt-32 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="absolute top-0 left-0 md:left-2 z-20">
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
                                                <ActivityCard key={activity.id} activity={activity} index={index} />
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
                                                <ActivityCard key={activity.id} activity={activity} index={index} />
                                            ))
                                        ) : (
                                            <div className="col-span-full py-12 px-8 bg-forest/5 rounded-3xl border border-dashed border-forest/10 text-forest/40 italic text-left">
                                                {t('activities.no_events', 'No hay talleres o eventos programados próximamente.')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Section 3: Sugerencias Interactiva (Votación) */}
                                <div className="space-y-12 py-12 md:py-24 px-4 md:px-8 bg-forest/5 rounded-[2rem] md:rounded-[3rem] border border-forest/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-matcha/5 rounded-full -mr-64 -mt-64 blur-[100px]" />
                                    <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-forest/5 rounded-full -ml-64 -mb-64 blur-[100px]" />

                                    <div className="relative z-10 space-y-16">
                                        {activities.filter(a => a.type === 'sugerencia').length > 0 ? (
                                            activities.filter(a => a.type === 'sugerencia').map((activity) => (
                                                <DynamicPoll
                                                    key={activity.id}
                                                    activity={activity}
                                                    userSuggestions={userSuggestions}
                                                    onVote={() => fetchData()}
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center py-12 text-forest/40 italic">
                                                {t('activities.no_polls', 'No hay votaciones activas en este momento.')}
                                            </div>
                                        )}

                                        <GlobalCustomSuggestion onSubmitted={() => fetchData()} />
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ActivitiesPage;
