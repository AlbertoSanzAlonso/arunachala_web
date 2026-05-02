import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import BackButton from 'components/ui/BackButton';
import { API_BASE_URL } from 'config';
import { getTranslated } from 'utils/translate';
import { getImageUrl } from 'utils/imageUtils';
import PageSEO from 'components/providers/PageSEO';

// Modular components
import ActivityCard from 'components/sections/ActivityCard';
import ActivityDetailModal from 'components/ui/modals/ActivityDetailModal';
import GlobalCustomSuggestion from 'components/sections/GlobalCustomSuggestion';

export interface Activity {
    id: number;
    title: string;
    slug: string | null;
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

export interface UserSuggestion {
    id: number;
    activity_id: number | null;
    activity_type: string | null;
    custom_suggestion: string | null;
    comments: string | null;
    created_at: string;
}

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
            if (actRes.ok) setActivities(await actRes.json() || []);
            if (sugRes.ok) setUserSuggestions(await sugRes.json() || []);
        } catch (error) {
            console.error("Error fetching page data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle deep linking for activity detail
    useEffect(() => {
        if (activities.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const activityId = params.get('activity');
            const activitySlug = params.get('slug');

            if (activityId) {
                const activity = activities.find(a => a.id === parseInt(activityId));
                if (activity) setSelectedActivity(activity);
            } else if (activitySlug) {
                const activity = activities.find(a => a.slug === activitySlug || (a as any).activity_data?.slug === activitySlug);
                if (activity) setSelectedActivity(activity);
            }
        }
    }, [activities]);

    const renderActivitySection = (title: string, types: string[], emptyMsg: string) => {
        const filtered = activities.filter(a => types.includes(a.type));
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-headers text-forest uppercase tracking-wider">{title}</h2>
                    <div className="flex-grow h-px bg-forest/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.length > 0 ? (
                        filtered.map((activity, index) => (
                            <ActivityCard key={activity.id} activity={activity} index={index} onClick={() => setSelectedActivity(activity)} />
                        ))
                    ) : (
                        <div className="col-span-full py-12 px-8 bg-forest/5 rounded-3xl border border-dashed border-forest/10 text-forest/40 italic text-left">
                            {emptyMsg}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative">
            <PageSEO
                title={selectedActivity 
                    ? `${getTranslated(selectedActivity, 'title', i18n.language)} | ${t('activities.title')}`
                    : t('activities.seo.title', 'Actividades y Eventos | Arunachala')}
                description={selectedActivity 
                    ? (getTranslated(selectedActivity, 'description', i18n.language) || '').substring(0, 160)
                    : t('activities.seo.description')}
                ogImage={selectedActivity?.image_url ? getImageUrl(selectedActivity.image_url) : undefined}
            />

            <Header />

            <main className="flex-grow bg-bone pt-4 md:pt-16 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="mb-4 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        <BackButton />
                    </div>

                    <div className="max-w-6xl mx-auto text-center space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 pt-0"
                        >
                            <h1 className="text-4xl md:text-6xl font-headers text-forest uppercase tracking-wide">
                                {t('activities.title', 'Nuestras Actividades')}
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-matcha to-forest mx-auto rounded-full" />
                            <p className="text-lg md:text-xl text-bark/80 max-w-2xl mx-auto font-light">
                                {t('activities.subtitle', 'Talleres intensivos y eventos especiales diseñados para tu crecimiento.')}
                            </p>
                        </motion.div>

                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-matcha/30 border-t-matcha rounded-full animate-spin" />
                                <p className="text-matcha font-headers uppercase tracking-widest">{t('common.loading')}</p>
                            </div>
                        ) : (
                            <div className="space-y-24 mt-12">
                                {renderActivitySection(t('activities.sections.talleres', 'Talleres y Ciclos'), ['taller', 'curso'], t('activities.no_talleres'))}
                                {renderActivitySection(t('activities.sections.eventos', 'Eventos'), ['evento', 'retiro'], t('activities.no_events'))}

                                {/* Section 3: Sugerencias */}
                                <div className="space-y-12 mt-16 pt-16 border-t border-forest/10">
                                    <div className="text-center space-y-4">
                                        <h2 className="text-3xl font-headers text-forest uppercase tracking-wider">{t('activities.sections.propuestas', '¿Qué te gustaría ver próximamente?')}</h2>
                                        <p className="text-bark/60 max-w-xl mx-auto text-sm italic">{t('activities.sections.propuestas_desc', 'Vota tus actividades favoritas o propón algo nuevo.')}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                        {activities.filter(a => a.type === 'sugerencia').map((activity) => (
                                            <ActivityCard key={activity.id} activity={activity} index={0} onClick={() => setSelectedActivity(activity)} />
                                        ))}
                                    </div>

                                    <GlobalCustomSuggestion onSubmitted={fetchData} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {selectedActivity && (
                    <ActivityDetailModal 
                        activity={selectedActivity} 
                        userSuggestions={userSuggestions}
                        onClose={() => setSelectedActivity(null)}
                        onVote={() => { fetchData(); setSelectedActivity(null); }}
                    />
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default ActivitiesPage;
