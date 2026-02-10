import React, { useRef, useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import FadeInSection from '../components/FadeInSection';
import therapyHero from '../assets/images/massage_hero.webp';
import lotusFlower from '../assets/images/lotus_flower.png';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';
import BlogSection from '../components/BlogSection';



interface Treatment {
    id: number;
    name: string;
    excerpt: string;
    description: string;
    duration_min: number;
    price?: string;
    image_url: string | null;
    translations?: any;
}

const TherapiesPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const massagesRef = useRef<HTMLDivElement>(null);
    const therapiesRef = useRef<HTMLDivElement>(null);
    const blogRef = useRef<HTMLDivElement>(null);
    const appointmentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Data State
    const [massages, setMassages] = useState<Treatment[]>([]);
    const [therapies, setTherapies] = useState<Treatment[]>([]);
    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Removed gallery fetch logic

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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col md:flex-row relative"
                        >
                            <button
                                onClick={() => setSelectedTreatment(null)}
                                className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-forest hover:text-white transition-colors z-10"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>

                            <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-100 flex-shrink-0 relative overflow-hidden">
                                {selectedTreatment.image_url ? (
                                    <img
                                        src={selectedTreatment.image_url.startsWith('http') ? selectedTreatment.image_url : `${API_BASE_URL}${selectedTreatment.image_url}`}
                                        alt={getTranslated(selectedTreatment, 'name', i18n.language)}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            // Prevent infinite loop if fallback also fails
                                            if (target.src !== lotusFlower) {
                                                target.onerror = null; // Stop further error handling to "keep broken link" if fallback fails? 
                                                // Actually user wants: if backup breaks, keep broken link of selected photo. 
                                                // If I set src to lotusFlower and it fails, it shows broken lotusFlower.
                                                // To show broken *original*, I'd have to revert. 
                                                // But let's stick to standard fallback first: switch to lotusFlower.
                                                target.src = lotusFlower;
                                                // The image style might need adjustment for the fallback (e.g. opacity, object-contain) 
                                                // but for the modal, object-cover is fine or maybe contain.
                                                target.className = "w-full h-full object-contain p-12 opacity-20";
                                                // Note: changing class to match the 'no image' look
                                            }
                                        }}
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
                                <h3 className="text-3xl md:text-4xl font-headers text-forest mb-2 uppercase">
                                    {getTranslated(selectedTreatment, 'name', i18n.language)}
                                </h3>
                                {selectedTreatment.price && (
                                    <div className="mb-6">
                                        <h4 className="text-lg font-bold text-forest uppercase tracking-wide mb-2">{t('therapies.modal.price')}</h4>
                                        <p className="text-2xl font-sans text-matcha font-bold">
                                            {selectedTreatment.price}
                                        </p>
                                    </div>
                                )}

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


                                <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
                                    <button
                                        onClick={() => {
                                            setSelectedTreatment(null);
                                            navigate('/contacto');
                                        }}
                                        className="w-full sm:w-auto px-8 py-3 bg-forest text-white font-bold rounded-full hover:bg-matcha transition-colors uppercase tracking-widest shadow-lg"
                                    >
                                        {t('therapies.appointment.cta', 'Contactar para reservar')}
                                    </button>
                                    <button
                                        onClick={() => setSelectedTreatment(null)}
                                        className="text-sm font-bold text-forest hover:text-matcha uppercase tracking-widest transition-colors py-2"
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
            {
                showBackToTop && (
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
                )
            }

            <main className="flex-grow bg-bone">
                {/* Hero Section */}
                <div className="relative w-full min-h-[100vh] md:min-h-0 md:h-[90vh] flex items-center justify-center overflow-hidden snap-start">
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${therapyHero})` }}
                    >
                        <div className="absolute inset-0 bg-black/50" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto w-full h-full pt-36 pb-32 md:pt-28 md:pb-0">
                        <div className="self-start md:absolute md:top-32 md:left-10 w-full md:w-auto mb-4 md:mb-0 text-white">
                            <BackButton className="text-white hover:text-matcha transition-colors" label={t('common.back_home')} />
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-8xl font-headers text-white mb-6 md:mb-6 tracking-wide drop-shadow-lg md:mt-32 uppercase"
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
                                { name: t('therapies.appointment.title'), ref: appointmentRef, delay: 0.6 },
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
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    {massages.slice(0, 3).map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            whileHover={{ y: -10 }}
                                            onClick={() => setSelectedTreatment(msg)}
                                            className="group cursor-pointer p-8 rounded-3xl bg-bone/30 border border-forest/10 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/50 transition-colors duration-500" />

                                            <div className="h-48 -mx-8 -mt-8 mb-6 overflow-hidden flex items-center justify-center bg-forest/5">
                                                {msg.image_url ? (
                                                    <img
                                                        src={msg.image_url.startsWith('http') ? msg.image_url : `${API_BASE_URL}${msg.image_url}`}
                                                        alt={getTranslated(msg, 'name', i18n.language)}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        onError={(e) => {
                                                            const target = e.currentTarget;
                                                            if (target.src !== lotusFlower) {
                                                                target.src = lotusFlower;
                                                                target.className = "w-24 h-24 object-contain opacity-20 group-hover:scale-110 transition-transform duration-500 m-auto";
                                                                target.parentElement?.classList.add("flex", "items-center", "justify-center", "bg-forest/5");
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <img src={lotusFlower} alt="Detalle" className="w-24 h-24 object-contain opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                                )}
                                            </div>

                                            <h3 className="text-2xl font-headers text-forest mb-4 uppercase relative z-10">{getTranslated(msg, 'name', i18n.language)}</h3>
                                            <p className="text-bark/80 mb-4 leading-relaxed line-clamp-3 relative z-10">{getTranslated(msg, 'excerpt', i18n.language) || getTranslated(msg, 'description', i18n.language)}</p>
                                            {getTranslated(msg, 'benefits', i18n.language) && (
                                                <p className="text-sm italic text-matcha font-bold mb-4 line-clamp-2 relative z-10">{getTranslated(msg, 'benefits', i18n.language)}</p>
                                            )}
                                            <div className="flex justify-between items-center mt-6 border-t border-forest/5 pt-4 relative z-10">
                                                <span className="text-forest/60 text-sm font-bold">
                                                    {msg.duration_min && msg.duration_min > 0 ? `${msg.duration_min} min` : ''}
                                                </span>
                                                <button className="text-forest font-bold group-hover:text-matcha transition-colors uppercase">{t('therapies.common.read_more')} →</button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {massages.length > 3 && (
                                    <div className="text-center mt-12">
                                        <button
                                            onClick={() => navigate('/terapias/masajes')}
                                            className="px-8 py-4 bg-forest hover:bg-matcha text-white font-headers tracking-wide rounded-full transition-all duration-300 shadow-lg hover:shadow-xl uppercase text-lg"
                                        >
                                            {t('common.view_all')}
                                        </button>
                                    </div>
                                )}
                            </>
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
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    {therapies.slice(0, 3).map((thr) => (
                                        <motion.div
                                            key={thr.id}
                                            whileHover={{ y: -10 }}
                                            onClick={() => setSelectedTreatment(thr)}
                                            className="group cursor-pointer p-8 rounded-3xl bg-white border border-forest/10 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/0 group-hover:bg-bone/20 transition-colors duration-500" />

                                            <div className="h-48 -mx-8 -mt-8 mb-6 overflow-hidden flex items-center justify-center bg-forest/5">
                                                {thr.image_url ? (
                                                    <img
                                                        src={thr.image_url.startsWith('http') ? thr.image_url : `${API_BASE_URL}${thr.image_url}`}
                                                        alt={getTranslated(thr, 'name', i18n.language)}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        onError={(e) => {
                                                            const target = e.currentTarget;
                                                            if (target.src !== lotusFlower) {
                                                                target.src = lotusFlower;
                                                                target.className = "w-24 h-24 object-contain opacity-20 group-hover:scale-110 transition-transform duration-500 m-auto";
                                                                target.parentElement?.classList.add("flex", "items-center", "justify-center", "bg-forest/5");
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <img src={lotusFlower} alt="Detalle" className="w-24 h-24 object-contain opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                                )}
                                            </div>

                                            <h3 className="text-2xl font-headers text-forest mb-4 uppercase relative z-10">{getTranslated(thr, 'name', i18n.language)}</h3>
                                            <p className="text-bark/80 mb-4 leading-relaxed line-clamp-3 relative z-10">{getTranslated(thr, 'excerpt', i18n.language) || getTranslated(thr, 'description', i18n.language)}</p>
                                            {getTranslated(thr, 'benefits', i18n.language) && (
                                                <p className="text-sm italic text-matcha font-bold mb-4 line-clamp-2 relative z-10">{getTranslated(thr, 'benefits', i18n.language)}</p>
                                            )}
                                            <div className="flex justify-between items-center mt-6 border-t border-forest/5 pt-4 relative z-10">
                                                <span className="text-forest/60 text-sm font-bold">
                                                    {thr.duration_min && thr.duration_min > 0 ? `${thr.duration_min} min` : ''}
                                                </span>
                                                <button className="text-forest font-bold group-hover:text-matcha transition-colors uppercase">{t('therapies.common.read_more')} →</button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {therapies.length > 3 && (
                                    <div className="text-center mt-12">
                                        <button
                                            onClick={() => navigate('/terapias/terapias-holisticas')}
                                            className="px-8 py-4 bg-forest hover:bg-matcha text-white font-headers tracking-wide rounded-full transition-all duration-300 shadow-lg hover:shadow-xl uppercase text-lg"
                                        >
                                            {t('common.view_all')}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 bg-white/50 rounded-xl">
                                <p className="text-bark/50 italic">{t('therapies.none.therapies')}</p>
                            </div>
                        )}


                    </FadeInSection>
                </section>

                {/* Appointment Section */}
                <section ref={appointmentRef} className="py-24 md:py-32 bg-forest text-bone snap-start relative overflow-hidden scroll-mt-24">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-matcha/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-32 -mb-32 blur-2xl" />

                    <FadeInSection className="max-w-4xl mx-auto px-8 relative z-10">
                        <div className="bg-white/10 backdrop-blur-md rounded-[3rem] p-8 md:p-16 border border-white/20 shadow-2xl text-center">
                            <div className="inline-block p-4 bg-matcha/20 rounded-2xl mb-8">
                                <CalendarDaysIcon className="w-10 h-10 text-matcha" />
                            </div>

                            <h2 className="text-3xl md:text-5xl font-headers mb-6 uppercase tracking-wider">
                                {t('therapies.appointment.title')}
                            </h2>

                            <div className="w-20 h-1 bg-matcha/50 mx-auto mb-8 rounded-full" />

                            <h3 className="text-xl md:text-2xl font-light mb-6 text-matcha">
                                {t('therapies.appointment.subtitle')}
                            </h3>

                            <p className="text-lg md:text-xl leading-relaxed mb-12 text-bone/80 font-light">
                                {t('therapies.appointment.description')}
                            </p>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/contacto')}
                                    className="px-10 py-5 bg-matcha hover:bg-bone hover:text-forest text-forest font-bold rounded-full transition-all duration-300 shadow-xl flex items-center gap-3 uppercase tracking-widest"
                                >
                                    {t('therapies.appointment.cta')}
                                </motion.button>

                                <div className="flex items-center gap-2 text-bone/60 italic">
                                    <ClockIcon className="w-5 h-5" />
                                    <span>{t('therapies.modal.close').toLowerCase() === 'cerrar' ? 'Respuesta rápida por WhatsApp' : 'Quick response via WhatsApp'}</span>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </section>



                {/* Blog Section */}
                <section ref={blogRef} className="scroll-mt-24 snap-start">
                    <BlogSection
                        category="therapy"
                        limit={3}
                        showViewAll={true}
                        viewAllUrl="/blog/therapy"
                        title={t('therapies.blog.title', 'Blog de Terapias')}
                        subtitle={t('therapies.blog.subtitle', 'Artículos sobre terapias holísticas, masajes y bienestar')}
                    />
                </section>
            </main>
            <div className="snap-start" id="footer-snap">
                <Footer />
            </div>
        </div >
    );
};

export default TherapiesPage;
