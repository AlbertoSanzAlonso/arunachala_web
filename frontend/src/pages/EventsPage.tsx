import React, { useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import yogaHero from '../assets/images/yoga_hero.png'; // Reusing hero for now

const EventsPage: React.FC = () => {
    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative">
            <Helmet>
                <title>Eventos y Talleres | Arunachala</title>
                <meta name="description" content="Descubre nuestros próximos eventos, talleres y retiros de yoga y bienestar en Arunachala." />
            </Helmet>

            <Header />

            <main className="flex-grow bg-bone pt-32 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="absolute top-0 left-0 md:left-2 z-20">
                        <BackButton />
                    </div>

                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-4 pt-12 md:pt-0"
                        >
                            <h1 className="text-4xl md:text-6xl font-headers text-forest">Próximos Eventos</h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-matcha to-forest mx-auto rounded-full" />
                            <p className="text-lg text-bark/80 max-w-2xl mx-auto">
                                Espacios especiales para profundizar en tu práctica y bienestar.
                            </p>
                        </motion.div>

                        {/* Placeholder for Events */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                            {/* Example Event Card (Static for now) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow text-left"
                            >
                                <div className="h-48 rounded-xl bg-forest/10 mb-6 flex items-center justify-center overflow-hidden">
                                    {/* Placeholder Image */}
                                    <span className="text-forest/40 font-headers text-xl">Retiro de Meditación</span>
                                </div>
                                <span className="inline-block px-3 py-1 bg-matcha/20 text-forest text-xs font-bold rounded-full mb-3">
                                    Próximamente
                                </span>
                                <h3 className="text-2xl font-headers text-bark mb-2">Taller de Inmersión</h3>
                                <p className="text-gray-600 mb-4 text-sm">
                                    Un fin de semana dedicado a la práctica profunda de asanas y filosofía del yoga.
                                </p>
                                <button className="text-forest font-bold hover:text-matcha transition-colors text-sm uppercase tracking-wide">
                                    Más información &rarr;
                                </button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-dashed border-gray-300 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]"
                            >
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">🌿</div>
                                <h3 className="text-xl font-headers text-gray-500">Más eventos pronto</h3>
                                <p className="text-gray-400 text-sm max-w-xs">
                                    Estamos preparando nuevas experiencias para ti. Suscríbete a nuestra newsletter para enterarte primero.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EventsPage;
