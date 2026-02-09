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
}

const SuggestionForm = () => {
    const { t } = useTranslation();
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
    const [customSuggestion, setCustomSuggestion] = useState('');
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const options = [
        { id: 'kids-yoga', title: t('activities.suggestions.kids', 'Yoga para Niños'), icon: '🎨' },
        { id: 'silence-retreat', title: t('activities.suggestions.silence', 'Retiro de Silencio'), icon: '🤫' },
        { id: 'ayurveda-workshop', title: t('activities.suggestions.ayurveda', 'Taller de Ayurveda'), icon: '🍶' },
        { id: 'bowl-meditation', title: t('activities.suggestions.bowls', 'Cuencos Tibetanos'), icon: '🥣' },
        { id: 'beach-yoga', title: t('activities.suggestions.beach', 'Yoga en la Playa'), icon: '🌊' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedActivity && !customSuggestion.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activity_type: selectedActivity,
                    custom_suggestion: customSuggestion,
                    comments: comments
                })
            });

            if (response.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error("Error submitting suggestion:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto text-center py-12 space-y-6"
            >
                <div className="text-6xl">🙏</div>
                <h3 className="text-2xl font-headers text-forest uppercase tracking-widest">
                    {t('activities.suggestions.thanks_title', '¡Gracias por tu aporte!')}
                </h3>
                <p className="text-bark/70">
                    {t('activities.suggestions.thanks_desc', 'Hemos recibido tu sugerencia correctamente. La tendremos muy en cuenta para nuestras próximas programaciones.')}
                </p>
                <button
                    onClick={() => {
                        setSubmitted(false);
                        setSelectedActivity(null);
                        setCustomSuggestion('');
                        setComments('');
                    }}
                    className="text-matcha font-bold uppercase tracking-tighter hover:underline"
                >
                    {t('activities.suggestions.send_another', 'Enviar otra sugerencia')}
                </button>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-10 relative z-10">
            {/* Box Selection */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedActivity(option.id === selectedActivity ? null : option.id)}
                        className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${selectedActivity === option.id
                            ? 'border-matcha bg-matcha/10 shadow-lg scale-105'
                            : 'border-forest/10 bg-white hover:border-matcha/40 hover:shadow-md'
                            }`}
                    >
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{option.icon}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${selectedActivity === option.id ? 'text-forest' : 'text-bark/60'}`}>
                            {option.title}
                        </span>
                        {selectedActivity === option.id && (
                            <motion.div
                                layoutId="check"
                                className="absolute -top-2 -right-2 w-6 h-6 bg-matcha text-white rounded-full flex items-center justify-center text-[10px] shadow-sm"
                            >
                                ✓
                            </motion.div>
                        )}
                    </button>
                ))}
            </div>

            <div className="space-y-6 bg-white/50 backdrop-blur-sm p-8 rounded-[2rem] border border-white/20 shadow-sm">
                {/* Custom Suggestion */}
                <div className="space-y-2 text-left">
                    <label className="text-xs font-bold uppercase tracking-widest text-forest/60 ml-1">
                        {t('activities.suggestions.label_custom', '¿Tienes otra idea?')}
                    </label>
                    <input
                        type="text"
                        value={customSuggestion}
                        onChange={(e) => setCustomSuggestion(e.target.value)}
                        placeholder={t('activities.suggestions.placeholder_custom', 'Ej: Taller de cocina macrobiótica...')}
                        className="w-full bg-white border border-forest/10 rounded-2xl px-6 py-4 text-bark focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all"
                    />
                </div>

                {/* Additional Comments */}
                <div className="space-y-2 text-left">
                    <label className="text-xs font-bold uppercase tracking-widest text-forest/60 ml-1">
                        {t('activities.suggestions.label_comments', 'Comentarios adicionales')}
                    </label>
                    <textarea
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder={t('activities.suggestions.placeholder_comments', 'Cuéntanos un poco más sobre lo que buscas o cuándo te vendría mejor...')}
                        className="w-full bg-white border border-forest/10 rounded-2xl px-6 py-4 text-bark focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all resize-none"
                    />
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || (!selectedActivity && !customSuggestion.trim())}
                        className="w-full md:w-auto px-12 py-4 bg-forest text-white rounded-full font-headers uppercase tracking-widest text-sm hover:bg-matcha hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        {isSubmitting ? t('common.sending', 'Enviando...') : t('activities.suggestions.submit', 'Enviar Propuesta')}
                    </button>
                </div>
            </div>
        </form>
    );
};

const ActivitiesPage: React.FC = () => {

    const { t, i18n } = useTranslation();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/activities`);
                if (response.ok) {
                    const data = await response.json();
                    setActivities(data);
                }
            } catch (error) {
                console.error("Error fetching activities:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivities();
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

                                {/* Section 3: Sugerencias Interactiva */}
                                <div className="space-y-12 py-16 px-8 bg-forest/5 rounded-[3rem] border border-forest/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-matcha/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-forest/5 rounded-full -ml-32 -mb-32 blur-3xl" />

                                    <div className="relative z-10 space-y-4 max-w-2xl mx-auto text-center mb-12">
                                        <h2 className="text-3xl md:text-4xl font-headers text-forest uppercase tracking-wider">
                                            {t('activities.sections.suggestions_title', '¿Qué te gustaría experimentar?')}
                                        </h2>
                                        <p className="text-bark/70">
                                            {t('activities.sections.suggestions_desc', 'Vota por una de nuestras propuestas o sugiere algo totalmente nuevo. Tu opinión nos ayuda a crecer.')}
                                        </p>
                                    </div>

                                    <SuggestionForm />
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
