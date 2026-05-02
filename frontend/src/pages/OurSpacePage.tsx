import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import InstagramFeed from '../components/InstagramFeed';
import BackButton from '../components/ui/BackButton';
import illustrativeMap from '../assets/images/mapa_ilustrativo.webp';

import { API_BASE_URL } from '../config';
import { getImageUrl } from '../utils/imageUtils';
import PageSEO from '../components/ui/PageSEO';

interface GalleryImage {
    id: number;
    url: string;
    alt_text: string;
}

const OurSpacePage: React.FC = () => {
    const { t } = useTranslation();
    const [mainImage, setMainImage] = useState<GalleryImage | null>(null);
    const [sliderImages, setSliderImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                // Fetch Main Image from Config
                const configRes = await fetch(`${API_BASE_URL}/api/site-config/our_space_main_image`);
                if (configRes.ok) {
                    const configData = await configRes.json();
                    if (configData.value) {
                        setMainImage({ id: 0, url: configData.value, alt_text: 'Nuestro Espacio' });
                    }
                }

                // Fetch Slider Images
                const response = await fetch(`${API_BASE_URL}/api/gallery/?category=center`);
                if (response.ok) {
                    const data: GalleryImage[] = await response.json();
                    setSliderImages(data);

                    // Fallback for main image if not in config
                    if (data.length > 0) {
                        setMainImage(prev => prev || data[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching space images:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, []);

    const [[page, direction], setPage] = useState([0, 0]);
    const currentIndex = Math.abs(page % (sliderImages.length || 1));

    const paginate = useCallback((newDirection: number) => {
        setPage(([p]) => [p + newDirection, newDirection]);
    }, []);

    useEffect(() => {
        if (sliderImages.length <= 1) return;
        const interval = setInterval(() => paginate(1), 5000);
        return () => clearInterval(interval);
    }, [sliderImages.length, paginate]);

    const slideVariants = {
        enter: {
            opacity: 0
        },
        center: {
            zIndex: 1,
            opacity: 1
        },
        exit: {
            zIndex: 0,
            opacity: 0
        }
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative">
            <PageSEO
                title={`${t('space.title', 'Nuestro Espacio')} | Arunachala`}
                description="Descubre nuestro centro de yoga y terapias en Cornellá de Llobregat. Un refugio de paz diseñado para tu bienestar."
            />
            <Header />

            <main className="flex-grow bg-bone pt-10 md:pt-16 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="mb-4 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        <BackButton />
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-headers text-forest text-center mb-16 uppercase tracking-wider pt-12 md:pt-0"
                    >
                        {t('space.title', 'Nuestro Espacio')}
                    </motion.h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                        {/* Presentation Text */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6 text-bark/90 leading-relaxed text-lg order-2 lg:order-1"
                        >
                            <h2 className="text-2xl font-headers text-matcha mb-4">
                                {t('space.subtitle', 'Un refugio de paz en la ciudad')}
                            </h2>
                            <p>
                                {t('space.description_1', 'En Arunachala, tu centro de yoga y bienestar en Cornellá de Llobregat, hemos creado un entorno diseñado específicamente para la calma y la introspección. Nuestro espacio está concebido no solo como un lugar para practicar yoga o recibir terapias, sino como un santuario urbano donde desconectar del ruido exterior y reconectar contigo mismo.')}
                            </p>
                            <p>
                                {t('space.description_2', 'Ubicado en el corazón de Cornellá, disponemos de una sala principal diáfana, bañada por luz natural y equipada con materiales orgánicos de alta calidad. El ambiente, impregnado de aromas suaves y silencio, convierte a nuestro centro en el refugio ideal para tu práctica profunda y meditativa desde el primer momento en que cruzas la puerta.')}
                            </p>

                            <a
                                href="https://www.google.com/maps/search/?api=1&query=Yoga+y+Terapias+Arunachala"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-forest font-bold pt-4 hover:text-matcha transition-colors w-fit group"
                            >
                                <MapPinIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span>{t('contact_page.info.address', 'Yoga y Terapias Arunachala - Pasaje de Mateo Oliva, 3, 08940 Cornellá de Llobregat')}</span>
                            </a>
                        </motion.div>

                        {/* Main Image (Fixed) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 order-1 lg:order-2"
                        >
                            {isLoading ? (
                                <div className="w-full h-full flex items-center justify-center text-forest animate-pulse">
                                    Loading...
                                </div>
                            ) : mainImage ? (
                                <img
                                    src={getImageUrl(mainImage.url)}
                                    alt={mainImage.alt_text}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-50" />
                            )}
                        </motion.div>
                    </div>

                    {/* Slider Section (New) */}
                    {sliderImages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-16 rounded-2xl overflow-hidden shadow-xl"
                        >
                            <div className="relative h-[400px] md:h-[500px] bg-forest/5">
                                <AnimatePresence initial={false} custom={direction}>
                                    <motion.div
                                        key={page}
                                        custom={direction}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            opacity: { duration: 1.0, ease: "easeInOut" }
                                        }}
                                        className="absolute inset-0 w-full h-full"
                                    >
                                        <img
                                            src={getImageUrl(sliderImages[currentIndex].url)}
                                            alt={sliderImages[currentIndex].alt_text}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                </AnimatePresence>

                                <div className="absolute inset-0 flex items-center justify-between p-4 z-10 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => paginate(-1)}
                                        className="bg-white/20 hover:bg-matcha text-white p-2 rounded-full backdrop-blur-md transition shadow-lg"
                                    >
                                        <ChevronLeftIcon className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => paginate(1)}
                                        className="bg-white/20 hover:bg-matcha text-white p-2 rounded-full backdrop-blur-md transition shadow-lg"
                                    >
                                        <ChevronRightIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {sliderImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                const dir = idx > currentIndex ? 1 : -1;
                                                setPage([idx, dir]);
                                            }}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Map Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/50 p-6 md:p-10 rounded-2xl shadow-lg border border-white"
                    >
                        <h3 className="text-3xl font-headers text-forest text-center mb-8">{t('space.location_title', 'Cómo llegar')}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-center">
                            <div className="space-y-2 bg-bone/30 p-4 rounded-xl">
                                <h4 className="font-headers text-matcha text-lg uppercase tracking-wider">{t('space.transport.tram_label')}</h4>
                                <p className="text-bark/80">{t('space.transport.tram_details')}</p>
                            </div>
                            <div className="space-y-2 bg-bone/30 p-4 rounded-xl">
                                <h4 className="font-headers text-matcha text-lg uppercase tracking-wider">{t('space.transport.bus_label')}</h4>
                                <p className="text-bark/80">{t('space.transport.bus_details')}</p>
                            </div>
                            <div className="space-y-2 bg-bone/30 p-4 rounded-xl">
                                <h4 className="font-headers text-matcha text-lg uppercase tracking-wider">{t('space.transport.metro_label')}</h4>
                                <p className="text-bark/80">{t('space.transport.metro_details')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                            {/* Illustrative Map */}
                            <div
                                className="relative group overflow-hidden rounded-xl border border-bone/50 shadow-md cursor-zoom-in"
                                onClick={() => setIsMapModalOpen(true)}
                            >
                                <img
                                    src={illustrativeMap}
                                    alt="Mapa ilustrativo"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-bark/60 backdrop-blur-sm p-3 text-white text-center font-headers text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    {t('space.illustrative_map_label', 'Mapa de referencia')}
                                </div>
                            </div>

                            {/* Interactive Map */}
                            <div className="w-full h-[300px] lg:h-auto rounded-xl overflow-hidden bg-gray-200 shadow-md border border-bone/50 relative group/map">
                                <iframe
                                    src="https://maps.google.com/maps?q=Passatge+de+Mateu+Oliva,+3,+Cornellá+de+Llobregat&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Arunachala Location"
                                ></iframe>
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=Yoga+y+Terapias+Arunachala"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-forest text-white rounded-full font-headers text-sm tracking-widest hover:bg-matcha transition-all duration-300 shadow-xl flex items-center gap-2 opacity-90 hover:opacity-100 hover:scale-105 z-10"
                                >
                                    <MapPinIcon className="w-4 h-4" />
                                    {t('space.open_gps', 'Abrir en GPS')}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative w-full mt-24">

                    {/* Instagram Section */}
                    <section className="mb-24 w-full">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-headers text-forest mb-4">
                                {t('about.instagram.title')}
                            </h3>
                            <p className="text-bark/80 italic text-lg">
                                {t('about.instagram.subtitle')}
                            </p>
                        </div>

                        <div className="max-w-6xl mx-auto">
                            {/* 
                                Feed de Instagram de Arunachala
                             */}
                            <InstagramFeed feedId="GTNXwa8edsWhyGhrMLiC" />
                        </div>

                        <div className="text-center mt-12">
                            <a
                                href="https://www.instagram.com/yogayterapiasarunachala/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-matcha hover:text-forest transition-colors font-headers tracking-widest uppercase text-sm border-b border-matcha/30 hover:border-forest pb-1"
                            >
                                <span>{t('about.instagram.follow')}</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                        </div>
                    </section>
                </div>
            </main>

            <AnimatePresence>
                {isMapModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMapModalOpen(false)}
                        className="fixed inset-0 z-[100] bg-forest/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsMapModalOpen(false)}
                                className="absolute top-4 right-4 z-10 p-2 bg-bark/10 hover:bg-bark/20 rounded-full transition-colors"
                            >
                                <ChevronLeftIcon className="w-6 h-6 rotate-180" />
                            </button>
                            <img
                                src={illustrativeMap}
                                alt="Mapa ilustrativo ampliado"
                                className="w-full h-auto max-h-[85vh] object-contain"
                            />
                            <div className="p-6 bg-forest text-white text-center font-headers text-lg tracking-widest uppercase">
                                {t('space.illustrative_map_label', 'Mapa de referencia')}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <Footer />
        </div>
    );
};

export default OurSpacePage;
