import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/ui/BackButton';
import PageSEO from '../components/providers/PageSEO';
import { API_BASE_URL } from '../config';
import { BUSINESS, BUSINESS_ADDRESS_LINE } from '../config/business';

const ContactPage: React.FC = () => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, message }),
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.detail || t('contact_page.form.error'));
            }
            setSubmitted(true);
            setName('');
            setEmail('');
            setPhone('');
            setMessage('');
        } catch (err: any) {
            setError(err.message || t('contact_page.form.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative">
            <PageSEO
                title={t('contact_page.seo.title')}
                description={t('contact_page.seo.description')}
            />

            <Header />

            <main className="flex-grow pt-4 md:pt-16 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="mb-4 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        <BackButton />
                    </div>

                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-headers text-forest mb-4 uppercase tracking-wider pt-0"
                        >
                            {t('contact_page.title')}
                        </motion.h1>
                        <p className="sr-only">{t('answers.contact.question')} {t('answers.contact.answer')}</p>
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
                                            <h3 className="font-headers text-forest text-lg uppercase tracking-wide">{t('contact_page.info.address_label')}</h3>
                                            <a
                                                href="https://www.google.com/maps/search/?api=1&query=Yoga+y+Terapias+Arunachala"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-bark/80 leading-relaxed hover:text-matcha transition-colors"
                                            >
                                                {BUSINESS.name}. {BUSINESS_ADDRESS_LINE}
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
                                                href={`tel:${BUSINESS.phoneTel}`}
                                                className="text-bark/80 text-xl font-medium tracking-wider hover:text-matcha transition-colors"
                                            >
                                                {BUSINESS.phoneDisplay}
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
                                                href={`mailto:${BUSINESS.email}`}
                                                className="text-bark/80 break-all hover:text-matcha transition-colors"
                                            >
                                                {BUSINESS.email}
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

                            <div className="bg-forest text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                                <h3 className="text-2xl font-headers text-matcha mb-4 uppercase tracking-widest">Aruṇāchala</h3>
                                <p className="text-bone/80 font-light italic text-lg leading-relaxed">
                                    "{t('contact_page.info.quote')}"
                                </p>
                            </div>
                        </motion.div>

                        {/* Contact Form + WhatsApp */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-8"
                        >
                            <div className="bg-white/60 p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-white/50">
                                <h2 className="text-3xl font-headers text-forest mb-2">{t('contact_page.form.title')}</h2>
                                <p className="text-bark/60 mb-8">{t('contact_page.form.subtitle')}</p>

                                {submitted ? (
                                    <div className="text-center py-10 px-4 bg-matcha/10 rounded-3xl border border-matcha/20">
                                        <p className="text-forest font-headers text-xl mb-2">{t('contact_page.form.success_title')}</p>
                                        <p className="text-bark/70 text-sm">{t('contact_page.form.success_desc')}</p>
                                        <button
                                            type="button"
                                            onClick={() => setSubmitted(false)}
                                            className="mt-6 text-sm text-forest underline hover:text-matcha"
                                        >
                                            {t('contact_page.form.send_another')}
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-forest/60 mb-2 ml-1">
                                                {t('contact_page.form.name')}
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-white border border-forest/10 rounded-2xl px-5 py-3 text-bark focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-forest/60 mb-2 ml-1">
                                                {t('contact_page.form.email')}
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white border border-forest/10 rounded-2xl px-5 py-3 text-bark focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-forest/60 mb-2 ml-1">
                                                {t('contact_page.form.phone')}
                                            </label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full bg-white border border-forest/10 rounded-2xl px-5 py-3 text-bark focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-forest/60 mb-2 ml-1">
                                                {t('contact_page.form.message')}
                                            </label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="w-full bg-white border border-forest/10 rounded-2xl px-5 py-3 text-bark focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all resize-none"
                                            />
                                        </div>
                                        {error && (
                                            <p className="text-red-500 text-sm text-center">{error}</p>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 bg-forest text-white rounded-2xl font-headers uppercase tracking-widest text-sm hover:bg-matcha transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? t('common.sending') : t('contact_page.form.submit')}
                                        </button>
                                    </form>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-green-100 flex flex-col items-center text-center space-y-5">
                                <div className="bg-white p-4 rounded-full shadow-md">
                                    <ChatBubbleLeftRightIcon className="w-10 h-10 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-headers text-forest mb-2">{t('contact_page.whatsapp.title')}</h3>
                                    <p className="text-bark/70 text-sm leading-relaxed max-w-md mx-auto">
                                        {t('contact_page.whatsapp.description')}
                                    </p>
                                </div>
                                <a
                                    href="https://wa.me/34678481971"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto py-3 px-8 bg-[#25D366] text-white rounded-2xl font-headers text-sm tracking-wider uppercase hover:bg-[#20bd5a] hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                                >
                                    {t('contact_page.whatsapp.button')}
                                    <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
