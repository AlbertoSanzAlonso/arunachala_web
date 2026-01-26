import React, { useRef, useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import FadeInSection from '../components/FadeInSection';
import therapyHero from '../assets/images/gallery/therapy_sample.webp';
import lotusFlower from '../assets/images/lotus_flower.png';
import { API_BASE_URL } from '../config';

// Lazy load heavy components
const ImageSlider = lazy(() => import('../components/ImageSlider'));

const MOCK_MASSAGES = [
    {
        title: "Masaje Tradicional Tailandés",
        description: "Una danza sagrada de estiramientos y presiones encaminada a equilibrar la energía vital.",
        benefits: "Mejora la flexibilidad, reduce el estrés y libera bloqueos energéticos.",
        duration: "60/90 min"
    },
    {
        title: "Masaje Descontracturante",
        description: "Enfoque profundo para liberar tensiones musculares crónicas y contracturas.",
        benefits: "Alivio del dolor, mejora de la circulación y recuperación muscular.",
        duration: "60 min"
    },
    {
        title: "Reflexología Podal",
        description: "Estimulación de zonas reflejas en los pies que corresponden a diferentes órganos.",
        benefits: "Relajación profunda y estimulación de los mecanismos de autocuración.",
        duration: "45 min"
    }
];

const MOCK_THERAPIES = [
    {
        title: "Reiki Usui",
        description: "Canalización de energía vital a través de las manos para armonizar cuerpo, mente y espíritu.",
        benefits: "Paz interior, reducción de ansiedad y equilibrio emocional.",
        duration: "60 min"
    },
    {
        title: "Terapia Floral (Flores de Bach)",
        description: "Acompañamiento emocional mediante esencias naturales personalizadas.",
        benefits: "Gestión de miedos, inseguridades y procesos de cambio.",
        duration: "45 min"
    },
    {
        title: "Bio-Neuro-Emoción",
        description: "Indagación en el origen emocional de los síntomas físicos para su comprensión y sanación.",
        benefits: "Toma de conciencia, cambio de perspectiva y liberación emocional.",
        duration: "90 min"
    }
];

const TherapiesPage: React.FC = () => {
    const massagesRef = useRef<HTMLDivElement>(null);
    const therapiesRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const blogRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [galleryImages, setGalleryImages] = useState<string[]>([]);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/gallery/?category=therapies`);
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

    const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const SectionLoader = () => (
        <div className="w-full h-96 flex items-center justify-center bg-bone/20 rounded-xl animate-pulse">
            <div className="text-forest/40 font-headers text-xl">Cargando contenido...</div>
        </div>
    );

    return (
        <div className="font-body text-bark min-h-screen flex flex-col">
            <Helmet>
                <title>Masaje y Terapias en Cornellà | Arunachala</title>
                <meta name="description" content="Descubre nuestras terapias y masajes en Cornellà de Llobregat. Reiki, Terapia Floral, Masaje Tailandés y más para tu bienestar." />
            </Helmet>

            <Header />

            <main className="flex-grow bg-bone">
                {/* Hero Section */}
                <div className="relative w-full min-h-[100vh] md:min-h-0 md:h-[80vh] flex items-center justify-center overflow-hidden">
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${therapyHero})` }}
                    >
                        <div className="absolute inset-0 bg-black/50" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto w-full h-full pt-28 md:pt-0">
                        <div className="self-start md:absolute md:top-32 md:left-8 w-full md:w-auto mb-4 md:mb-0 text-white">
                            <BackButton className="text-white hover:text-matcha transition-colors" />
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-8xl font-headers text-white mb-6 md:mb-6 tracking-wide drop-shadow-lg"
                        >
                            MASAJE Y TERAPIAS
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg md:text-2xl text-white/95 mb-10 md:mb-12 max-w-xl md:max-w-2xl font-light leading-relaxed px-4"
                        >
                            Un espacio para el reencuentro contigo mismo a través del cuidado corporal y emocional.
                        </motion.p>

                        {/* Navigation Grid */}
                        <nav className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-md md:max-w-6xl px-2">
                            {[
                                { name: "Masajes", ref: massagesRef, delay: 0.4 },
                                { name: "Terapias", ref: therapiesRef, delay: 0.5 },
                                { name: "Galería", ref: galleryRef, delay: 0.6 },
                                { name: "Blog", ref: blogRef, delay: 0.7 }
                            ].map((item) => (
                                <motion.button
                                    key={item.name}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: item.delay }}
                                    onClick={() => scrollTo(item.ref)}
                                    className="group relative h-32 md:h-48 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-300 w-full"
                                >
                                    <span className="text-xl md:text-3xl font-headers text-white group-hover:text-matcha transition-colors">{item.name}</span>
                                </motion.button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Masajes Section */}
                <section ref={massagesRef} className="py-24 bg-white scroll-mt-20">
                    <FadeInSection className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-headers text-forest mb-4">Nuestros Masajes</h2>
                            <p className="text-bark/70 text-lg md:text-xl">Libera tensiones y recupera la vitalidad de tu cuerpo.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {MOCK_MASSAGES.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -10 }}
                                    className="p-8 rounded-3xl bg-bone/30 border border-forest/10 hover:shadow-2xl transition-all duration-500"
                                >
                                    <h3 className="text-2xl font-headers text-forest mb-4">{msg.title}</h3>
                                    <p className="text-bark/80 mb-4 leading-relaxed">{msg.description}</p>
                                    <p className="text-sm italic text-matcha font-bold mb-4">{msg.benefits}</p>
                                    <div className="flex justify-between items-center mt-6 border-t border-forest/5 pt-4">
                                        <span className="text-forest/60 text-sm font-bold">{msg.duration}</span>
                                        <button className="text-forest font-bold hover:text-matcha transition-colors">Ver más →</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </FadeInSection>
                </section>

                {/* Terapias Section */}
                <section ref={therapiesRef} className="py-24 bg-bone scroll-mt-20">
                    <FadeInSection className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-headers text-forest mb-4">Terapias Holísticas</h2>
                            <p className="text-bark/70 text-lg md:text-xl">Acompañamiento en tu proceso de sanación y autoconocimiento.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {MOCK_THERAPIES.map((thr, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -10 }}
                                    className="p-8 rounded-3xl bg-white border border-forest/10 hover:shadow-2xl transition-all duration-500"
                                >
                                    <h3 className="text-2xl font-headers text-forest mb-4">{thr.title}</h3>
                                    <p className="text-bark/80 mb-4 leading-relaxed">{thr.description}</p>
                                    <p className="text-sm italic text-matcha font-bold mb-4">{thr.benefits}</p>
                                    <div className="flex justify-between items-center mt-6 border-t border-forest/5 pt-4">
                                        <span className="text-forest/60 text-sm font-bold">{thr.duration}</span>
                                        <button className="text-forest font-bold hover:text-matcha transition-colors">Ver más →</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </FadeInSection>
                </section>

                {/* Galería Section */}
                <section ref={galleryRef} className="py-24 bg-white scroll-mt-20">
                    <FadeInSection className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-6xl font-headers text-forest mb-4">Galería</h2>
                            <p className="text-bark/70 text-lg">Un vistazo a nuestro espacio de sanación.</p>
                        </div>
                        <Suspense fallback={<SectionLoader />}>
                            {galleryImages.length > 0 ? (
                                <ImageSlider images={galleryImages}>
                                    <div className="absolute bottom-8 right-8 z-30">
                                        <button
                                            onClick={() => navigate('/gallery/therapies')}
                                            className="px-8 py-3 bg-black/30 hover:bg-white backdrop-blur-md border border-white/30 rounded-full text-white hover:text-forest font-headers tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group"
                                        >
                                            Ver Galería Completa <span className="text-xl leading-none mb-1">→</span>
                                        </button>
                                    </div>
                                </ImageSlider>
                            ) : (
                                <div className="h-64 flex items-center justify-center bg-gray-100 rounded-xl">
                                    <p className="text-gray-400">Próximamente fotos del centro...</p>
                                </div>
                            )}
                        </Suspense>
                    </FadeInSection>
                </section>

                {/* Blog Section */}
                <section ref={blogRef} className="py-24 bg-bone border-t border-forest/5 scroll-mt-20">
                    <FadeInSection className="max-w-7xl mx-auto px-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <h2 className="text-4xl md:text-6xl font-headers text-forest mb-3">Blog de Bienestar</h2>
                                <p className="text-bark/70 text-lg">Lecturas para nutrir tu alma y equilibrar tu vida.</p>
                            </div>
                            <button onClick={() => navigate('/blog')} className="text-forest font-bold hover:text-matcha transition-colors text-lg">Ver todo el blog →</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Simple placeholders for blog */}
                            <div className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                                <div className="h-64 bg-forest/10 flex items-center justify-center">
                                    <img src={lotusFlower} alt="" className="h-20 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-8">
                                    <span className="text-xs font-bold text-matcha uppercase tracking-widest mb-2 block">Bienestar</span>
                                    <h3 className="text-2xl font-headers text-forest mb-3">El poder del Masaje Tailandés</h3>
                                    <p className="text-bark/80 leading-relaxed">Descubre por qué esta técnica milenaria es mucho más que un simple masaje relajante...</p>
                                </div>
                            </div>
                            <div className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                                <div className="h-64 bg-forest/10 flex items-center justify-center">
                                    <img src={lotusFlower} alt="" className="h-20 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-8">
                                    <span className="text-xs font-bold text-matcha uppercase tracking-widest mb-2 block">Terapias</span>
                                    <h3 className="text-2xl font-headers text-forest mb-3">Introducción al Reiki Usui</h3>
                                    <p className="text-bark/80 leading-relaxed">Cómo la energía universal puede ayudarte a gestionar el estrés de la vida moderna...</p>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default TherapiesPage;

