import React, { useRef, useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import FadeInSection from '../components/FadeInSection';
import yogaHero from '../assets/images/yoga_hero.webp';
import { API_BASE_URL } from '../config';
import BlogSection from '../components/BlogSection';
import { getImageUrl } from '../utils/imageUtils';
import PageSEO from '../components/PageSEO';

// Lazy load heavy components for performance
const YogaSchedule = lazy(() => import('../components/YogaSchedule'));
const ImageSlider = lazy(() => import('../components/ImageSlider'));

const YogaPage: React.FC = () => {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const scheduleRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const blogRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [customHero, setCustomHero] = useState<string | null>(null);
    const [hasWeekendActivities, setHasWeekendActivities] = useState(false);

    useEffect(() => {
        const fetchWeekend = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/activities?active_only=true`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        const weekend = data.filter((a: any) => {
                            if (!a.start_date) return false;
                            const d = new Date(a.start_date);
                            const day = d.getDay();
                            return (day === 0 || day === 6) && ['taller', 'evento', 'retiro'].includes(a.type);
                        });
                        setHasWeekendActivities(weekend.length > 0);
                    } else {
                        // Check if fallback is active (based on YogaSchedule logic)
                        setHasWeekendActivities(true);
                    }
                } else {
                    setHasWeekendActivities(true); // Fallback to mocks
                }
            } catch (e) {
                setHasWeekendActivities(true); // Fallback to mocks
            }
        };
        fetchWeekend();
    }, []);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/site-config/yoga_hero_image`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.value) setCustomHero(data.value);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/gallery/?category=yoga`);
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

        fetchGallery();
        const interval = setInterval(fetchGallery, 30000);
        return () => clearInterval(interval);
    }, []);

    const scrollToSchedule = () => scheduleRef.current?.scrollIntoView({ behavior: 'smooth' });
    const scrollToBlog = () => blogRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            setShowBackToTop(container.scrollTop > 500);
        };
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const SectionLoader = () => (
        <div className="w-full h-96 flex items-center justify-center bg-bone/20 rounded-xl animate-pulse">
            <div className="text-forest/40 font-headers text-xl">{t('home.loading.experience')}</div>
        </div>
    );

    return (
        <div ref={containerRef} className="font-body text-bark h-screen overflow-y-auto flex flex-col relative scroll-smooth">
            <PageSEO
                title={t('yoga.seo.title')}
                description={t('yoga.seo.description')}
                canonical="https://www.yogayterapiasarunachala.es/clases-de-yoga"
            />

            <Header />

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
                <div id="top" className="relative w-full min-h-[85vh] md:min-h-[90vh] flex items-center justify-center relative" role="banner">
                    <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${customHero ? getImageUrl(customHero) : yogaHero})` }} aria-hidden="true">
                        <div className="absolute inset-0 bg-black/50" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto w-full pt-36 pb-32 md:pt-48 md:pb-24">
                        <div className="self-start md:absolute md:top-44 md:left-10 w-full md:w-auto mb-4 md:mb-0">
                            <BackButton className="text-white hover:text-matcha transition-colors" label={t('common.back_home')} />
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-6xl md:text-9xl font-headers text-white mb-6 md:mb-8 tracking-wide drop-shadow-lg mt-8 md:mt-32 uppercase"
                        >
                            {t('yoga.title')}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg md:text-2xl text-white/95 mb-10 md:mb-12 max-w-xl md:max-w-3xl font-light leading-relaxed px-4"
                        >
                            {t('yoga.subtitle')}
                        </motion.p>

                        <nav className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-md md:max-w-4xl px-2">
                            {[
                                { title: t('yoga.buttons.schedule'), sub: t('yoga.buttons.schedule_sub'), action: scrollToSchedule, delay: 0.4 },
                                { title: t('yoga.buttons.gallery'), sub: t('yoga.buttons.gallery_sub'), action: () => galleryRef.current?.scrollIntoView({ behavior: 'smooth' }), delay: 0.5 },
                                { title: t('yoga.buttons.blog'), sub: t('yoga.buttons.blog_sub'), action: scrollToBlog, delay: 0.6 }
                            ].map((btn, idx) => (
                                <motion.button
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: btn.delay }}
                                    onClick={btn.action}
                                    className="group h-32 md:h-64 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-300 w-full"
                                >
                                    <span className="text-2xl md:text-3xl font-headers text-white mb-1 md:mb-2 group-hover:text-matcha transition-colors uppercase">{btn.title}</span>
                                    <span className="text-white/80 text-xs md:text-base opacity-95 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {btn.sub}
                                    </span>
                                </motion.button>
                            ))}
                        </nav>
                    </div>
                </div>

                <section ref={scheduleRef} className="bg-white py-8 md:py-16 scroll-mt-24 relative">
                    <FadeInSection className="max-w-7xl mx-auto px-4 md:px-8">
                        <Suspense fallback={<SectionLoader />}>
                            <YogaSchedule onlyWeekly />
                        </Suspense>
                    </FadeInSection>
                </section>

                {hasWeekendActivities && (
                    <section className="bg-white py-8 md:py-16 scroll-mt-24 relative border-t border-forest/5">
                        <FadeInSection className="max-w-7xl mx-auto px-4 md:px-8">
                            <Suspense fallback={<SectionLoader />}>
                                <YogaSchedule onlyWeekend />
                            </Suspense>
                        </FadeInSection>
                    </section>
                )}

                <section ref={galleryRef} className="w-full max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-48 scroll-mt-24">
                    <FadeInSection>
                        <h2 className="text-3xl md:text-5xl font-headers text-forest mb-12 text-center uppercase tracking-tight">{t('yoga.sections.gallery')}</h2>
                        <Suspense fallback={<SectionLoader />}>
                            {galleryImages.length > 0 ? (
                                <ImageSlider images={galleryImages}>
                                    <div className="absolute bottom-5 right-5 md:bottom-8 md:right-8 pointer-events-auto z-30">
                                        <button
                                            onClick={() => navigate('/galeria/clases-de-yoga')}
                                            className="px-6 py-2 md:px-8 md:py-3 bg-black/30 hover:bg-white backdrop-blur-md border border-white/30 rounded-full text-white hover:text-forest font-headers tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 group text-sm md:text-base uppercase"
                                        >
                                            {t('yoga.common.view_all_gallery')} <span className="text-xl leading-none mb-1">→</span>
                                        </button>
                                    </div>
                                </ImageSlider>
                            ) : (
                                <div className="h-64 flex items-center justify-center bg-bone/30 rounded-xl">
                                    <p className="text-bark/40 font-headers text-xl animate-pulse">{t('home.loading.gallery')}</p>
                                </div>
                            )}
                        </Suspense>

                    </FadeInSection>
                </section>


                {/* Blog Section */}
                <section ref={blogRef} className="scroll-mt-24">
                    <BlogSection
                        category="yoga"
                        limit={6}
                        showViewAll={true}
                        viewAllUrl="/blog/yoga"
                        title={t('yoga.blog.title', 'Blog de Yoga')}
                        subtitle={t('yoga.blog.subtitle', 'Artículos, consejos y reflexiones sobre la práctica del yoga')}
                    />
                </section>
            </main>
            <div id="footer-snap">
                <Footer />
            </div>
        </div>
    );
};

export default YogaPage;
