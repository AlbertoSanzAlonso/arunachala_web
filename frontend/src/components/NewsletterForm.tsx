import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config';
import { useUIStore } from '../store/uiStore';

const NewsletterForm: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { addToast } = useUIStore();
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [subStatus, setSubStatus] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const response = await fetch(`${API_BASE_URL}/api/subscriptions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    first_name: firstName || undefined,
                    language: i18n.language.split('-')[0]
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                // If it's the subscribe endpoint returning a Subscription object
                if (!data.status && data.is_confirmed && data.is_active) {
                    setSubStatus('already_subscribed');
                } else {
                    setSubStatus(data.status);
                }
                setEmail('');
                setFirstName('');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setStatus('error');
        }
    };

    return (
        <div className="bg-[#becf81]/10 rounded-3xl p-8 md:p-12 mb-16 border border-[#becf81]/30 relative overflow-hidden">
            {/* Background decorative element */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#becf81]/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-2xl mx-auto text-center">
                <h3 className="text-2xl md:text-3xl font-headers text-[#333] mb-4 uppercase tracking-wider">
                    {t('activities.subscription.title')}
                </h3>
                <p className="text-bark/70 mb-8 max-w-lg mx-auto">
                    {t('activities.subscription.subtitle')}
                </p>

                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-[#becf81]/20 border border-[#becf81] p-8 rounded-2xl"
                        >
                            <h4 className="text-[#333] font-bold text-xl mb-2">
                                {t('activities.subscription.success_title')}
                            </h4>
                            <p className="text-bark/80">
                                {subStatus === 'already_subscribed'
                                    ? t('activities.subscription.already_subscribed_msg')
                                    : t('activities.subscription.success_msg')
                                }
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 mt-6">
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="px-6 py-2 bg-white rounded-full text-[#333] font-semibold hover:shadow-md transition-all border border-gray-100"
                                >
                                    {t('common.back')}
                                </button>
                                <button
                                    onClick={() => {
                                        const currentLng = i18n.language.split('-')[0];
                                        const url = `${window.location.origin}/newsletter?lng=${currentLng}`;
                                        if (navigator.share) {
                                            navigator.share({
                                                title: 'Aruṇāchala - Newsletter',
                                                text: t('activities.subscription.subtitle'),
                                                url: url,
                                            }).catch(console.error);
                                        } else {
                                            navigator.clipboard.writeText(url);
                                            addToast('success', t('common.copied_to_clipboard'));
                                        }
                                    }}
                                    className="px-6 py-2 bg-forest text-white rounded-full font-semibold hover:bg-matcha hover:shadow-md transition-all flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Zm0 12.814a2.25 2.25 0 1 0 3.933 2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                    </svg>
                                    {t('common.share')}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 max-w-md mx-auto"
                        >
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder={t('activities.subscription.name_placeholder', 'Tu nombre (opcional)')}
                                    className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#becf81] focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('activities.subscription.placeholder')}
                                    required
                                    className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#becf81] focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className={`w-full py-4 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-2 shadow-lg ${status === 'loading'
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-forest text-white hover:bg-matcha hover:shadow-forest/20'
                                    }`}
                            >
                                {status === 'loading' ? t('common.sending') : t('activities.subscription.button')}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const currentLng = i18n.language.split('-')[0];
                                    const url = `${window.location.origin}/newsletter?lng=${currentLng}`;
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'Aruṇāchala - Newsletter',
                                            text: t('activities.subscription.subtitle'),
                                            url: url,
                                        }).catch(console.error);
                                    } else {
                                        navigator.clipboard.writeText(url);
                                        addToast('success', t('common.copied_to_clipboard'));
                                    }
                                }}
                                className="flex items-center justify-center gap-2 text-forest text-sm font-semibold mt-4 hover:underline"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Zm0 12.814a2.25 2.25 0 1 0 3.933 2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                </svg>
                                {t('activities.subscription.share_cta', '¡Compártelo con tus contactos!')}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {status === 'error' && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 mt-4 text-sm font-medium"
                    >
                        {t('activities.subscription.error_msg')}
                    </motion.p>
                )}
            </div>
        </div>
    );
};

export default NewsletterForm;
