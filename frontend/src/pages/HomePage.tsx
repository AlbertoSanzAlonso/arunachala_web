import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import videoBgWebm from 'assets/videos/hero_optimized.webm';
import videoPoster from 'assets/videos/VIDEOWEB_poster.webp';
import omSymbol from 'assets/images/om_symbol.webp';
import lotusFlower from 'assets/images/lotus_flower.webp';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import FadeInSection from 'components/ui/FadeInSection';
import { API_BASE_URL } from 'config';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from 'utils/imageUtils';
import PageSEO from 'components/providers/PageSEO';
import { BUSINESS, businessPostalAddress } from 'config/business';

const ImageSlider = lazy(() => import('components/sections/ImageSlider'));
const ReviewsSection = lazy(() => import('components/sections/ReviewsSection'));
const WellnessQuiz = lazy(() => import('components/wellness-quiz/WellnessQuiz'));
const FeaturedActivities = lazy(() => import('components/sections/FeaturedActivities'));
const BlogSection = lazy(() => import('components/sections/BlogSection'));
const NewsletterForm = lazy(() => import('components/NewsletterForm'));

const heroEase = [0.22, 1, 0.36, 1] as const;

const heroContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.14,
            delayChildren: 0.18,
        },
    },
};

const heroItemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.85, ease: heroEase },
    },
};

const HomePage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [videoReady, setVideoReady] = useState(false);
    const [loadHeroVideo, setLoadHeroVideo] = useState(false);
    const [dailyMantra, setDailyMantra] = useState<{ text_sanskrit: string, translation: string, translations?: any } | null>(null);
    const [mantraStatus, setMantraStatus] = useState<'loading' | 'ready' | 'empty'>('loading');

    useEffect(() => {
        const fetchMantra = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/mantras/daily`);
                if (response.ok) {
                    const data = await response.json();
                    if (data?.text_sanskrit) {
                        setDailyMantra(data);
                        setMantraStatus('ready');
                        return;
                    }
                }
                setMantraStatus('empty');
            } catch (error) {
                console.error("Failed to load mantra:", error);
                setMantraStatus('empty');
            }
        };

        const fetchGallery = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/gallery/?category=home`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        const urls = data.map((img: any) => getImageUrl(img.url));
                        setGalleryImages(urls);
                    }
                }
            } catch (error) {
                console.error("Failed to load gallery:", error);
            }
        };

        fetchMantra();
        fetchGallery();
    }, []);

    // Diferir el webm (~3.5MB) para no competir con FCP/LCP en móvil
    useEffect(() => {
        const startVideo = () => setLoadHeroVideo(true);
        const win = window as Window & {
            requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
            cancelIdleCallback?: (id: number) => void;
        };

        if (typeof win.requestIdleCallback === 'function') {
            const id = win.requestIdleCallback(startVideo, { timeout: 1800 });
            return () => win.cancelIdleCallback?.(id);
        }

        const timer = window.setTimeout(startVideo, 900);
        return () => window.clearTimeout(timer);
    }, []);



    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": "YogaStudio",
        "name": BUSINESS.name,
        "alternateName": ["Arunachala Yoga y Terapias", "Arunachala", "Yoga y Terapias Arunachala"],
        "image": "https://www.yogayterapiasarunachala.es/logo_wide.webp",
        "logo": {
            "@type": "ImageObject",
            "url": "https://www.yogayterapiasarunachala.es/favicon-96x96.png",
            "width": 96,
            "height": 96
        },
        "@id": "https://www.yogayterapiasarunachala.es",
        "url": "https://www.yogayterapiasarunachala.es",
        "telephone": BUSINESS.phoneTel,
        "email": BUSINESS.email,
        "address": businessPostalAddress,
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 41.3533,
            "longitude": 2.0728
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "21:00"
            }
        ],
        "sameAs": [
            "https://www.instagram.com/yogayterapiasarunachala/",
            "https://www.youtube.com/@yogayterapiasarunachala2252"
        ],
        "description": "Centro de yoga y terapias en Cornellà de Llobregat. Clases de hatha yoga, masajes y terapias holísticas."
    };

    return (
        <div id="home-scroll-container" ref={containerRef} className="font-body text-bark relative h-full overflow-y-auto scroll-smooth">
            <PageSEO
                title="Centro de Bienestar en Cornellà"
                description="Aruṇāchala Yoga y Terapias, centro de Susana Pérez Gil en Pasaje de Mateo Oliva 3, bajos, 08940 Cornellà de Llobregat. Clases de hatha yoga, masajes y terapias con cita previa. Teléfono +34 678 481 971."
                structuredData={localBusinessSchema}
            />
            <Header />

            {/* Hero Section with Video */}
            <section className="relative min-h-[75vh] short:min-h-[calc(100vh-3.5rem)] md:min-h-[90vh] short:md:min-h-[calc(100vh-3.5rem)] w-full overflow-hidden flex flex-col items-center justify-start short:justify-center md:justify-center pt-6 short:pt-0 md:pt-16 short:md:pt-0 bg-black" role="banner">
                <img
                    src={videoPoster}
                    alt=""
                    aria-hidden="true"
                    fetchPriority="high"
                    decoding="async"
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-out ${videoReady ? 'opacity-0' : 'opacity-100'}`}
                />
                {loadHeroVideo && (
                    <video
                        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-out ${videoReady ? 'opacity-100' : 'opacity-0'}`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        poster={videoPoster}
                        onLoadedData={() => setVideoReady(true)}
                        onCanPlay={() => setVideoReady(true)}
                    >
                        <source src={videoBgWebm} type="video/webm" />
                    </video>
                )}
                {/* Overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>

                {/* Main Content Container */}
                <div className="relative z-40 flex flex-col items-center w-full max-w-4xl short:max-w-5xl px-4 gap-6 short:gap-5 md:gap-10 short:md:gap-6 pb-32 short:pb-0 md:pb-0 md:-translate-y-16 short:md:translate-y-0">
                    <h1 className="sr-only">{t('answers.home.question')}</h1>
                    <p className="sr-only">{t('answers.home.answer')}</p>

                    {/* Navigation Buttons */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 short:gap-4 md:gap-12 short:md:gap-8 w-full text-center"
                        initial="hidden"
                        animate="visible"
                        variants={heroContainerVariants}
                    >
                        <motion.div variants={heroItemVariants}>
                            <Link
                                to="/clases-de-yoga"
                                className="group cursor-pointer p-6 short:p-4 md:p-8 short:md:p-5 border-2 border-transparent hover:border-bone/50 rounded-xl transition-all duration-500 bg-black/20 hover:bg-black/40 backdrop-blur-sm flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-bone/50"
                            >
                                <img src={omSymbol} alt="" aria-hidden="true" width={80} height={80} decoding="async" className="h-14 short:h-10 md:h-20 short:md:h-12 w-auto mb-3 short:mb-2 md:mb-4 short:md:mb-2.5 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-lg" />
                                <h2 className="text-3xl short:text-2xl md:text-5xl short:md:text-3xl font-headers text-bone mb-2 short:mb-1.5 md:mb-4 short:md:mb-2 group-hover:scale-110 transition-transform duration-500 uppercase">{t('hero.yoga.title')}</h2>
                                <p className="text-bone/80 text-base short:text-sm md:text-lg short:md:text-base opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                                    {t('hero.yoga.subtitle')}
                                </p>
                            </Link>
                        </motion.div>

                        <motion.div variants={heroItemVariants}>
                            <Link
                                to="/terapias-y-masajes/"
                                className="group cursor-pointer p-6 short:p-4 md:p-8 short:md:p-5 border-2 border-transparent hover:border-bone/50 rounded-xl transition-all duration-500 bg-black/20 hover:bg-black/40 backdrop-blur-sm flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-bone/50"
                            >
                                <img src={lotusFlower} alt="" aria-hidden="true" width={80} height={60} decoding="async" className="h-14 short:h-10 md:h-20 short:md:h-12 w-auto mb-3 short:mb-2 md:mb-4 short:md:mb-2.5 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-lg" />
                                <h2 className="text-3xl short:text-2xl md:text-5xl short:md:text-3xl font-headers text-bone mb-2 short:mb-1.5 md:mb-4 short:md:mb-2 group-hover:scale-110 transition-transform duration-500 uppercase">{t('hero.therapies.title')}</h2>
                                <p className="text-bone/80 text-base short:text-sm md:text-lg short:md:text-base opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                                    {t('hero.therapies.subtitle')}
                                </p>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Mantra slot: reserved from first paint so the hero does not jump */}
                    <AnimatePresence initial={false}>
                        {mantraStatus !== 'empty' && (
                            <motion.div
                                key="mantra-slot"
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0, transition: { duration: 0.55, ease: heroEase } }}
                                transition={{ duration: 0.85, ease: heroEase, delay: 0.35 }}
                                className="w-full max-w-2xl short:max-w-3xl overflow-hidden"
                            >
                                <div className="min-h-[9.5rem] short:min-h-[7.75rem] md:min-h-[11.5rem] short:md:min-h-[8.5rem] flex items-center justify-center">
                                    {dailyMantra ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.9, ease: heroEase }}
                                            className="w-full text-center px-6 short:px-5 py-6 short:py-4 rounded-2xl bg-black/10 backdrop-blur-sm border border-bone/10 shadow-2xl hover:bg-black/20 transition-colors duration-700"
                                        >
                                            <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-bone/60 mb-4 short:mb-2.5 font-light">{t('home.mantra_title')}</p>
                                            <h3 className="text-2xl short:text-xl md:text-4xl short:md:text-2xl font-serif italic text-bone mb-3 short:mb-2 leading-relaxed drop-shadow-md">
                                                "{dailyMantra.text_sanskrit}"
                                            </h3>
                                            <p className="text-bone/70 text-sm short:text-sm md:text-base font-light italic">
                                                — {
                                                    (i18n.language !== 'es' &&
                                                    dailyMantra.translations &&
                                                    dailyMantra.translations[i18n.language]?.translation)
                                                    || dailyMantra.translation
                                                }
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <div
                                            className="w-full px-6 short:px-5 py-6 short:py-4 rounded-2xl border border-bone/5 bg-black/5 animate-pulse"
                                            aria-hidden="true"
                                        >
                                            <div className="mx-auto mb-4 short:mb-2.5 h-3 w-28 rounded bg-bone/10" />
                                            <div className="mx-auto mb-3 short:mb-2 h-7 short:h-6 md:h-9 max-w-md w-[80%] rounded bg-bone/10" />
                                            <div className="mx-auto h-4 w-48 rounded bg-bone/10" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </section>

            {/* Content Sections */}
            <main className="relative z-10">
                {/* Wellness Quiz Section - Snap Start to align with Hero Border */}
                <section className="scroll-mt-24 pt-12">
                    <Suspense fallback={<div className="h-64 animate-pulse bg-bone" aria-hidden="true" />}>
                        <FadeInSection>
                            <WellnessQuiz />
                        </FadeInSection>
                    </Suspense>
                </section>

                {/* Featured Activities Section */}
                <section className="scroll-mt-24">
                    <Suspense fallback={<div className="h-32 animate-pulse bg-bone" aria-hidden="true" />}>
                        <FadeInSection delay={0.1}>
                            <FeaturedActivities />
                        </FadeInSection>
                    </Suspense>
                </section>

                {/* Latest Blog Articles — crawlable links for Google */}
                <section className="scroll-mt-24">
                    <Suspense fallback={<div className="h-64 animate-pulse bg-bone" aria-hidden="true" />}>
                        <FadeInSection delay={0.15}>
                            <BlogSection limit={4} isSlider={false} showViewAll={true} />
                        </FadeInSection>
                    </Suspense>
                </section>

                {/* Gallery Slider - Snap Center */}
                {galleryImages.length > 0 && (
                    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-12">
                        <Suspense fallback={<div className="h-96 animate-pulse bg-bone" aria-hidden="true" />}>
                            <FadeInSection delay={0.2}>
                                <ImageSlider images={galleryImages} />
                            </FadeInSection>
                        </Suspense>
                    </section>
                )}

                {/* Reviews Section - Snap Start to ensure title visibility */}
                <section className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-12 scroll-mt-24">
                    <Suspense fallback={<div className="h-64 animate-pulse bg-bone" aria-hidden="true" />}>
                        <FadeInSection delay={0.3}>
                            <ReviewsSection />
                        </FadeInSection>
                    </Suspense>


                </section>

                {/* Newsletter Subscription Section */}
                <section className="w-full max-w-4xl mx-auto px-4 md:px-8 mb-24">
                    <Suspense fallback={<div className="h-64 animate-pulse bg-bone" aria-hidden="true" />}>
                        <FadeInSection delay={0.4}>
                            <NewsletterForm />
                        </FadeInSection>
                    </Suspense>
                </section>
            </main>

            <div>
                <Footer />
            </div>
        </div>
    );
};

export default HomePage;
