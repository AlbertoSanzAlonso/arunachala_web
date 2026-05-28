import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import PageSEO from '../components/providers/PageSEO';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '../store/uiStore';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import FadeInSection from '../components/ui/FadeInSection';
import BackButton from '../components/ui/BackButton';
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

const BASE_URL = 'https://www.yogayterapiasarunachala.es';
const MASSAGES_PATH = '/terapias/masajes/';

const normalizeTreatmentSlug = (str: string) =>
    str
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-');

function getTreatmentDescription(treatment: Treatment, lang: string, fallback: string): string {
    const raw =
        getTranslated(treatment, 'excerpt', lang) ||
        getTranslated(treatment, 'description', lang) ||
        treatment.excerpt ||
        treatment.description ||
        fallback;
    return String(raw).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
}

const AllMassagesPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [massages, setMassages] = useState<Treatment[]>([]);
    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMassages = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/treatments/massages`);
            if (response.ok) {
                const data = await response.json();
                setMassages(data);
            }
        } catch (error) {
            console.error("Failed to load massages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMassages();
    }, []);

    // Auto-open from URL parameter
    useEffect(() => {
        if (!loading && massages.length > 0) {
            const itemParam = searchParams.get('item')?.toLowerCase().trim();
            if (itemParam) {
                const treatment = massages.find(m =>
                    normalizeTreatmentSlug(m.name) === itemParam ||
                    String(m.id) === itemParam
                );
                if (treatment) {
                    setSelectedTreatment(treatment);
                }
            }
        }
    }, [loading, massages, searchParams]);

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
        const shareUrl = `${window.location.origin}${MASSAGES_PATH}?item=${normalizeTreatmentSlug(treatment.name)}`;
        const title = getTranslated(treatment, 'name', i18n.language);

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: t('therapies.share_text', 'Mira este masaje en Arunachala Yoga'),
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

    const activeTreatment = useMemo(() => {
        const itemParam = searchParams.get('item')?.toLowerCase().trim();
        if (!itemParam || massages.length === 0) return null;
        return (
            massages.find(
                (m) =>
                    normalizeTreatmentSlug(m.name) === itemParam || String(m.id) === itemParam
            ) ?? null
        );
    }, [searchParams, massages]);

    const seoTitle = activeTreatment
        ? getTranslated(activeTreatment, 'name', i18n.language)
        : t('therapies.massages_page.seo.title');

    const seoDescription = activeTreatment
        ? getTreatmentDescription(activeTreatment, i18n.language, t('therapies.massages_page.seo.description'))
        : t('therapies.massages_page.seo.description');

    const canonical = activeTreatment
        ? `${BASE_URL}${MASSAGES_PATH}?item=${normalizeTreatmentSlug(activeTreatment.name)}`
        : `${BASE_URL}${MASSAGES_PATH}`;

    const structuredData = useMemo(() => {
        const provider = {
            '@type': 'HealthAndBeautyBusiness',
            name: 'Arunachala Yoga y Terapias',
            url: BASE_URL,
        };

        if (activeTreatment) {
            return {
                '@context': 'https://schema.org',
                '@type': 'Service',
                name: getTranslated(activeTreatment, 'name', i18n.language),
                description: getTreatmentDescription(
                    activeTreatment,
                    i18n.language,
                    t('therapies.massages_page.seo.description')
                ),
                url: `${BASE_URL}${MASSAGES_PATH}?item=${normalizeTreatmentSlug(activeTreatment.name)}`,
                provider,
                ...(activeTreatment.price ? { offers: { '@type': 'Offer', price: activeTreatment.price, priceCurrency: 'EUR' } } : {}),
                ...(activeTreatment.duration_min > 0 ? { duration: `PT${activeTreatment.duration_min}M` } : {}),
            };
        }

        const collectionPage = {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: t('therapies.sections.massages'),
            description: t('therapies.massages_page.seo.description'),
            url: `${BASE_URL}${MASSAGES_PATH}`,
        };

        if (massages.length === 0) {
            return collectionPage;
        }

        return [
            collectionPage,
            {
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: t('therapies.sections.massages'),
                numberOfItems: massages.length,
                itemListElement: massages.map((massage, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    url: `${BASE_URL}${MASSAGES_PATH}?item=${normalizeTreatmentSlug(massage.name)}`,
                    item: {
                        '@type': 'Service',
                        name: getTranslated(massage, 'name', i18n.language),
                        provider,
                    },
                })),
            },
        ];
    }, [activeTreatment, massages, t, i18n.language]);

    return (
        <div className="font-body text-bark min-h-screen flex flex-col bg-bone">
            <PageSEO
                title={seoTitle}
                description={seoDescription}
                canonical={canonical}
                structuredData={structuredData}
            />

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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row relative overflow-hidden"
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

                            {/* Image — full height on desktop, fixed (not scrolling) */}
                            <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-100 flex-shrink-0 md:sticky md:top-0 md:self-stretch">
                                {selectedTreatment.image_url ? (
                                    <img
                                        src={getImageUrl(selectedTreatment.image_url)}
                                        alt={getTranslated(selectedTreatment, 'name', i18n.language)}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            if (target.src !== '/logo_icon.webp') {
                                                target.src = '/logo_icon.webp';
                                                target.className = "w-full h-full object-contain p-12 opacity-20";
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-forest/20">
                                        <img src={'/logo_icon.webp'} className="w-24 opacity-20" alt="" />
                                    </div>
                                )}
                            </div>

                            {/* Scrollable content panel */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="p-8 md:p-10 pb-10 md:pb-16">
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
                                        <div
                                            className="text-bark/80 leading-relaxed mb-6 prose prose-stone max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: getTranslated(selectedTreatment, 'description', i18n.language)
                                                    || getTranslated(selectedTreatment, 'excerpt', i18n.language)
                                                    || `<p>${t('therapies.modal.no_description')}</p>`
                                            }}
                                        />

                                        {getTranslated(selectedTreatment, 'benefits', i18n.language) && (
                                            <>
                                                <h4 className="text-lg font-bold text-forest tracking-wide mb-3">{t('therapies.modal.benefits')}</h4>
                                                <ul className="space-y-2 mb-6">
                                                    {(getTranslated(selectedTreatment, 'benefits', i18n.language) as string)
                                                        .split(/\n|,(?=\s*[A-ZÁ-Úá-ú•-])/)
                                                        .map((b: string) => b.trim().replace(/^[•\-*]\s*/, ''))
                                                        .filter((b: string) => b.length > 0)
                                                        .map((benefit: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-2 text-matcha font-medium italic">
                                                                <span className="mt-1 shrink-0 text-matcha">✦</span>
                                                                <span>{benefit}</span>
                                                            </li>
                                                        ))}
                                                </ul>
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

                                    <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mb-0 md:mb-2">
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
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-grow pt-4 md:pt-16 pb-20 relative">
                <div className="max-w-7xl mx-auto px-8 relative">
                    {/* Back Button */}
                    <div className="mb-4 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        <BackButton to="/terapias-y-masajes/" label={t('blog.back_to_therapies', 'Volver a Terapias')} className="text-forest hover:text-matcha mb-0" />
                    </div>

                    {/* Header Title Section */}
                    <FadeInSection className="text-center mb-16 pt-12 md:pt-0">
                        <h1 className="text-4xl md:text-6xl font-headers text-forest mb-4">{t('therapies.sections.massages')}</h1>
                        <p className="text-bark/70 text-lg md:text-xl max-w-2xl mx-auto">{t('therapies.sections.massages_sub')}</p>
                        <p className="text-bark/60 text-sm mt-6">
                            {t('therapies.massages_page.related_holistic')}{' '}
                            <Link to="/terapias/terapias-holisticas/" className="text-forest font-semibold hover:text-matcha underline underline-offset-4">
                                {t('therapies.sections.therapies')}
                            </Link>
                        </p>
                    </FadeInSection>

                    {/* Massages Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-96 bg-bone/50 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : massages.length > 0 ? (
                        <FadeInSection>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {massages.map((massage) => (
                                    <motion.div
                                        key={massage.id}
                                        whileHover={{ y: -10 }}
                                        onClick={() => setSelectedTreatment(massage)}
                                        className="group cursor-pointer p-8 rounded-3xl bg-white border border-forest/10 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-bone/20 transition-colors duration-500" />

                                        <div className="h-48 -mx-8 -mt-8 mb-6 overflow-hidden flex items-center justify-center bg-forest/5">
                                            {massage.image_url ? (
                                                <img
                                                    src={getImageUrl(massage.image_url)}
                                                    alt={getTranslated(massage, 'name', i18n.language)}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    loading="lazy"
                                                    decoding="async"
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        if (target.src !== '/logo_icon.webp') {
                                                            target.src = '/logo_icon.webp';
                                                            target.className = "w-24 h-24 object-contain opacity-20 group-hover:scale-110 transition-transform duration-500 m-auto";
                                                            target.parentElement?.classList.add("flex", "items-center", "justify-center", "bg-forest/5");
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <img src={'/logo_icon.webp'} alt="Detalle" className="w-24 h-24 object-contain opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                            )}
                                        </div>

                                        <a
                                            href={`${MASSAGES_PATH}?item=${normalizeTreatmentSlug(massage.name)}`}
                                            className="block text-2xl font-headers text-forest mb-4 relative z-10 hover:text-matcha transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {getTranslated(massage, 'name', i18n.language)}
                                        </a>
                                        <p className="text-bark/80 mb-4 leading-relaxed line-clamp-3 relative z-10">{getTranslated(massage, 'excerpt', i18n.language) || getTranslated(massage, 'description', i18n.language)}</p>

                                        <div className="flex justify-between items-center mt-6 border-t border-forest/5 pt-4 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <span className="text-forest/60 text-sm font-bold">
                                                    {massage.duration_min && massage.duration_min > 0 ? `${massage.duration_min} min` : ''}
                                                </span>
                                                <button
                                                    onClick={(e) => handleShare(e, massage)}
                                                    className="text-forest/40 hover:text-forest transition-colors"
                                                    title={t('common.share', 'Compartir')}
                                                >
                                                    <ShareIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <button className="text-forest text-[10px] font-bold group-hover:text-matcha transition-colors flex items-center gap-0.5">
                                                {t('therapies.common.read_more')}
                                                <span className="text-sm">→</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </FadeInSection>
                    ) : (
                        <div className="text-center py-20 bg-white/50 rounded-xl">
                            <p className="text-bark/50 italic text-lg">{t('therapies.none.massages')}</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AllMassagesPage;
