import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getTranslated } from 'utils/translate';
import { getImageUrl } from 'utils/imageUtils';
import ShareButton from 'components/ui/ShareButton';
import DynamicPoll from './DynamicPoll';

interface Activity {
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
    activity_data?: any;
}

interface UserSuggestion {
    id: number;
    activity_id: number | null;
    activity_type: string | null;
}

interface ActivityDetailModalProps {
    activity: Activity;
    userSuggestions: UserSuggestion[];
    onClose: () => void;
    onVote: () => void;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ 
    activity, 
    userSuggestions, 
    onClose, 
    onVote 
}) => {
    const { t, i18n } = useTranslation();

    const navigate = (path: string) => {
        window.location.href = path;
    };

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

    const addToGoogleCalendar = (act: Activity) => {
        const title = getTranslated(act, 'title', i18n.language);
        const details = getTranslated(act, 'description', i18n.language) || '';
        const location = act.location || 'Centro Arunachala, Cornellá';

        const formatGDate = (dateStr: string | null) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
        };

        const start = formatGDate(act.start_date);
        let end = formatGDate(act.end_date);
        if (!end && act.start_date) {
            const d = new Date(act.start_date);
            d.setHours(d.getHours() + 1);
            end = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
        }

        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&dates=${start}/${end}`;
        window.open(url, '_blank');
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
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
                <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[110] flex gap-2">
                    <ShareButton
                        url={`/actividades?activity=${activity.id}`}
                        title={getTranslated(activity, 'title', i18n.language)}
                        text={t('activities.share_text')}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full text-forest hover:bg-forest hover:text-white transition-all shadow-lg border border-forest/10"
                        iconClassName="w-5 h-5 md:w-6 md:h-6"
                    />
                    <button
                        onClick={onClose}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full text-forest hover:bg-forest hover:text-white transition-all shadow-lg border border-forest/10"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1 bg-bone/30">
                    {activity.type === 'sugerencia' ? (
                        <div className="p-4 md:p-8 pt-20 md:pt-16">
                            <DynamicPoll 
                                activity={activity} 
                                userSuggestions={userSuggestions} 
                                showShare={false}
                                onVote={onVote} 
                            />
                        </div>
                    ) : (
                        <>
                            <div className="h-64 md:h-96 relative">
                                {activity.image_url ? (
                                    <img src={getImageUrl(activity.image_url)} alt={getTranslated(activity, 'title', i18n.language)} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-forest/5 flex items-center justify-center opacity-20">
                                        <img src={'/logo_icon.webp'} className="w-48" alt="" />
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
                                    <h2 className="text-3xl md:text-5xl font-headers text-forest uppercase tracking-tight mb-4">{getTranslated(activity, 'title', i18n.language)}</h2>
                                    <div className="w-20 h-1 bg-matcha rounded-full" />
                                </div>

                                <p className="text-bark/80 text-lg leading-relaxed whitespace-pre-wrap">{getTranslated(activity, 'description', i18n.language)}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-forest/5 p-8 rounded-3xl border border-forest/10">
                                    <div className="space-y-4">
                                        {activity.start_date && (
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-xl text-forest/50">🗓️</div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{t('activities.labels.date')}</p>
                                                    <p className="text-forest font-bold">{formatShortDate(activity.start_date)}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-xl text-forest/50">📍</div>
                                            <div>
                                                <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{t('activities.labels.location')}</p>
                                                <p className="text-forest font-bold">{activity.location || 'Centro Arunachala, Cornellá'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-xl text-matcha/50">💰</div>
                                            <div>
                                                <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{t('activities.labels.price')}</p>
                                                <p className="text-matcha font-bold text-2xl">{activity.price || t('activities.consult_price')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-xl text-forest/50">✨</div>
                                            <div>
                                                <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{t('activities.labels.info')}</p>
                                                <p className="text-forest text-sm font-medium">{t('activities.labels.info_desc')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col md:flex-row gap-4">
                                    <button onClick={() => navigate('/contacto')} className="flex-1 py-5 bg-forest text-white rounded-full font-headers uppercase tracking-widest text-sm hover:bg-matcha hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3">
                                        <span>📩</span> {t('activities.contact_to_signup')}
                                    </button>
                                    {activity.start_date && (
                                        <button onClick={() => addToGoogleCalendar(activity)} className="flex-1 py-5 bg-matcha text-white rounded-full font-headers uppercase tracking-widest text-sm hover:bg-forest hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3">
                                            <span>📅</span> {t('activities.add_to_calendar')}
                                        </button>
                                    )}
                                    <button onClick={onClose} className="px-10 py-5 border-2 border-forest/10 text-forest rounded-full font-headers uppercase tracking-widest text-sm hover:bg-forest/5 transition-all duration-300">
                                        {t('common.close')}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ActivityDetailModal;
