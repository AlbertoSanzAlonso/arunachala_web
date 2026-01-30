import React, { useRef, useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import FadeInSection from '../components/FadeInSection';
import therapyHero from '../assets/images/gallery/therapy_sample.webp';
import lotusFlower from '../assets/images/lotus_flower.png';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';

// Lazy load heavy components
const ImageSlider = lazy(() => import('../components/ImageSlider'));

interface Treatment {
    id: number;
    name: string;
    excerpt: string;
    description: string;
    benefits: string;
    duration_min: number;
    image_url: string | null;
    translations?: any;
}

const TherapiesPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const massagesRef = useRef<HTMLDivElement>(null);
    const therapiesRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const blogRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [galleryImages, setGalleryImages] = useState<string[]>([]);

    // Data State
    const [massages, setMassages] = useState<Treatment[]>([]);
    const [therapies, setTherapies] = useState<Treatment[]>([]);
    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Gallery
                const galleryRes = await fetch(`${API_BASE_URL}/api/gallery/?category=therapies`);
                if (galleryRes.ok) {
                    const data = await galleryRes.json();
                    if (data.length > 0) {
                        const urls = data.map((img: any) => `${API_BASE_URL}${img.url}`);
                        setGalleryImages(urls);
                    }
                }

                // Fetch Massages
                const massagesRes = await fetch(`${API_BASE_URL}/api/treatments/massages`);
                if (massagesRes.ok) {
                    setMassages(await massagesRes.json());
                }

                // Fetch Therapies
                const therapiesRes = await fetch(`${API_BASE_URL}/api/treatments/therapies`);
                if (therapiesRes.ok) {
                    setTherapies(await therapiesRes.json());
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToTop = () => {
        containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const [showBackToTop, setShowBackToTop] = useState(false);
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            setShowBackToTop(container.scrollTop > 500);
        };
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const SectionLoader = () => (
        <div className="w-full h-96 flex items-center justify-center bg-bone/20 rounded-xl animate-pulse">
            <div className="text-forest/40 font-headers text-xl">{t('home.loading.experience')}</div>
        </div>
    );

    return (
        <div ref={containerRef} className="font-body text-bark h-screen overflow-y-auto flex flex-col relative snap-y snap-proximity scroll-smooth">
            <Helmet>
                <title>{t('therapies.seo.title')}</title>
                <meta name="description" content={t('therapies.seo.description')} />
            </Helmet>

            <Header />

            {/* Modal for Treatment Details */}
            <AnimatePresence>
                {selectedTreatment && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedTreatment(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row relative"
                        >
                            <button
                                onClick={() => setSelectedTreatment(null)}
                                className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-forest hover:text-white transition-colors z-10"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>

                            <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-100 flex-shrink-0">
                                {selectedTreatment.image_url ? (
                                    <img
                                        src={selectedTreatment.image_url.startsWith('http') ? selectedTreatment.image_url : `${API_BASE_URL}${selectedTreatment.image_url}`}
                                        alt={getTranslated(selectedTreatment, 'name', i18n.language)}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-forest/20">
                                        <img src={lotusFlower} className="w-24 opacity-20" alt="" />
                                    </div>
                                )}
                            </div>

                            <div className="p-8 md:p-10 flex-1">
                                {selectedTreatment.duration_min && selectedTreatment.duration_min > 0 && (
                                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-white uppercase bg-matcha rounded-full">
                                        {selectedTreatment.duration_min} MIN
                                    </span>
                                )}
                                <h3 className="text-3xl md:text-4xl font-headers text-forest mb-6 uppercase">
                                    {getTranslated(selectedTreatment, 'name', i18n.language)}
                                </h3>

                                <div className="prose prose-stone max-w-none">
                                    <h4 className="text-lg font-bold text-forest uppercase tracking-wide mb-2">{t('therapies.modal.description')}</h4>
                                    <p className="text-bark/80 leading-relaxed mb-6 whitespace-pre-line">
                                        {getTranslated(selectedTreatment, 'description', i18n.language) || getTranslated(selectedTreatment, 'excerpt', i18n.language) || t('therapies.modal.no_description')}
                                    </p>

                                    {getTranslated(selectedTreatment, 'benefits', i18n.language) && (
                                        <>
                                            <h4 className="text-lg font-bold text-forest uppercase tracking-wide mb-2">{t('therapies.modal.benefits')}</h4>
                                            <p className="text-matcha font-medium leading-relaxed italic">
                                                {getTranslated(selectedTreatment, 'benefits', i18n.language)}
                                            </p>
                                        </>
                                    )}
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={() => setSelectedTreatment(null)}
                                        className="text-sm font-bold text-forest hover:text-matcha uppercase tracking-widest transition-colors"
                                    >
                                        {t('therapies.modal.close')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Back to Top Button */}
            {showBackToTop && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 bg-forest text-white p-4 rounded-full shadow-2xl hover:bg-matcha transition-colors group focus:outline-none focus:ring-2 focus:ring-matcha/50"
                    aria-label={t('yoga.common.back_to_top')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </motion.button>
            )}

            <main className="flex-grow bg-bone">
                {/* Hero Section */}
                <div className="relative w-full min-h-[100vh] md:min-h-0 md:h-[80vh] flex items-center justify-center overflow-hidden snap-start">
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${therapyHero})` }}
                    >
                        <div className="absolute inset-0 bg-black/50" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto w-full h-full pt-28 pb-32 md:pt-12 md:pb-0">
                        <div className="self-start md:absolute md:top-32 md:left-10 w-full md:w-auto mb-4 md:mb-0 text-white">
                            <BackButton className="text-white hover:text-matcha transition-colors" label={t('common.back_home')} />
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-8xl font-headers text-white mb-6 md:mb-6 tracking-wide drop-shadow-lg uppercase"
                        >
                            {t('therapies.title')}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg md:text-2xl text-white/95 mb-10 md:mb-12 max-w-xl md:max-w-2xl font-light leading-relaxed px-4"
                        >
                            {t('therapies.subtitle')}
                        </motion.p>

                        <nav className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-md md:max-w-6xl px-2">
                            {[
                                { name: t('therapies.buttons.massages'), ref: massagesRef, delay: 0.4 },
                                { name: t('therapies.buttons.therapies'), ref: therapiesRef, delay: 0.5 },
                                { name: t('therapies.buttons.gallery'), ref: galleryRef, delay: 0.6 },
                                { name: t('therapies.buttons.blog'), ref: blogRef, delay: 0.7 }
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
                                    <span className="text-xl md:text-3xl font-headers text-white group-hover:text-matcha transition-colors uppercase">{item.name}</span>
                                </motion.button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Masajes Section */}
                <section ref={massagesRef} className="py-32 md:py-48 bg-white scroll-mt-24 snap-start relative">
                    <FadeInSection className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-headers text-forest mb-4 uppercase">{t('therapies.sections.massages')}</h2>
                            <p className="text-bark/70 text-lg md:text-xl">{t('therapies.sections.massages_sub')}</p>
                        </div>

                        {massages.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {massages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        whileHover={{ y: -10 }}
                                        onClick={() => setSelectedTreatment(msg)}
                                        className="group cursor-pointer p-8 rounded-3xl bg-bone/30 border border-forest/10 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/50 transition-colors duration-500" />

                                        {msg.image_url && (
                                            <div className="h-48 -mx-8 -mt-8 mb-6 overflow-hidden">
                                                <img
                                                    src={msg.image_url.startsWith('http') ? msg.image_url : `${API_BASE_URL}${msg.image_url}`}
                                                    alt={getTranslated(msg, 'name', i18n.language)}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </div>
                                        )}

                                        <h3 className="text-2xl font-headers text-forest mb-4 uppercase relative z-10">{getTranslated(msg, 'name', i18n.language)}</h3>
                                        <p className="text-bark/80 mb-4 leading-relaxed line-clamp-3 relative z-10">{getTranslated(msg, 'excerpt', i18n.language) || getTranslated(msg, 'description', i18n.language)}</p>
                                        {getTranslated(msg, 'benefits', i18n.language) && (
                                            <p className="text-sm italic text-matcha font-bold mb-4 line-clamp-2 relative z-10">{getTranslated(msg, 'benefits', i18n.language)}</p>
                                        )}
                                        <div className="flex justify-between items-center mt-6 border-t border-forest/5 pt-4 relative z-10">
                                            <span className="text-forest/60 text-sm font-bold">
                                                {msg.duration_min && msg.duration_min > 0 ? `${msg.duration_min} min` : ''}
                                            </span>
                                            <button className="text-forest font-bold group-hover:text-matcha transition-colors uppercase">{t('yoga.common.read_article')} →</button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-bone/20 rounded-xl">
                                <p className="text-bark/50 italic">{t('therapies.none.massages')}</p>
                            </div>
                        )}


                    </FadeInSection>
                </section>

                {/* Terapias Section */}
                <section ref={therapiesRef} className="py-32 md:py-48 bg-bone scroll-mt-24 snap-start">
                    <FadeInSection className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-headers text-forest mb-4 uppercase">{t('therapies.sections.therapies')}</h2>
                            <p className="text-bark/70 text-lg md:text-xl">{t('therapies.sections.therapies_sub')}</p>
                        </div>

                        {therapies.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {therapies.map((thr) => (
                                    <motion.div
                                        key={thr.id}
                                        whileHover={{ y: -10 }}
                                        onClick={() => setSelectedTreatment(thr)}
                                        className="group cursor-pointer p-8 rounded-3xl bg-white border border-forest/10 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-bone/20 transition-colors duration-500" />

                                        {thr.image_url && (
                                            <div className="h-48 -mx-8 -mt-8 mb-6 overflow-hidden">
                                                <img
                                                    src={thr.image_url.startsWith('http') ? thr.image_url : `${API_BASE_URL}${thr.image_url}`}
                                                    alt={getTranslated(thr, 'name', i18n.language)}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </div>
                                        )}

                                        <h3 className="text-2xl font-headers text-forest mb-4 uppercase relative z-10">{getTranslated(thr, 'name', i18n.language)}</h3>
                                        <p className="text-bark/80 mb-4 leading-relaxed line-clamp-3 relative z-10">{getTranslated(thr, 'excerpt', i18n.language) || getTranslated(thr, 'description', i18n.language)}</p>
                                        {getTranslated(thr, 'benefits', i18n.language) && (
                                            <p className="text-sm italic text-matcha font-bold mb-4 line-clamp-2 relative z-10">{getTranslated(thr, 'benefits', i18n.language)}</p>
                                        )}
                                        <div className="flex justify-between items-center mt-6 border-t border-forest/5 pt-4 relative z-10">
                                            <span className="text-forest/60 text-sm font-bold">
                                                {thr.duration_min && thr.duration_min > 0 ? `${thr.duration_min} min` : ''}
                                            </span>
                                            <button className="text-forest font-bold group-hover:text-matcha transition-colors uppercase">{t('yoga.common.read_article')} →</button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white/50 rounded-xl">
                                <p className="text-bark/50 italic">{t('therapies.none.therapies')}</p>
                            </div>
                        )}


                    </FadeInSection>
                </section>

                {/* Galería Section */}
                <section ref={galleryRef} className="py-32 md:py-48 bg-white scroll-mt-24 snap-start">
                    <FadeInSection className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-6xl font-headers text-forest mb-4 uppercase">{t('therapies.sections.gallery')}</h2>
                            <p className="text-bark/70 text-lg">{t('therapies.sections.gallery_sub')}</p>
                        </div>
                        <Suspense fallback={<SectionLoader />}>
                            {galleryImages.length > 0 ? (
                                <ImageSlider images={galleryImages}>
                                    <div className="absolute bottom-8 right-8 z-30 pointer-events-auto">
                                        <button
                                            onClick={() => navigate('/galeria/masajes-y-terapias')}
                                            className="px-8 py-3 bg-black/30 hover:bg-white backdrop-blur-md border border-white/30 rounded-full text-white hover:text-forest font-headers tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group uppercase"
                                        >
                                            {t('yoga.common.view_all_gallery')} <span className="text-xl leading-none mb-1">→</span>
                                        </button>
                                    </div>
                                </ImageSlider>
                            ) : (
                                <div className="h-64 flex items-center justify-center bg-gray-100 rounded-xl">
                                    <p className="text-gray-400">{t('therapies.none.gallery')}</p>
                                </div>
                            )}
                        </Suspense>

                    </FadeInSection>
                </section>

                {/* Blog Section */}
                <section ref={blogRef} className="py-32 md:py-48 bg-bone border-t border-forest/5 scroll-mt-24 snap-start">
                    <FadeInSection className="max-w-7xl mx-auto px-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <h2 className="text-4xl md:text-6xl font-headers text-forest mb-3 uppercase">{t('therapies.sections.blog')}</h2>
                                <p className="text-bark/70 text-lg">{t('therapies.sections.blog_sub')}</p>
                            </div>
                            <button onClick={() => navigate('/blog')} className="text-forest font-bold hover:text-matcha transition-colors text-lg uppercase">{t('yoga.common.view_all_blog')} →</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Blog Posts should also be translated preferably, but for now we keep layout */}
                            <div className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                                <div className="h-64 bg-forest/10 flex items-center justify-center">
                                    <img src={lotusFlower} alt="" className="h-20 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-8">
                                    <span className="text-xs font-bold text-matcha uppercase tracking-widest mb-2 block">Blog</span>
                                    <h3 className="text-2xl font-headers text-forest mb-3 uppercase">...</h3>
                                    <p className="text-bark/80 leading-relaxed">...</p>
                                </div>
                            </div>
                            <div className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                                <div className="h-64 bg-forest/10 flex items-center justify-center">
                                    <img src={lotusFlower} alt="" className="h-20 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-8">
                                    <span className="text-xs font-bold text-matcha uppercase tracking-widest mb-2 block">Blog</span>
                                    <h3 className="text-2xl font-headers text-forest mb-3 uppercase">...</h3>
                                    <p className="text-bark/80 leading-relaxed">...</p>
                                </div>
                            </div>
                        </div>

                    </FadeInSection>
                </section>
            </main>
            <div className="snap-start" id="footer-snap">
                <Footer />
            </div>
        </div>
    );
};

export default TherapiesPage;
