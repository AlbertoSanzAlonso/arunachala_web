import React, { useRef, useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import FadeInSection from '../components/FadeInSection';
import yogaHero from '../assets/images/yoga_hero.png';
import { API_BASE_URL } from '../config';

// Lazy load heavy components for performance
const YogaSchedule = lazy(() => import('../components/YogaSchedule'));
const ImageSlider = lazy(() => import('../components/ImageSlider'));

const YogaPage: React.FC = () => {
    const scheduleRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const blogRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [galleryImages, setGalleryImages] = useState<string[]>([]);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/gallery/?category=yoga`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        const urls = data.map((img: any) => `${API_BASE_URL}${img.url}`);
                        setGalleryImages(urls);
                    }
                }
            } catch (error) {
                console.error("Failed to load gallery:", error);
            }
        };

        fetchGallery();
        const interval = setInterval(fetchGallery, 5000);
        return () => clearInterval(interval);
    }, []);

    const scrollToSchedule = () => {
        scheduleRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToGallery = () => {
        galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToBlog = () => {
        blogRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll Snap & Back to Top Logic
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 500) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Loading skeleton for lazy components
    const SectionLoader = () => (
        <div className="w-full h-96 flex items-center justify-center bg-bone/20 rounded-xl animate-pulse">
            <div className="text-forest/40 font-headers text-xl">Cargando contenido...</div>
        </div>
    );

    return (
        <div className="font-body text-bark h-screen overflow-y-auto flex flex-col relative snap-y snap-mandatory scroll-smooth">
            <Helmet>
                <title>Clases de Yoga en Barcelona | Arunachala</title>
                <meta name="description" content="Descubre nuestras clases de yoga en Cornellà de Llobregat. Hatha Yoga, Vinyasa y meditación para todos los niveles. Horarios flexibles y ambiente acogedor." />
                <meta name="keywords" content="yoga, barcelona, cornella, hatha yoga, vinyasa, meditación, bienestar, clases yoga" />
            </Helmet>

            <Header />

            {/* Floating Back to Top Button */}
            {showBackToTop && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 bg-forest text-white p-4 rounded-full shadow-2xl hover:bg-matcha transition-colors group focus:outline-none focus:ring-2 focus:ring-matcha/50"
                    aria-label="Volver arriba"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </motion.button>
            )}

            <main className="flex-grow bg-bone">
                {/* Hero Section */}
                <div id="top" className="relative w-full min-h-[100vh] md:min-h-0 md:h-[80vh] flex items-center justify-center overflow-hidden snap-start" role="banner">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${yogaHero})` }}
                        aria-hidden="true"
                    >
                        <div className="absolute inset-0 bg-black/40" />
                    </div>

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto w-full h-full pt-28 pb-12 md:pt-0 md:pb-0">
                        <div className="self-start md:absolute md:top-32 md:left-8 w-full md:w-auto mb-4 md:mb-0">
                            <BackButton className="text-white hover:text-matcha transition-colors" />
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-8xl font-headers text-white mb-6 md:mb-6 tracking-wide drop-shadow-lg mt-8 md:mt-0"
                        >
                            YOGA
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg md:text-2xl text-white/95 mb-10 md:mb-12 max-w-xl md:max-w-2xl font-light leading-relaxed px-4"
                        >
                            Encuentra equilibrio y paz a través del movimiento y la respiración.
                        </motion.p>

                        {/* Buttons Grid */}
                        <nav className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-md md:max-w-4xl px-2" aria-label="Navegación rápida">
                            {/* Schedule Button */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.3, delay: 0.4 }}
                                onClick={scrollToSchedule}
                                className="group relative h-32 md:h-64 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-300 w-full"
                                aria-label="Ver horarios de clases"
                            >
                                <span className="text-2xl md:text-4xl font-headers text-white mb-1 md:mb-2 group-hover:text-matcha transition-colors">Horarios</span>
                                <span className="text-white/80 text-xs md:text-base opacity-90 md:opacity-0 group-hover:opacity-100 transition-opacity transform md:translate-y-2 group-hover:translate-y-0">
                                    Reserva tu clase
                                </span>
                            </motion.button>

                            {/* Gallery Button */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.3, delay: 0.5 }}
                                onClick={scrollToGallery}
                                className="group relative h-32 md:h-64 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-300 w-full"
                                aria-label="Ver galería de imágenes"
                            >
                                <span className="text-2xl md:text-4xl font-headers text-white mb-1 md:mb-2 group-hover:text-matcha transition-colors">Galería</span>
                                <span className="text-white/80 text-xs md:text-base opacity-90 md:opacity-0 group-hover:opacity-100 transition-opacity transform md:translate-y-2 group-hover:translate-y-0">
                                    Nuestro Espacio
                                </span>
                            </motion.button>

                            {/* Blog Button */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.3, delay: 0.6 }}
                                onClick={scrollToBlog}
                                className="group relative h-32 md:h-64 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-300 w-full"
                                aria-label="Ver blog y artículos"
                            >
                                <span className="text-2xl md:text-4xl font-headers text-white mb-1 md:mb-2 group-hover:text-matcha transition-colors">Blog</span>
                                <span className="text-white/80 text-xs md:text-base opacity-90 md:opacity-0 group-hover:opacity-100 transition-opacity transform md:translate-y-2 group-hover:translate-y-0">
                                    Artículos y Reflexiones
                                </span>
                            </motion.button>
                        </nav>
                    </div>
                </div>

                {/* Schedule Section */}
                <section ref={scheduleRef} className="bg-white py-24 md:py-32 scroll-mt-20 snap-start relative" aria-label="Horarios de Clases">
                    <FadeInSection className="max-w-7xl mx-auto px-4 md:px-8">
                        <Suspense fallback={<SectionLoader />}>
                            <YogaSchedule />
                        </Suspense>

                        <div className="flex justify-center mt-12 md:mt-16">
                            <button
                                onClick={scrollToTop}
                                className="text-forest/60 hover:text-forest transition-colors flex flex-col items-center gap-2 group text-sm uppercase tracking-widest font-bold"
                            >
                                <span className="group-hover:-translate-y-1 transition-transform">↑</span>
                                Volver al principio
                            </button>
                        </div>
                    </FadeInSection>
                </section>

                {/* Gallery Slider Section */}
                <section ref={galleryRef} className="w-full max-w-7xl mx-auto px-4 md:px-6 py-24 scroll-mt-24 snap-start" aria-label="Galería de Imágenes">
                    <FadeInSection>
                        <h2 className="text-3xl md:text-5xl font-headers text-forest mb-12 text-center text-pretty uppercase">Galería de Imágenes</h2>
                        <Suspense fallback={<SectionLoader />}>
                            {galleryImages.length > 0 ? (
                                <ImageSlider images={galleryImages}>
                                    <div className="absolute bottom-5 right-5 md:bottom-8 md:right-8 pointer-events-auto z-30">
                                        <button
                                            onClick={() => navigate('/galeria/yoga')}
                                            className="px-6 py-2 md:px-8 md:py-3 bg-black/30 hover:bg-white backdrop-blur-md border border-white/30 rounded-full text-white hover:text-forest font-headers tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 group text-sm md:text-base uppercase"
                                        >
                                            Ver Galería Completa <span className="text-xl leading-none mb-1">→</span>
                                        </button>
                                    </div>
                                </ImageSlider>
                            ) : (
                                <div className="h-64 flex items-center justify-center bg-gray-100 rounded-xl">
                                    <p className="text-gray-400">Cargando galería...</p>
                                </div>
                            )}
                        </Suspense>

                        <div className="flex justify-center mt-16">
                            <button
                                onClick={scrollToTop}
                                className="text-forest/60 hover:text-forest transition-colors flex flex-col items-center gap-2 group text-sm uppercase tracking-widest font-bold"
                            >
                                <span className="group-hover:-translate-y-1 transition-transform">↑</span>
                                Volver al principio
                            </button>
                        </div>
                    </FadeInSection>
                </section>

                {/* Blog Preview Section */}
                <section ref={blogRef} className="bg-white py-24 md:py-32 border-t border-forest/5 scroll-mt-20 snap-start" aria-label="Últimas publicaciones del blog">
                    <FadeInSection className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-headers text-forest mb-3 uppercase">Últimas Publicaciones</h2>
                                <p className="text-bark/70 text-lg">Inspiración para tu práctica y vida diaria</p>
                            </div>
                            <button
                                onClick={() => navigate('/blog')}
                                className="hidden md:block text-forest font-bold hover:text-matcha transition-colors text-lg uppercase"
                                aria-label="Ir a la página principal del blog"
                            >
                                Ver todo el blog →
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                            {/* Mock Blog Posts */}
                            {[
                                {
                                    id: 1,
                                    title: "Beneficios del Yoga Matuino",
                                    excerpt: "Descubre cómo empezar tu día con energía y claridad mental a través de una práctica suave.",
                                    date: "20 Diciembre 2025",
                                    image: "https://images.unsplash.com/photo-1544367563-121955377435?q=80&w=600&auto=format&fit=crop"
                                },
                                {
                                    id: 2,
                                    title: "Meditación para Principiantes",
                                    excerpt: "Guía paso a paso para incorporar la meditación en tu rutina diaria sin estrés.",
                                    date: "15 Enero 2026",
                                    image: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=600&auto=format&fit=crop"
                                },
                                {
                                    id: 3,
                                    title: "Alimentación Consciente",
                                    excerpt: "Cómo la nutrición influye en tu práctica de yoga y bienestar general.",
                                    date: "22 Enero 2026",
                                    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"
                                }
                            ].map(post => (
                                <article
                                    key={post.id}
                                    onClick={() => navigate('/blog')}
                                    className="bg-bone/30 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full flex flex-col"
                                >
                                    <div className="h-56 overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={`Imagen para el artículo: ${post.title}`}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="p-8 flex-grow flex flex-col">
                                        <span className="text-xs font-bold text-matcha uppercase tracking-widest mb-2 block">{post.date}</span>
                                        <h3 className="text-xl font-headers text-forest mb-3 group-hover:text-matcha transition-colors leading-tight uppercase">{post.title}</h3>
                                        <p className="text-bark/80 text-base leading-relaxed mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                                        <span className="text-forest text-sm font-bold mt-auto pt-4 border-t border-forest/10 inline-block uppercase">Leer artículo</span>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate('/blog')}
                            className="md:hidden w-full mt-12 text-forest font-bold border-2 border-forest/20 py-4 rounded-xl hover:bg-forest hover:text-white transition-all text-lg uppercase"
                        >
                            Ver todo el blog
                        </button>

                        <div className="flex justify-center mt-16">
                            <button
                                onClick={scrollToTop}
                                className="text-forest/60 hover:text-forest transition-colors flex flex-col items-center gap-2 group text-sm uppercase tracking-widest font-bold"
                            >
                                <span className="group-hover:-translate-y-1 transition-transform">↑</span>
                                Volver al principio
                            </button>
                        </div>
                    </FadeInSection>
                </section>
            </main>
            <Footer />
        </div >

    );
};

export default YogaPage;
