import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config';

const NewsletterForm: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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
                    language: i18n.language.split('-')[0] // Send 'es', 'ca', or 'en'
                }),
            });

            if (response.ok) {
                setStatus('success');
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
                                {t('activities.subscription.success_msg')}
                            </p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-6 px-6 py-2 bg-white rounded-full text-[#333] font-semibold hover:shadow-md transition-all"
                            >
                                {t('common.back')}
                            </button>
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
