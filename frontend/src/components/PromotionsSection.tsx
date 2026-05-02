import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';
import { TicketIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUtils';

interface Promotion {
    id: number;
    title: string;
    description: string;
    discount_code?: string;
    discount_percentage?: number;
    image_url?: string;
    translations?: any;
}

const PromotionsSection: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language.split('-')[0];

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/promotions/`);
                if (response.ok) {
                    const data = await response.json();
                    setPromotions(data);
                }
            } catch (error) {
                console.error('Error fetching promotions:', error);
            }
        };
        fetchPromotions();
    }, []);

    if (promotions.length === 0) return null;

    return (
        <section className="py-24 bg-indigo-900 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 border border-white/20 mb-6"
                    >
                        <TicketIcon className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">{t('promotions.label')}</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-headers mb-6 uppercase tracking-wider"
                    >
                        {t('promotions.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-indigo-100/70 italic text-lg max-w-2xl mx-auto"
                    >
                        {t('promotions.subtitle')}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {promotions.map((promo, idx) => {
                        const title = promo.translations?.[currentLang]?.title || promo.title;
                        const description = promo.translations?.[currentLang]?.description || promo.description;

                        return (
                            <motion.div
                                key={promo.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white/5 backdrop-blur-sm rounded-[2.5rem] border border-white/10 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center hover:bg-white/10 transition-all duration-500 hover:border-white/30 shadow-2xl"
                            >
                                {promo.image_url && (
                                    <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border border-white/10">
                                        <img
                                            src={getImageUrl(promo.image_url)}
                                            alt={title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                        {promo.discount_percentage && (
                                            <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-sm font-bold shadow-lg">
                                                -{promo.discount_percentage}%
                                            </span>
                                        )}
                                        {promo.discount_code && (
                                            <span className="px-3 py-1 bg-white/10 text-indigo-300 rounded-full text-sm font-mono font-bold border border-indigo-500/30">
                                                {t('promotions.code')} {promo.discount_code}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-headers mb-4 tracking-wide">{title}</h3>
                                    <p className="text-indigo-100/60 font-light leading-relaxed italic">
                                        {description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PromotionsSection;
