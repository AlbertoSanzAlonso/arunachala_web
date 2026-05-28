import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getTranslated } from 'utils/translate';
import { getImageUrl } from 'utils/imageUtils';

interface Activity {
    id: number;
    title: string;
    slug?: string | null;
    description: string | null;
    type: string;
    start_date: string | null;
    location: string | null;
    price: string | null;
    image_url: string | null;
}

interface ActivityCardProps {
    activity: Activity;
    index: number;
    onClick?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, index, onClick }) => {
    const { t, i18n } = useTranslation();

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={onClick}
            className={`bg-white group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-forest/5 flex flex-col h-full ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
        >
            <div className="h-56 bg-gray-100 overflow-hidden relative">
                {activity.image_url ? (
                    <img
                        src={getImageUrl(activity.image_url)}
                        alt={getTranslated(activity, 'title', i18n.language)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                        <img src={'/logo_icon.webp'} className="w-24" alt="" />
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
                    {activity.slug && activity.type !== 'sugerencia' ? (
                        <Link
                            to={`/actividades/?slug=${activity.slug}`}
                            className="block text-2xl font-headers text-forest mb-3 uppercase tracking-tight group-hover:text-matcha transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {getTranslated(activity, 'title', i18n.language)}
                        </Link>
                    ) : (
                        <h3 className="text-2xl font-headers text-forest mb-3 uppercase tracking-tight group-hover:text-matcha transition-colors">
                            {getTranslated(activity, 'title', i18n.language)}
                        </h3>
                    )}
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
                        <span>{activity.price || t('activities.consult_price')}</span>
                    </div>
                </div>

                {onClick && (
                    <div className="mt-6 flex items-center gap-0.5 text-forest text-[10px] font-bold tracking-tight group-hover:gap-2 transition-all duration-300">
                        {t('common.read_more', 'Leer más')}
                        <span className="text-sm">→</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ActivityCard;
