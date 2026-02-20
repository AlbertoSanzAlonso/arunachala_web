import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';
import { TicketIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { Helmet } from 'react-helmet-async';

interface Promotion {
    id: number;
    title: string;
    description: string;
    discount_code?: string;
    discount_percentage?: number;
    image_url?: string;
    translations?: any;
}

const PromotionsPage: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language.split('-')[0];
    const navigate = useNavigate();

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
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    return (
        <div className="font-body text-bark min-h-screen flex flex-col bg-bone">
            <Helmet>
                <title>{t('promotions.title')} | Arunachala</title>
                <meta name="description" content={t('promotions.subtitle')} />
            </Helmet>

            <Header />

            <main className="flex-grow pt-40 md:pt-48 pb-24 relative overflow-hidden">
                {/* Decorative background elements in brown/bark tones */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-20 -left-24 w-96 h-96 bg-bark rounded-full blur-[120px]" />
                    <div className="absolute bottom-40 -right-24 w-96 h-96 bg-forest rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-20" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="mb-12">
                        <BackButton />
                    </div>

                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-bark/10 backdrop-blur-md rounded-full text-bark border border-bark/20 mb-8"
                        >
                            <TicketIcon className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-[0.2em]">{t('promotions.label')}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl sm:text-5xl md:text-7xl font-headers text-forest mb-8 uppercase tracking-widest leading-tight break-words px-4"
                        >
                            {t('promotions.title')}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-2xl text-bark/70 italic font-light max-w-3xl mx-auto leading-relaxed"
                        >
                            {t('promotions.subtitle')}
                        </motion.p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-bark/10 border-t-bark rounded-full animate-spin" />
                        </div>
                    ) : promotions.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {promotions.map((promo, idx) => {
                                const title = promo.translations?.[currentLang]?.title || promo.title;
                                const description = promo.translations?.[currentLang]?.description || promo.description;

                                return (
                                    <motion.div
                                        key={promo.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white/80 p-10 md:p-14 flex flex-col md:flex-row gap-10 items-center hover:bg-white/80 transition-all duration-700 shadow-xl hover:shadow-2xl hover:-translate-y-2"
                                    >
                                        {promo.image_url && (
                                            <div className="w-full md:w-56 h-56 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-2xl relative border-4 border-white">
                                                <img
                                                    src={promo.image_url.startsWith('http') ? promo.image_url : `${API_BASE_URL}${promo.image_url}`}
                                                    alt={title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                />
                                                <div className="absolute inset-0 bg-bark/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                            </div>
                                        )}
                                        <div className="flex-1 text-center md:text-left space-y-6">
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                                {promo.discount_percentage && (
                                                    <span className="px-5 py-1.5 bg-bark text-white rounded-full text-base font-bold shadow-lg tracking-widest">
                                                        -{promo.discount_percentage}%
                                                    </span>
                                                )}
                                                {promo.discount_code && (
                                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-bone rounded-full border border-bark/10 shadow-inner">
                                                        <SparklesIcon className="w-4 h-4 text-bark/40" />
                                                        <span className="text-sm font-mono font-bold text-bark/80 uppercase">
                                                            {promo.discount_code}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-3xl font-headers text-forest tracking-wide leading-tight">{title}</h3>
                                            <p className="text-bark/60 font-light leading-relaxed italic text-lg line-clamp-4">
                                                {description}
                                            </p>

                                            <div className="pt-4">
                                                <div className="h-px w-20 bg-bark/20 md:mx-0 mx-auto" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/40 rounded-[3rem] border border-white/60 backdrop-blur-md">
                            <TicketIcon className="w-16 h-16 text-bark/20 mx-auto mb-6" />
                            <p className="text-xl text-bark/40 italic">No hay promociones activas en este momento. Vuelve pronto.</p>
                        </div>
                    )}

                    <div className="mt-24 text-center">
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            onClick={() => navigate('/contacto')}
                            className="px-10 py-4 bg-forest text-white rounded-full font-bold uppercase tracking-widest hover:bg-bark transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg"
                        >
                            {t('menu.contact')}
                        </motion.button>
                        <p className="mt-4 text-bark/60 italic">{t('promotions.contact_cta')}</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PromotionsPage;
