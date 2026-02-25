import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import videoBgWebm from '../assets/videos/VIDEOWEB.webm';
import videoPosterWebp from '../assets/videos/VIDEOWEB_poster.webp';
import yogaImg from '../assets/images/gallery/yoga_sample.webp';
import therapyImg from '../assets/images/gallery/therapy_sample.webp';
import gardenImg from '../assets/images/gallery/garden_sample.webp';
import omSymbol from '../assets/images/om_symbol.png';
import lotusFlower from '../assets/images/lotus_flower.png';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FadeInSection from '../components/FadeInSection';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../utils/imageUtils';
import PageSEO from '../components/PageSEO';

// Lazy load heavy components
const ImageSlider = lazy(() => import('../components/ImageSlider'));
const ReviewsSection = lazy(() => import('../components/ReviewsSection'));
const WellnessQuiz = lazy(() => import('../components/WellnessQuiz'));
const FeaturedActivities = lazy(() => import('../components/FeaturedActivities'));
const NewsletterForm = lazy(() => import('../components/NewsletterForm'));

const HomePage: React.FC = () => {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [galleryImages, setGalleryImages] = useState<string[]>([yogaImg, therapyImg, gardenImg]);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const getDailyMantra = () => {
        const mantras = t('home.mantras', { returnObjects: true }) as any[];
        if (!mantras || mantras.length === 0) return { text: "Om", translation: "Universal Sound" };
        const today = new Date();
        const index = (today.getDate() + today.getMonth()) % mantras.length;
        return mantras[index];
    };

    const dailyMantra = getDailyMantra();

    useEffect(() => {
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

        fetchGallery();
        const interval = setInterval(fetchGallery, 5000);
        return () => clearInterval(interval);
    }, []);

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

    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": "YogaStudio",
        "name": "Arunachala Yoga y Terapias",
        "image": "https://www.yogayterapiasarunachala.es/logo_wide.webp",
        "@id": "https://www.yogayterapiasarunachala.es",
        "url": "https://www.yogayterapiasarunachala.es",
        "telephone": "+34678481971",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Pasaje de Mateu Oliva 3",
            "addressLocality": "Cornellà de Llobregat",
            "postalCode": "08940",
            "addressRegion": "Barcelona",
            "addressCountry": "ES"
        },
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
        "description": "Centro de Yoga y Terapias en Cornellà de Llobregat. Clases de Hatha Yoga, Vinyasa y Terapias Holísticas."
    };

    return (
        <div id="home-scroll-container" ref={containerRef} className="font-body text-bark relative h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
            <PageSEO
                title="Arunachala Yoga y Terapias | Centro de Bienestar en Cornellà"
                description="Clases de Yoga, masajes y terapias: Centro de Yoga en Cornellá de Llobregat"
                structuredData={localBusinessSchema}
            />
            <Header />

            {/* Floating Back to Top Button */}
            <AnimatePresence>
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
            </AnimatePresence>

            {/* Hero Section with Video */}
            <section className="relative min-h-[85vh] md:min-h-screen w-full overflow-hidden flex items-center justify-center snap-center snap-always">
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-85"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={videoPosterWebp}
                >
                    <source src={videoBgWebm} type="video/webm" />
                    Your browser does not support the video tag.
                </video>
                {/* Overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>

                {/* Main Content Container */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-4 gap-6 md:gap-16 pt-40 pb-32 md:pt-24 md:pb-0">

                    {/* Navigation Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 w-full text-center">
                        <Link
                            to="/clases-de-yoga"
                            className="group cursor-pointer p-6 md:p-8 border-2 border-transparent hover:border-bone/50 rounded-xl transition-all duration-500 bg-black/20 hover:bg-black/40 backdrop-blur-sm flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-bone/50"
                        >
                            <img src={omSymbol} alt="" aria-hidden="true" className="h-14 md:h-20 w-auto mb-3 md:mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-lg" />
                            <h2 className="text-3xl md:text-5xl font-headers text-bone mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-500 uppercase">{t('hero.yoga.title')}</h2>
                            <p className="text-bone/80 text-base md:text-lg opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                                {t('hero.yoga.subtitle')}
                            </p>
                        </Link>

                        <Link
                            to="/terapias-y-masajes"
                            className="group cursor-pointer p-6 md:p-8 border-2 border-transparent hover:border-bone/50 rounded-xl transition-all duration-500 bg-black/20 hover:bg-black/40 backdrop-blur-sm flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-bone/50"
                        >
                            <img src={lotusFlower} alt="" aria-hidden="true" className="h-14 md:h-20 w-auto mb-3 md:mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-lg" />
                            <h2 className="text-3xl md:text-5xl font-headers text-bone mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-500 uppercase">{t('hero.therapies.title')}</h2>
                            <p className="text-bone/80 text-base md:text-lg opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                                {t('hero.therapies.subtitle')}
                            </p>
                        </Link>
                    </div>

                    {/* Mantra of the Day Section */}
                    <div className="text-center animate-fade-in max-w-2xl px-6 py-6 rounded-2xl bg-black/10 backdrop-blur-sm border border-bone/10 shadow-2xl hover:bg-black/20 transition-all duration-700">
                        <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-bone/60 mb-4 font-light">{t('home.mantra_title')}</p>
                        <h3 className="text-2xl md:text-4xl font-serif italic text-bone mb-3 leading-relaxed drop-shadow-md">
                            "{dailyMantra.text}"
                        </h3>
                        <p className="text-bone/70 text-sm md:text-base font-light italic">
                            — {dailyMantra.translation}
                        </p>
                    </div>

                </div>
            </section>

            {/* Content Sections */}
            <main className="bg-bone relative z-10">
                {/* Wellness Quiz Section - Snap Start to align with Hero Border */}
                <section className="snap-center snap-always scroll-mt-24 pt-12">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center">{t('home.loading.experience')}</div>}>
                        <FadeInSection>
                            <WellnessQuiz />
                        </FadeInSection>
                    </Suspense>
                </section>

                {/* Featured Activities Section */}
                <section className="snap-center snap-always scroll-mt-24">
                    <Suspense fallback={<div className="h-32 flex items-center justify-center">{t('home.loading.activities', 'Cargando actividades...')}</div>}>
                        <FadeInSection delay={0.1}>
                            <FeaturedActivities />
                        </FadeInSection>
                    </Suspense>
                </section>

                {/* Gallery Slider - Snap Center */}
                <section className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-12 snap-center snap-always">
                    <Suspense fallback={<div className="h-96 flex items-center justify-center">{t('home.loading.gallery')}</div>}>
                        <FadeInSection delay={0.2}>
                            <ImageSlider images={galleryImages} />
                        </FadeInSection>
                    </Suspense>
                </section>

                {/* Reviews Section - Snap Start to ensure title visibility */}
                <section className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-12 snap-center snap-always scroll-mt-24">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center">{t('home.loading.reviews')}</div>}>
                        <FadeInSection delay={0.3}>
                            <ReviewsSection />
                        </FadeInSection>
                    </Suspense>


                </section>

                {/* Newsletter Subscription Section */}
                <section className="w-full max-w-4xl mx-auto px-4 md:px-8 mb-24 snap-center snap-always">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center">{t('common.loading')}</div>}>
                        <FadeInSection delay={0.4}>
                            <NewsletterForm />
                        </FadeInSection>
                    </Suspense>
                </section>
            </main>

            <div className="snap-center snap-always">
                <Footer />
            </div>
        </div>
    );
};

export default HomePage;
