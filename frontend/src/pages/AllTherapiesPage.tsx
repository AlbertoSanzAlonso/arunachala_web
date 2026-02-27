import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '../store/uiStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FadeInSection from '../components/FadeInSection';
import BackButton from '../components/BackButton';
import lotusFlower from '../assets/images/lotus_flower.png';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';
import { getImageUrl } from '../utils/imageUtils';

interface Treatment {
    id: number;
    name: string;
    excerpt: string;
    description: string;
    benefits: string;
    duration_min: number;
    price: string;
    image_url: string | null;
    translations?: any;
}



const AllTherapiesPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [therapies, setTherapies] = useState<Treatment[]>([]);
    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchTherapies = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/treatments/therapies`);
            if (response.ok) {
                const data = await response.json();
                setTherapies(data || []);
            } else {
                setTherapies([]);
            }
        } catch (error) {
            console.error("Failed to load therapies:", error);
            setTherapies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTherapies();
    }, []);


    // Auto-open from URL parameter
    useEffect(() => {
        if (!loading && therapies.length > 0) {
            const itemParam = searchParams.get('item')?.toLowerCase().trim();
            if (itemParam) {
                const normalize = (str: string) =>
                    str.toLowerCase().trim()
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                        .replace(/\s+/g, '-');

                const treatment = therapies.find(t =>
                    normalize(t.name) === itemParam ||
                    String(t.id) === itemParam
                );
                if (treatment) {
                    setSelectedTreatment(treatment);
                }
            }
        }
    }, [loading, therapies, searchParams]);

    const handleCloseModal = () => {
        setSelectedTreatment(null);
        // Clear query param
        if (searchParams.has('item')) {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('item');
            setSearchParams(newParams);
        }
    };

    const { addToast } = useUIStore();

    const handleShare = async (e: React.MouseEvent, treatment: Treatment) => {
        e.stopPropagation();
        const normalize = (str: string) =>
            str.toLowerCase().trim()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, '-');

        const shareUrl = `${window.location.origin}/terapias/terapias-holisticas?item=${normalize(treatment.name)}`;
        const title = getTranslated(treatment, 'name', i18n.language);

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: t('therapies.share_text', 'Mira esta terapia en Arunachala Yoga'),
                    url: shareUrl,
                });
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                addToast('success', t('common.copied_to_clipboard', 'Enlace copiado al portapapeles'));
            } catch (err) {
                console.error("Copy failed:", err);
                addToast('error', t('common.copy_failed', 'Error al copiar el enlace'));
            }
        }
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col bg-white">
            <Helmet>
                <title>{t('therapies.sections.therapies')} | Arunachala</title>
                <meta name="description" content={t('therapies.sections.therapies_sub')} />
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
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col md:flex-row relative"
                        >
                            <div className="absolute top-4 right-4 flex gap-2 z-10">
                                <button
                                    onClick={(e) => handleShare(e, selectedTreatment)}
                                    className="p-2 bg-white/80 rounded-full hover:bg-forest hover:text-white transition-colors"
                                    title={t('common.share', 'Compartir')}
                                >
                                    <ShareIcon className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 bg-white/80 rounded-full hover:bg-forest hover:text-white transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-100 flex-shrink-0">
                                {selectedTreatment.image_url ? (
                                    <img
                                        src={getImageUrl(selectedTreatment.image_url)}
                                        alt={getTranslated(selectedTreatment, 'name', i18n.language)}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            if (target.src !== lotusFlower) {
                                                target.src = lotusFlower;
                                                target.className = "w-full h-full object-contain p-12 opacity-20";
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
                                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-white bg-matcha rounded-full">
                                        {selectedTreatment.duration_min} min
                                    </span>
                                )}
                                <h3 className="text-3xl md:text-4xl font-headers text-forest mb-6">
                                    {getTranslated(selectedTreatment, 'name', i18n.language)}
                                </h3>

                                <div className="prose prose-stone max-w-none">
                                    <h4 className="text-lg font-bold text-forest tracking-wide mb-2">{t('therapies.modal.description')}</h4>
                                    <p className="text-bark/80 leading-relaxed mb-6 whitespace-pre-line">
                                        {getTranslated(selectedTreatment, 'description', i18n.language) || getTranslated(selectedTreatment, 'excerpt', i18n.language) || t('therapies.modal.no_description')}
                                    </p>

                                    {getTranslated(selectedTreatment, 'benefits', i18n.language) && (
                                        <>
                                            <h4 className="text-lg font-bold text-forest tracking-wide mb-2">{t('therapies.modal.benefits')}</h4>
                                            <p className="text-matcha font-medium leading-relaxed italic">
                                                {getTranslated(selectedTreatment, 'benefits', i18n.language)}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {selectedTreatment.price && (
                                    <div className="mb-6">
                                        <h4 className="text-lg font-bold text-forest tracking-wide mb-2">{t('therapies.modal.price')}</h4>
                                        <p className="text-2xl font-headers text-matcha font-bold">
                                            {selectedTreatment.price}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <button
                                        onClick={() => navigate('/contacto')}
                                        className="w-full sm:w-auto px-6 py-3 bg-forest text-white font-bold rounded-full hover:bg-matcha transition-colors tracking-widest text-sm"
                                    >
                                        {t('therapies.appointment.cta')}
                                    </button>
                                    <button
                                        onClick={handleCloseModal}
                                        className="text-sm font-bold text-forest hover:text-matcha tracking-widest transition-colors"
                                    >
                                        {t('therapies.modal.close')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-grow pt-40 md:pt-48 pb-20">
                <div className="max-w-7xl mx-auto px-8">
                    {/* Back Button */}
                    <div className="mb-8">
                        <BackButton to="/terapias-y-masajes" label={t('blog.back_to_therapies', 'Volver a Terapias')} className="text-forest hover:text-matcha mb-0" />
                    </div>

                    {/* Header */}
                    <FadeInSection className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-headers text-forest mb-4">{t('therapies.sections.therapies')}</h1>
                        <p className="text-bark/70 text-lg md:text-xl max-w-2xl mx-auto">{t('therapies.sections.therapies_sub')}</p>
                    </FadeInSection>

                    {/* Therapies Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-96 bg-bone/50 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : therapies.length > 0 ? (
                        <FadeInSection>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {therapies.map((therapy) => (
                                    <motion.div
                                        key={therapy.id}
                                        whileHover={{ y: -10 }}
                                        onClick={() => setSelectedTreatment(therapy)}
                                        className="group cursor-pointer p-8 rounded-3xl bg-bone/30 border border-forest/10 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/50 transition-colors duration-500" />

                                        <div className="h-48 -mx-8 -mt-8 mb-6 overflow-hidden flex items-center justify-center bg-bone/50">
                                            {therapy.image_url ? (
                                                <img
                                                    src={getImageUrl(therapy.image_url)}
                                                    alt={getTranslated(therapy, 'name', i18n.language)}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        if (target.src !== lotusFlower) {
                                                            target.src = lotusFlower;
                                                            target.className = "w-24 h-24 object-contain opacity-20 group-hover:scale-110 transition-transform duration-500 m-auto";
                                                            target.parentElement?.classList.add("flex", "items-center", "justify-center", "bg-bone/50");
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <img src={lotusFlower} alt="Detalle" className="w-24 h-24 object-contain opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                            )}
                                        </div>

                                        <h3 className="text-2xl font-headers text-forest mb-4 relative z-10">{getTranslated(therapy, 'name', i18n.language)}</h3>
                                        <p className="text-bark/80 mb-4 leading-relaxed line-clamp-3 relative z-10">{getTranslated(therapy, 'excerpt', i18n.language) || getTranslated(therapy, 'description', i18n.language)}</p>
                                        {getTranslated(therapy, 'benefits', i18n.language) && (
                                            <p className="text-sm italic text-matcha font-bold mb-4 line-clamp-2 relative z-10">{getTranslated(therapy, 'benefits', i18n.language)}</p>
                                        )}
                                        <div className="flex justify-between items-center mt-6 border-t border-forest/5 pt-4 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <span className="text-forest/60 text-sm font-bold">
                                                    {therapy.duration_min && therapy.duration_min > 0 ? `${therapy.duration_min} min` : ''}
                                                </span>
                                                <button
                                                    onClick={(e) => handleShare(e, therapy)}
                                                    className="text-forest/40 hover:text-forest transition-colors"
                                                    title={t('common.share', 'Compartir')}
                                                >
                                                    <ShareIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <button className="text-forest font-bold group-hover:text-matcha transition-colors">{t('therapies.common.read_more')} →</button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </FadeInSection>
                    ) : (
                        <div className="text-center py-20 bg-bone/20 rounded-xl">
                            <p className="text-bark/50 italic text-lg">{t('therapies.none.therapies')}</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AllTherapiesPage;
