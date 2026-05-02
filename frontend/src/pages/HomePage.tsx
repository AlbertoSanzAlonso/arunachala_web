import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import videoBgWebm from 'assets/videos/VIDEOWEB.webm';
import videoPosterWebp from 'assets/videos/VIDEOWEB_poster.webp';
import omSymbol from 'assets/images/om_symbol.png';
import lotusFlower from 'assets/images/lotus_flower.png';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import FadeInSection from 'components/ui/FadeInSection';
import { API_BASE_URL } from 'config';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from 'utils/imageUtils';
import PageSEO from 'components/ui/PageSEO';

// Lazy load heavy components
const ImageSlider = lazy(() => import('components/ImageSlider'));
const ReviewsSection = lazy(() => import('components/ReviewsSection'));
const WellnessQuiz = lazy(() => import('components/wellness-quiz/WellnessQuiz'));
const FeaturedActivities = lazy(() => import('components/FeaturedActivities'));
const NewsletterForm = lazy(() => import('components/NewsletterForm'));

const HomePage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);


    const [dailyMantra, setDailyMantra] = useState<{ text_sanskrit: string, translation: string, translations?: any } | null>(null);

    useEffect(() => {
        const fetchMantra = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/mantras/daily`);
                if (response.ok) {
                    const data = await response.json();
                    setDailyMantra(data);
                }
            } catch (error) {
                console.error("Failed to load mantra:", error);
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
        const interval = setInterval(fetchGallery, 5000);
        return () => clearInterval(interval);
    }, []);




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
            "streetAddress": "Pasaje de Mateo Oliva 3",
            "addressLocality": "Cornellá de Llobregat",
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
        "description": "Centro de Yoga y Terapias en Cornellá de Llobregat. Clases de Hatha Yoga, Vinyasa y Terapias Holísticas."
    };

    return (
        <div id="home-scroll-container" ref={containerRef} className="font-body text-bark relative h-screen overflow-y-auto scroll-smooth">
            <PageSEO
                title="Arunachala Yoga y Terapias | Centro de Bienestar en Cornellá"
                description="Clases de Yoga, masajes y terapias: Centro de Yoga en Cornellá de Llobregat"
                structuredData={localBusinessSchema}
            />
            <Header />

            {/* Hero Section with Video */}
            <section className="relative min-h-[75vh] md:min-h-[90vh] w-full overflow-hidden flex flex-col items-center justify-start md:justify-center pt-6 md:pt-16" role="banner">
                <h1 className="sr-only">Arunachala Yoga y Terapias</h1>
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
                <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4 gap-6 md:gap-10 pb-32 md:pb-0 md:-translate-y-16">

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
                    {dailyMantra && (
                        <div className="text-center animate-fade-in max-w-2xl px-6 py-6 rounded-2xl bg-black/10 backdrop-blur-sm border border-bone/10 shadow-2xl hover:bg-black/20 transition-all duration-700">
                            <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-bone/60 mb-4 font-light">{t('home.mantra_title')}</p>
                            <h3 className="text-2xl md:text-4xl font-serif italic text-bone mb-3 leading-relaxed drop-shadow-md">
                                "{dailyMantra.text_sanskrit}"
                            </h3>
                            <p className="text-bone/70 text-sm md:text-base font-light italic">
                                — {
                                    (i18n.language !== 'es' &&
                                    dailyMantra.translations &&
                                    dailyMantra.translations[i18n.language]?.translation)
                                    || dailyMantra.translation
                                }
                            </p>
                        </div>
                    )}

                </div>
            </section>

            {/* Content Sections */}
            <main className="bg-bone relative z-10">
                {/* Wellness Quiz Section - Snap Start to align with Hero Border */}
                <section className="scroll-mt-24 pt-12">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center">{t('home.loading.experience')}</div>}>
                        <FadeInSection>
                            <WellnessQuiz />
                        </FadeInSection>
                    </Suspense>
                </section>

                {/* Featured Activities Section */}
                <section className="scroll-mt-24">
                    <Suspense fallback={<div className="h-32 flex items-center justify-center">{t('home.loading.activities', 'Cargando actividades...')}</div>}>
                        <FadeInSection delay={0.1}>
                            <FeaturedActivities />
                        </FadeInSection>
                    </Suspense>
                </section>

                {/* Gallery Slider - Snap Center */}
                {galleryImages.length > 0 && (
                    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-12">
                        <Suspense fallback={<div className="h-96 flex items-center justify-center">{t('home.loading.gallery')}</div>}>
                            <FadeInSection delay={0.2}>
                                <ImageSlider images={galleryImages} />
                            </FadeInSection>
                        </Suspense>
                    </section>
                )}

                {/* Reviews Section - Snap Start to ensure title visibility */}
                <section className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-12 scroll-mt-24">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center">{t('home.loading.reviews')}</div>}>
                        <FadeInSection delay={0.3}>
                            <ReviewsSection />
                        </FadeInSection>
                    </Suspense>


                </section>

                {/* Newsletter Subscription Section */}
                <section className="w-full max-w-4xl mx-auto px-4 md:px-8 mb-24">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center">{t('common.loading')}</div>}>
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
