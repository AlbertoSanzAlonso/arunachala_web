import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import FadeInSection from '../components/FadeInSection';
import { API_BASE_URL } from '../config';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUtils';

const YogaGalleryPage: React.FC = () => {
    const { t } = useTranslation();
    const [images, setImages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    useEffect(() => {
        fetchGallery();
        const interval = setInterval(fetchGallery, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchGallery = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/gallery/?category=yoga`);
            if (response.ok) {
                const data = await response.json();
                setImages(data);
            }
        } catch (error) {
            console.error("Failed to load yoga gallery:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImageIndex(null);
        document.body.style.overflow = 'auto';
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex + 1) % images.length);
        }
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
        }
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col bg-bone">
            <Header />

            <main className="flex-grow pt-32 pb-16 relative">
                <div className="max-w-7xl mx-auto px-4 md:px-8 relative w-full">
                    {/* Back Button matching Blog styles */}
                    <div className="mb-8 md:mb-0 md:absolute md:top-0 md:left-8 z-20">
                        <BackButton to="/clases-de-yoga" label={t('gallery.yoga.back')} />
                    </div>

                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-headers text-forest uppercase pt-12 md:pt-0">{t('gallery.yoga.title')}</h1>
                    </div>

                    <FadeInSection>
                        <p className="text-center text-bark/70 text-lg max-w-2xl mx-auto mb-16 whitespace-pre-line">
                            {t('gallery.yoga.subtitle')}
                        </p>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-square md:aspect-[4/3] bg-forest/5 rounded-2xl" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {images.map((image, index) => (
                                    <motion.div
                                        key={image.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        onClick={() => openLightbox(index)}
                                        className="group relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
                                    >
                                        <img
                                            src={getImageUrl(image.url)}
                                            alt={image.alt_text || t('gallery.yoga.title')}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-forest/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {!isLoading && images.length === 0 && (
                            <div className="text-center py-20 bg-white/30 rounded-3xl border border-forest/10">
                                <p className="text-forest/60 text-xl font-headers uppercase">{t('gallery.yoga.empty')}</p>
                            </div>
                        )}
                    </FadeInSection>
                </div>
            </main>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImageIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
                        onClick={closeLightbox}
                    >
                        <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110]">
                            <XMarkIcon className="h-10 w-10" />
                        </button>
                        <button onClick={prevImage} className="absolute left-4 md:left-10 text-white/50 hover:text-white transition-all transform hover:scale-110 z-[110]">
                            <ChevronLeftIcon className="h-12 w-12" />
                        </button>
                        <button onClick={nextImage} className="absolute right-4 md:right-10 text-white/50 hover:text-white transition-all transform hover:scale-110 z-[110]">
                            <ChevronRightIcon className="h-12 w-12" />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-full max-h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={getImageUrl(images[selectedImageIndex].url)}
                                alt={images[selectedImageIndex].alt_text || t('gallery.yoga.title')}
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default YogaGalleryPage;
