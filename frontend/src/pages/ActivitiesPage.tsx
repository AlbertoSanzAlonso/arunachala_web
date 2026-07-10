import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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

const BASE_URL = 'https://www.yogayterapiasarunachala.es';
const ACTIVITIES_PATH = '/actividades/';

const ActivitiesPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
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

    const activeActivity = useMemo(() => {
        const activityId = searchParams.get('activity');
        const activitySlug = searchParams.get('slug');
        if (activities.length === 0) return null;
        if (activityId) {
            return activities.find((a) => a.id === parseInt(activityId, 10)) ?? null;
        }
        if (activitySlug) {
            return (
                activities.find(
                    (a) => a.slug === activitySlug || (a as Activity).activity_data?.slug === activitySlug
                ) ?? null
            );
        }
        return null;
    }, [activities, searchParams]);

    // Handle deep linking for activity detail
    useEffect(() => {
        if (activeActivity) {
            setSelectedActivity(activeActivity);
        }
    }, [activeActivity]);

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

    const seoTitle = activeActivity
        ? getTranslated(activeActivity, 'title', i18n.language)
        : t('activities.seo.title');

    const seoDescription = activeActivity
        ? String(getTranslated(activeActivity, 'description', i18n.language) || t('activities.seo.description'))
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 160)
        : t('activities.seo.description');

    const canonical = activeActivity?.slug
        ? `${BASE_URL}${ACTIVITIES_PATH}?slug=${activeActivity.slug}`
        : `${BASE_URL}${ACTIVITIES_PATH}`;

    const structuredData = useMemo(() => {
        if (activeActivity) {
            return {
                '@context': 'https://schema.org',
                '@type': 'Event',
                name: getTranslated(activeActivity, 'title', i18n.language),
                description: seoDescription,
                url: `${BASE_URL}${ACTIVITIES_PATH}?slug=${activeActivity.slug}`,
                location: activeActivity.location
                    ? { '@type': 'Place', name: activeActivity.location }
                    : undefined,
                organizer: {
                    '@type': 'Organization',
                    name: 'Arunachala Yoga y Terapias',
                    url: BASE_URL,
                },
            };
        }

        const listable = activities.filter((a) => a.slug && a.type !== 'sugerencia');
        return {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: t('activities.title'),
            description: t('activities.seo.description'),
            url: `${BASE_URL}${ACTIVITIES_PATH}`,
            mainEntity: {
                '@type': 'ItemList',
                numberOfItems: listable.length,
                itemListElement: listable.map((act, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    url: `${BASE_URL}${ACTIVITIES_PATH}?slug=${act.slug}`,
                    name: getTranslated(act, 'title', i18n.language),
                })),
            },
        };
    }, [activeActivity, activities, t, i18n.language, seoDescription]);

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative">
            <PageSEO
                title={seoTitle}
                description={seoDescription}
                canonical={canonical}
                ogImage={activeActivity?.image_url ? getImageUrl(activeActivity.image_url) : undefined}
                structuredData={structuredData}
                breadcrumbCurrent={
                    activeActivity?.slug
                        ? {
                              name: getTranslated(activeActivity, 'title', i18n.language),
                              path: `${ACTIVITIES_PATH}?slug=${activeActivity.slug}`,
                          }
                        : undefined
                }
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
