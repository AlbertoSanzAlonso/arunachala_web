import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';

const ContactPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <Helmet>
                <title>{t('contact_page.seo.title')}</title>
                <meta name="description" content={t('contact_page.seo.description')} />
            </Helmet>

            <Header />

            <main className="flex-grow pt-32 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="mb-8 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        <BackButton />
                    </div>

                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-headers text-forest mb-4 uppercase tracking-wider pt-12 md:pt-0"
                        >
                            {t('contact_page.title')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-bark/70 font-light"
                        >
                            {t('contact_page.subtitle')}
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-8"
                        >
                            <div className="bg-white/40 p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-white/50 space-y-10">
                                <h2 className="text-3xl font-headers text-forest">{t('contact_page.info.title')}</h2>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-matcha/10 rounded-xl text-matcha">
                                            <MapPinIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-headers text-forest text-lg uppercase tracking-wide">Dirección</h3>
                                            <a
                                                href="https://www.google.com/maps/search/?api=1&query=Yoga+y+Terapias+Arunachala"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-bark/80 leading-relaxed hover:text-matcha transition-colors"
                                            >
                                                {t('contact_page.info.address')}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-matcha/10 rounded-xl text-matcha">
                                            <PhoneIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-headers text-forest text-lg uppercase tracking-wide">{t('contact_page.info.phone_label')}</h3>
                                            <a
                                                href="tel:+34678481971"
                                                className="text-bark/80 text-xl font-medium tracking-wider hover:text-matcha transition-colors"
                                            >
                                                +34 678 48 19 71
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-matcha/10 rounded-xl text-matcha">
                                            <EnvelopeIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-headers text-forest text-lg uppercase tracking-wide">{t('contact_page.info.email_label')}</h3>
                                            <a
                                                href="mailto:yogayterapiasarunachala@gmail.com"
                                                className="text-bark/80 break-all hover:text-matcha transition-colors"
                                            >
                                                yogayterapiasarunachala@gmail.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-matcha/10 rounded-xl text-matcha">
                                            <ClockIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-headers text-forest text-lg uppercase tracking-wide">{t('contact_page.info.hours_label')}</h3>
                                            <p className="text-bark/80">{t('contact_page.info.hours_desc')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social or Extra Info */}
                            <div className="bg-forest text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                                <h3 className="text-2xl font-headers text-matcha mb-4 uppercase tracking-widest">Aruṇāchala</h3>
                                <p className="text-bone/80 font-light italic text-lg leading-relaxed">
                                    "{t('contact_page.info.quote')}"
                                </p>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        {/* WhatsApp CTA */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-green-100 flex flex-col justify-center items-center text-center space-y-8 h-full"
                        >
                            <div className="bg-white p-6 rounded-full shadow-lg mb-4">
                                <ChatBubbleLeftRightIcon className="w-16 h-16 text-green-600" />
                            </div>

                            <div>
                                <h2 className="text-3xl font-headers text-forest mb-4">{t('contact_page.whatsapp.title', 'Hablemos por WhatsApp')}</h2>
                                <p className="text-bark/70 text-lg leading-relaxed max-w-md mx-auto">
                                    {t('contact_page.whatsapp.description', '¿Prefieres un trato más directo? Escríbenos por WhatsApp para resolver dudas o reservar tu cita al instante.')}
                                </p>
                            </div>

                            <a
                                href="https://wa.me/34678481971"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto py-4 px-8 bg-[#25D366] text-white rounded-2xl font-headers text-lg tracking-wider uppercase hover:bg-[#20bd5a] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-200/50 flex items-center justify-center gap-3"
                            >
                                {t('contact_page.whatsapp.button', 'Abrir Chat de WhatsApp')}
                                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                            </a>

                            <p className="text-sm text-gray-400 italic">
                                {t('contact_page.whatsapp.note', 'Te responderemos encantados lo antes posible.')}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
