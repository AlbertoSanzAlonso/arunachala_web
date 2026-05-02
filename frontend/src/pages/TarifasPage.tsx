import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';
import { CurrencyEuroIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUtils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { Helmet } from 'react-helmet-async';

interface Tarifa {
    id: number;
    title: string;
    description: string;
    price: string;
    image_url?: string;
    translations?: any;
}

const TarifasPage: React.FC = () => {
    const [tarifas, setTarifas] = useState<Tarifa[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language.split('-')[0];
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTarifas = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/promotions/tarifas`);
                if (response.ok) {
                    const data = await response.json();
                    setTarifas(data);
                }
            } catch (error) {
                console.error('Error fetching tarifas:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTarifas();
    }, []);

    return (
        <div className="font-body text-bark min-h-screen flex flex-col bg-bone">
            <Helmet>
                <title>{t('tarifas.title', 'Tarifas y Precios')} | Arunachala</title>
                <meta name="description" content={t('tarifas.subtitle', 'Consulta nuestros precios y planes de actividades.')} />
            </Helmet>

            <Header />

            <main className="flex-grow pt-10 md:pt-16 pb-24 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-20 -left-24 w-96 h-96 bg-forest rounded-full blur-[120px]" />
                    <div className="absolute bottom-40 -right-24 w-96 h-96 bg-bark rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="mb-4">
                        <BackButton />
                    </div>

                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-forest/10 backdrop-blur-md rounded-full text-forest border border-forest/20 mb-8"
                        >
                            <CurrencyEuroIcon className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-[0.2em]">{t('tarifas.label', 'Precios')}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl sm:text-5xl md:text-7xl font-headers text-forest mb-8 uppercase tracking-widest leading-tight"
                        >
                            {t('tarifas.title', 'Nuestras Tarifas')}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-2xl text-bark/70 italic font-light max-w-3xl mx-auto leading-relaxed"
                        >
                            {t('tarifas.subtitle', 'Planes flexibles diseñados para adaptarse a tu ritmo y necesidades.')}
                        </motion.p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-forest/10 border-t-forest rounded-full animate-spin" />
                        </div>
                    ) : tarifas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {tarifas.map((tarifa, idx) => {
                                const title = tarifa.translations?.[currentLang]?.title || tarifa.title;
                                const description = tarifa.translations?.[currentLang]?.description || tarifa.description;

                                return (
                                    <motion.div
                                        key={tarifa.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center"
                                    >
                                        <div className="w-20 h-20 bg-forest/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            {tarifa.image_url ? (
                                                <img src={getImageUrl(tarifa.image_url)} alt={title} className="w-12 h-12 object-contain" />
                                            ) : (
                                                <SparklesIcon className="w-10 h-10 text-forest/40" />
                                            )}
                                        </div>

                                        <h3 className="text-2xl font-headers text-forest mb-4">{title}</h3>
                                        <p className="text-bark/60 font-light mb-8 italic flex-grow">{description}</p>

                                        <div className="mt-auto pt-6 border-t border-gray-50 w-full">
                                            <span className="text-4xl font-headers text-forest font-bold tracking-tight">
                                                {tarifa.price}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/40 rounded-[3rem] border border-white/60 backdrop-blur-md">
                            <CurrencyEuroIcon className="w-16 h-16 text-bark/20 mx-auto mb-6" />
                            <p className="text-xl text-bark/40 italic">Consulta con nosotros para conocer nuestras tarifas personalizadas.</p>
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
                            {t('menu.contact', 'Contactar')}
                        </motion.button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TarifasPage;
