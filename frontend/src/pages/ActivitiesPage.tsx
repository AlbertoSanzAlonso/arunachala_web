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

                                {/* Section 3: Sugerencias */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-3xl font-headers text-forest uppercase tracking-wider">{t('activities.sections.suggestions', 'Sugerencias')}</h2>
                                        <div className="flex-grow h-px bg-forest/10" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {activities.filter(a => a.type === 'sugerencia').length > 0 ? (
                                            activities.filter(a => a.type === 'sugerencia').map((activity, index) => (
                                                <ActivityCard key={activity.id} activity={activity} index={index} />
                                            ))
                                        ) : (
                                            <div className="col-span-full py-12 px-8 bg-forest/5 rounded-3xl border border-dashed border-forest/10 text-forest/40 italic text-left">
                                                {t('activities.no_suggestions', 'Próximamente compartiremos sugerencias para tu práctica.')}
                                            </div>
                                        )}
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
