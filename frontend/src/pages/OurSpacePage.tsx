import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import illustrativeMap from '../assets/images/mapa_ilustrativo.webp';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface GalleryImage {
    id: number;
    url: string;
    alt_text: string;
}

const OurSpacePage: React.FC = () => {
    const { t } = useTranslation();
    const [mainImage, setMainImage] = useState<GalleryImage | null>(null);
    const [sliderImages, setSliderImages] = useState<GalleryImage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/gallery?category=center`);
                if (response.ok) {
                    const data: GalleryImage[] = await response.json();

                    const main = data.find(img => img.alt_text?.includes('[MAIN]')) || data[0];
                    setMainImage(main);
                    setSliderImages(data);
                }
            } catch (error) {
                console.error("Error fetching space images:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, []);

    const nextSlide = useCallback(() => {
        if (sliderImages.length === 0) return;
        setCurrentIndex((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
    }, [sliderImages.length]);

    const prevSlide = () => {
        if (sliderImages.length === 0) return;
        setCurrentIndex((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (sliderImages.length <= 1) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [sliderImages.length, nextSlide]);

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative">
            <Header />

            <main className="flex-grow bg-bone pt-32 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="absolute top-0 left-0 md:left-2 z-20">
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
                                {t('space.description_1', 'En Arunachala, hemos creado un entorno diseñado específicamente para la calma y la introspección. Nuestro centro está concebido no solo como un lugar para practicar yoga, sino como un santuario donde desconectar del ruido exterior y reconectar contigo mismo.')}
                            </p>
                            <p>
                                {t('space.description_2', 'Disponemos de una sala principal diáfana, bañada por luz natural y equipada con materiales orgánicos de alta calidad. El ambiente, impregnado de aromas suaves y silencio, invita a la práctica profunda y meditativa desde el primer momento en que cruzas la puerta.')}
                            </p>

                            <div className="flex items-center gap-2 text-forest font-bold pt-4">
                                <MapPinIcon className="w-6 h-6" />
                                <span>Carrer del Bruc, 44, 08940 Cornellà de Llobregat</span>
                            </div>
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
                                    src={`${API_BASE_URL}${mainImage.url}`}
                                    alt={mainImage.alt_text}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-forest/10 text-forest">
                                    <p>{t('space.no_images', 'Imágenes próximamente')}</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Slider Section (New) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 rounded-2xl overflow-hidden shadow-xl"
                    >
                        {sliderImages.length > 0 && (
                            <div className="relative h-[400px] md:h-[500px] bg-gray-100">
                                <AnimatePresence mode='wait'>
                                    <motion.img
                                        key={currentIndex}
                                        src={`${API_BASE_URL}${sliderImages[currentIndex].url}`}
                                        alt={sliderImages[currentIndex].alt_text}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </AnimatePresence>

                                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={prevSlide}
                                        className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition"
                                    >
                                        <ChevronLeftIcon className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition"
                                    >
                                        <ChevronRightIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {sliderImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

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
                            <div className="relative group overflow-hidden rounded-xl border border-bone/50 shadow-md">
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
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2994.417382029013!2d2.0716613!3d41.3533816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a49954a5c54c33%3A0x1d3680236315f385!2sCarrer%20del%20Bruc%2C%2044%2C%2008940%20Cornell%C3%A0%20de%20Llobregat%2C%20Barcelona!5e0!3m2!1ses!2ses!4v1707000000000!5m2!1ses!2ses"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Arunachala Location"
                                ></iframe>
                                <a
                                    href="https://www.google.com/maps/dir/?api=1&destination=Arunachala+Yoga+Bruc+44+Cornella"
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
            </main>
            <Footer />
        </div>
    );
};

export default OurSpacePage;
