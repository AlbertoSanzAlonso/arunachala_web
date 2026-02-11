import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';

interface Activity {
    id: number;
    title: string;
    description: string | null;
    type: string;
    start_date: string | null;
    location: string | null;
    image_url: string | null;
    translations?: any;
}

const FeaturedActivities: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedActivities = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/activities/featured`);
                if (response.ok) {
                    const data = await response.json();
                    setActivities(data.slice(0, 3)); // Máximo 3 actividades
                }
            } catch (error) {
                console.error('Error fetching featured activities:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeaturedActivities();
    }, []);

    if (isLoading || activities.length === 0) {
        return null; // No mostrar nada si no hay actividades destacadas
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return d.toLocaleDateString(i18n.language, {
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-forest/5 to-matcha/5 rounded-2xl p-5 md:p-6 border border-forest/10"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        <h2 className="text-lg md:text-xl font-headers text-forest uppercase tracking-wide">
                            {t('home.featured_activities.title', 'Próximas Actividades')}
                        </h2>
                    </div>
                    <Link
                        to="/actividades"
                        className="text-xs md:text-sm text-matcha hover:text-forest font-bold uppercase tracking-wider transition-colors flex items-center gap-1 group"
                    >
                        {t('common.see_all', 'Ver todas')}
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>

                {/* Activities List - Vertical */}
                <div className="space-y-3">
                    {activities.map((activity, index) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <Link
                                to={`/actividades?activity=${activity.id}`}
                                className="group block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-forest/5 hover:border-matcha/30"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    {/* Left: Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-matcha/10 text-matcha text-[9px] font-bold uppercase tracking-wider rounded-full">
                                                {t(`activities.types.${activity.type}`, activity.type)}
                                            </span>
                                            <span className="text-amber-500 text-sm">✨</span>
                                        </div>

                                        <h3 className="text-sm md:text-base font-headers text-forest uppercase tracking-tight mb-1 group-hover:text-matcha transition-colors line-clamp-1">
                                            {getTranslated(activity, 'title', i18n.language)}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-bark/60">
                                            {activity.start_date && (
                                                <div className="flex items-center gap-1">
                                                    <span>🗓️</span>
                                                    <span>{formatDate(activity.start_date)}</span>
                                                </div>
                                            )}
                                            {activity.location && (
                                                <div className="flex items-center gap-1 truncate">
                                                    <span>📍</span>
                                                    <span className="truncate">{activity.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Arrow */}
                                    <div className="flex-shrink-0 text-matcha group-hover:translate-x-1 transition-transform">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default FeaturedActivities;
