import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import NewsletterForm from '../components/NewsletterForm';
import { Link } from 'react-router-dom';
import PageSEO from '../components/providers/PageSEO';

const SubscribePage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <PageSEO title="Newsletter" description="Suscripción a novedades de Arunachala Yoga y Terapias." noindex />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#becf81]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-forest/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full bg-white/70 backdrop-blur-md rounded-[40px] shadow-2xl overflow-hidden border border-white/50 relative z-10"
            >
                <div className="flex flex-col">
                    {/* Top: Header Section */}
                    <div className="bg-forest p-10 md:p-16 text-white text-center relative overflow-hidden">
                        {/* Subtle background decoration */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none select-none flex items-center justify-center font-headers text-[15vw]">
                            OM
                        </div>

                        <h1 className="!text-white text-4xl md:text-6xl font-headers uppercase tracking-widest leading-tight relative z-10">
                            ARUṆĀCHALA
                            <div className="text-white/60 text-xs md:text-sm tracking-[0.5em] font-sans not-italic mt-2 mb-4 uppercase">
                                YOGA & TERAPIAS
                            </div>
                        </h1>

                        <p className="max-w-xl mx-auto text-white/80 text-lg md:text-xl leading-relaxed mt-8 relative z-10">
                            {t('activities.subscription.subtitle')}
                        </p>
                    </div>

                    {/* Bottom: Form Section */}
                    <div className="p-8 md:p-16 bg-white flex flex-col items-center">
                        <div className="max-w-lg w-full">
                            <div className="mb-10 text-center">
                                <h2 className="text-2xl md:text-3xl font-bold text-forest mb-3">
                                    {t('activities.subscription.title')}
                                </h2>
                                <p className="text-bark/70 text-base">
                                    {t('activities.subscription.msg_landing')}
                                </p>
                            </div>

                            <div className="newsletter-standalone">
                                <NewsletterForm />
                            </div>

                            <p className="mt-10 text-center text-xs text-bark/40">
                                {t('privacy.intro')}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Back to home link */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 relative z-10"
            >
                <Link
                    to="/"
                    className="text-forest font-semibold hover:underline flex items-center gap-2"
                >
                    ← {t('common.back_home')}
                </Link>
            </motion.div>
        </div>
    );
};

export default SubscribePage;
