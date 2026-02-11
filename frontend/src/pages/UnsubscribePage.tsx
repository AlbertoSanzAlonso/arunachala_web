import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

const UnsubscribePage: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const email = searchParams.get('email');

    useEffect(() => {
        const performUnsubscribe = async () => {
            if (!email) {
                setStatus('error');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/subscriptions/${email}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error('Error unsubscribing:', error);
                setStatus('error');
            }
        };

        performUnsubscribe();
    }, [email]);

    return (
        <div className="min-h-screen bg-sand flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-forest/10"
            >
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center">
                        <span className="text-4xl">🌿</span>
                    </div>
                </div>

                {status === 'loading' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-headers text-forest uppercase tracking-wider">{t('common.loading', 'Procesando...')}</h2>
                        <div className="animate-spin h-8 w-8 border-4 border-forest border-t-transparent rounded-full mx-auto"></div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-headers text-forest uppercase tracking-wider">
                            {t('activities.subscription.unsubscribed_title', 'Suscripción Cancelada')}
                        </h2>
                        <p className="text-bark/70">
                            {t('activities.subscription.unsubscribed_msg', 'Tu correo ha sido eliminado de nuestra lista correctamente. Lamentamos verte partir.')}
                        </p>
                        <Link
                            to="/"
                            className="inline-block px-8 py-3 bg-forest text-white rounded-full font-bold hover:bg-matcha transition-colors shadow-lg shadow-forest/20"
                        >
                            {t('common.back_home', 'Volver al Inicio')}
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-headers text-red-600 uppercase tracking-wider">
                            {t('common.error', 'Ups! Algo ha fallado')}
                        </h2>
                        <p className="text-bark/70">
                            {t('activities.subscription.unsubscribe_error', 'No hemos podido procesar tu solicitud. Por favor, contacta directamente con nosotros.')}
                        </p>
                        <Link
                            to="/"
                            className="inline-block px-8 py-3 bg-forest text-white rounded-full font-bold hover:bg-matcha transition-colors"
                        >
                            {t('common.back_home', 'Volver al Inicio')}
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default UnsubscribePage;
