
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PageSEO from '../components/ui/PageSEO';

const NotFoundPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirecciones de legado (SEO WordPress antiguo)
        const path = location.pathname.toLowerCase();

        const redirects: Record<string, string> = {
            'conferencias-y-talleres': '/actividades',
            'yoga-integral': '/clases-de-yoga',
            'terapias-naturales': '/terapias-y-masajes',
            'beneficios-practica-yoga': '/clases-de-yoga',
            'tipos-de-yoga': '/clases-de-yoga',
            'category': '/blog',
            'tag': '/blog',
            'author': '/blog',
        };

        for (const [oldPath, newPath] of Object.entries(redirects)) {
            if (path.includes(oldPath)) {
                navigate(newPath, { replace: true });
                return;
            }
        }
    }, [location.pathname, navigate]);

    return (
        <div className="font-body text-bark min-h-screen flex flex-col bg-bone">
            <PageSEO
                title="Página no encontrada | Arunachala"
                description="Lo sentimos, la página que buscas no existe o ha sido movida."
                noindex={true}
            />
            <Header />

            <main className="flex-grow flex items-center justify-center p-6 bg-gradient-to-b from-bone to-white">
                <div className="max-w-2xl w-full text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-9xl font-headers text-forest/20 mb-4 select-none">404</h1>
                        <h2 className="text-4xl md:text-5xl font-headers text-forest mb-6 uppercase tracking-wider">
                            Página no encontrada
                        </h2>
                        <div className="w-24 h-1 bg-matcha mx-auto mb-8 rounded-full" />

                        <p className="text-xl text-bark/70 mb-12 font-light leading-relaxed">
                            Parece que el camino que buscabas se ha transformado.
                            Te invitamos a regresar al inicio o explorar nuestras secciones principales.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-4 bg-forest text-white rounded-full font-headers tracking-widest hover:bg-matcha transition-all shadow-lg hover:shadow-xl uppercase"
                            >
                                Regresar al Inicio
                            </button>
                            <button
                                onClick={() => navigate('/clases-de-yoga')}
                                className="px-8 py-4 border-2 border-forest text-forest rounded-full font-headers tracking-widest hover:bg-forest hover:text-white transition-all uppercase"
                            >
                                Clases de Yoga
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default NotFoundPage;
