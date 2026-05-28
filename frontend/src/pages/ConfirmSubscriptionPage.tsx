import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';
import PageSEO from '../components/providers/PageSEO';

const ConfirmSubscriptionPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_confirmed'>('loading');
    const hasStarted = React.useRef(false);
    const token = searchParams.get('token');
    const lng = searchParams.get('lng');

    useEffect(() => {
        if (lng && i18n.language !== lng) {
            i18n.changeLanguage(lng);
        }
    }, [lng, i18n]);

    const handleConfirm = useCallback(async () => {
        if (!token) {
            setStatus('error');
            return;
        }

        if (hasStarted.current) return;
        hasStarted.current = true;

        try {
            // Only set loading if not already in a success state from a previous attempt
            setStatus((prev) => (prev === 'success' || prev === 'already_confirmed' ? prev : 'loading'));
            const baseUrl = API_BASE_URL.replace(/\/$/, '');
            // Query params to bust browser cache
            const url = `${baseUrl}/api/subscriptions/confirm/${token}?_t=${Date.now()}`;
            console.log("Attempting confirmation at:", url);

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                if (data.status === 'already_confirmed') {
                    setStatus('already_confirmed');
                } else {
                    setStatus('success');
                }
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Error confirming subscription:', error);
            setStatus('error');
        }
    }, [token]);

    // Auto-confirm on mount? No, better a button to avoid issues with email scanners
    // But many users expect auto-confirm. Let's do auto-confirm and if it fails show error with button.
    useEffect(() => {
        if (token) {
            handleConfirm();
        } else {
            setStatus('error');
        }
    }, [token, handleConfirm]);

    return (
        <div className="min-h-screen bg-sand flex items-center justify-center p-4">
            <PageSEO title="Confirmar suscripción" description="Confirmación de suscripción al newsletter de Arunachala." noindex />
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
                        <h2 className="text-2xl font-headers text-forest uppercase tracking-wider">
                            {t('activities.subscription.confirm_title', 'Confirma tu suscripción')}
                        </h2>
                        <p className="text-bark/70">
                            {t('common.loading', 'Procesando...')}
                        </p>
                        <div className="animate-spin h-8 w-8 border-4 border-forest border-t-transparent rounded-full mx-auto"></div>
                    </div>
                )}

                {(status === 'success' || status === 'already_confirmed') && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-headers text-forest uppercase tracking-wider">
                            {t('activities.subscription.confirmed_success_title', '¡Suscripción Confirmada!')}
                        </h2>
                        <p className="text-bark/70">
                            {status === 'already_confirmed'
                                ? t('activities.subscription.already_confirmed_msg', 'Tu suscripción ya estaba confirmada.')
                                : t('activities.subscription.confirmed_success_msg', 'Gracias por confirmar tu correo. Pronto recibirás nuestras novedades en tu bandeja de entrada.')
                            }
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
                            {t('activities.subscription.confirm_error', 'No hemos podido confirmar tu suscripción. El enlace puede haber expirado o ser inválido.')}
                        </p>
                        <div className="flex flex-col gap-4">
                            {!token ? (
                                <Link
                                    to="/"
                                    className="inline-block px-8 py-3 bg-forest text-white rounded-full font-bold hover:bg-matcha transition-colors"
                                >
                                    {t('common.back_home', 'Volver al Inicio')}
                                </Link>
                            ) : (
                                <>
                                    <button
                                        onClick={handleConfirm}
                                        className="px-8 py-3 bg-forest text-white rounded-full font-bold hover:bg-matcha transition-colors"
                                    >
                                        {t('activities.subscription.confirm_button_process', 'Reintentar ahora')}
                                    </button>
                                    <Link to="/" className="text-forest hover:underline">
                                        {t('common.back_home', 'Volver al Inicio')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ConfirmSubscriptionPage;
