import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ClockIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';

const ContactPage: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        // Simulating form submission
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <Helmet>
                <title>{t('contact_page.seo.title')}</title>
                <meta name="description" content={t('contact_page.seo.description')} />
            </Helmet>

            <Header />

            <main className="flex-grow pt-32 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="absolute top-0 left-0 md:left-2 z-20">
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
                                            <p className="text-bark/80 leading-relaxed">{t('contact_page.info.address')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-matcha/10 rounded-xl text-matcha">
                                            <PhoneIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-headers text-forest text-lg uppercase tracking-wide">{t('contact_page.info.phone_label')}</h3>
                                            <p className="text-bark/80 text-xl font-medium tracking-wider">685 410 248</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-matcha/10 rounded-xl text-matcha">
                                            <EnvelopeIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-headers text-forest text-lg uppercase tracking-wide">{t('contact_page.info.email_label')}</h3>
                                            <p className="text-bark/80 break-all">arunachala.yoga.info@gmail.com</p>
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
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-bone"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-headers text-forest uppercase tracking-widest ml-1">{t('contact_page.form.name')}</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-bone px-6 py-4 rounded-2xl border-2 border-transparent focus:border-matcha outline-none transition-all duration-300"
                                            placeholder={t('contact_page.form.placeholders.name')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-headers text-forest uppercase tracking-widest ml-1">{t('contact_page.form.email')}</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-bone px-6 py-4 rounded-2xl border-2 border-transparent focus:border-matcha outline-none transition-all duration-300"
                                            placeholder={t('contact_page.form.placeholders.email')}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-headers text-forest uppercase tracking-widest ml-1">{t('contact_page.form.phone')}</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-bone px-6 py-4 rounded-2xl border-2 border-transparent focus:border-matcha outline-none transition-all duration-300"
                                            placeholder={t('contact_page.form.placeholders.phone')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-headers text-forest uppercase tracking-widest ml-1">{t('contact_page.form.subject')}</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full bg-bone px-6 py-4 rounded-2xl border-2 border-transparent focus:border-matcha outline-none transition-all duration-300"
                                            placeholder={t('contact_page.form.placeholders.subject')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-headers text-forest uppercase tracking-widest ml-1">{t('contact_page.form.message')}</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full bg-bone px-6 py-4 rounded-2xl border-2 border-transparent focus:border-matcha outline-none transition-all duration-300 resize-none"
                                        placeholder={t('contact_page.form.placeholders.message')}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full py-5 bg-forest text-white rounded-2xl font-headers text-lg tracking-[0.2em] uppercase hover:bg-matcha transition-all duration-500 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group"
                                >
                                    {status === 'sending' ? (
                                        <>{t('contact_page.form.sending')}</>
                                    ) : (
                                        <>
                                            {t('contact_page.form.send')}
                                            <PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {status === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="p-4 bg-matcha/20 text-forest text-center rounded-xl border border-matcha/30"
                                        >
                                            {t('contact_page.form.success')}
                                        </motion.div>
                                    )}
                                    {status === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="p-4 bg-red-50 text-red-600 text-center rounded-xl border border-red-100"
                                        >
                                            {t('contact_page.form.error')}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
