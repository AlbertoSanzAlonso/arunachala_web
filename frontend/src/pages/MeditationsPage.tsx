import * as React from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { API_BASE_URL } from '../config';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import MeditationSearch, { FilterState } from '../components/MeditationSearch';
import { getTranslated } from '../utils/translate';
import { useAudio } from '../context/AudioContext';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/solid';
import VolumeControl from '../components/VolumeControl';

interface Meditation {
    id: number;
    title: string;
    excerpt?: string;
    media_url?: string;
    thumbnail_url?: string;
    slug?: string;
    created_at: string;
    tags?: string[] | string;
    translations?: {
        [key: string]: {
            title?: string;
            excerpt?: string;
            body?: string;
        };
    };
}



const MeditationsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const { slug: routeSlug } = useParams();
    const {
        playingMeditation,
        isPlaying,
        volume,
        isMuted,
        play,
        stop,
        setIsPlayerModalOpen: setModalOpen,
        setIsMeditationInView,
        setVolume,
        setIsMuted,
    } = useAudio();

    const [meditations, setMeditations] = useState<Meditation[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Search and Pagination State
    const [filters, setFilters] = useState<FilterState>({
        query: '',
        year: 'all',
        month: 'all',
        tags: []
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Filtered meditations
    const filteredMeditations = useMemo(() => {
        return meditations.filter((meditation) => {
            const currentLang = i18n.language.split('-')[0];
            const translation = meditation.translations?.[currentLang];
            const displayTitle = (translation?.title || meditation.title).toLowerCase();
            const displayExcerpt = (translation?.excerpt || meditation.excerpt || '').toLowerCase();
            const q = filters.query.toLowerCase();

            if (q && !displayTitle.includes(q) && !displayExcerpt.includes(q)) return false;

            if (filters.year !== 'all') {
                const year = new Date(meditation.created_at).getFullYear().toString();
                if (year !== filters.year) return false;
            }

            if (filters.month !== 'all') {
                const month = new Date(meditation.created_at).getMonth().toString();
                if (month !== filters.month) return false;
            }

            if (filters.tags.length > 0) {
                let tTags = getTranslated(meditation, 'tags', i18n.language);
                if (typeof tTags === 'string') {
                    try { tTags = JSON.parse(tTags); } catch (e) { }
                }

                let safeTags: string[] = [];
                if (Array.isArray(tTags) && tTags.length > 0) safeTags = tTags;
                else if (Array.isArray(meditation.tags)) safeTags = meditation.tags;
                else if (typeof meditation.tags === 'string') {
                    try { safeTags = JSON.parse(meditation.tags); } catch { }
                }

                if (!safeTags || safeTags.length === 0) return false;
                return filters.tags.every(tag => safeTags.includes(tag));
            }

            return true;
        });
    }, [meditations, filters, i18n.language]);

    const totalPages = Math.ceil(filteredMeditations.length / itemsPerPage);
    const currentItems = filteredMeditations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Track if current meditation is on screen (on current page)
    useEffect(() => {
        if (playingMeditation) {
            const inView = currentItems.some(m => m.id === playingMeditation.id);
            setIsMeditationInView(inView);
        } else {
            setIsMeditationInView(false);
        }
    }, [playingMeditation, currentItems, setIsMeditationInView]);

    // Cleanup on unmount
    useEffect(() => {
        return () => setIsMeditationInView(false);
    }, [setIsMeditationInView]);


    useEffect(() => { setCurrentPage(1); }, [filters]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const handlePlay = useCallback((meditation: Meditation, shouldOpenModal: boolean = false) => {
        if (!meditation) return;

        if (routeSlug || searchParams.get('play')) {
            const currentParam = (searchParams.get('play') || routeSlug)?.toLowerCase().trim();
            if (meditation.slug?.toLowerCase().trim() !== currentParam &&
                meditation.title?.toLowerCase().trim() !== currentParam) {
                navigate('/meditaciones', { replace: true });
            }
        }

        play(meditation, shouldOpenModal, filteredMeditations);
    }, [routeSlug, searchParams, navigate, play, filteredMeditations]);

    useEffect(() => {
        const fetchMeditations = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/content?type=meditation&status=published`);
                if (response.ok) {
                    const data = await response.json();
                    setMeditations(data || []);
                } else {
                    setMeditations([]);
                }
            } catch (error) {
                console.error("Error fetching meditations", error);
                setMeditations([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMeditations();
    }, []);


    const lastHandledSlug = useRef<string | null>(null);

    useEffect(() => {
        if (!isLoading && meditations.length > 0) {
            const playParam = (searchParams.get('play') || routeSlug)?.toLowerCase().trim();

            if (!playParam) {
                lastHandledSlug.current = null;
                return;
            }

            // If we already handled this specific slug, don't re-enforce it
            // This allows the user to navigate (next/prev) without being pulled back to the URL slug
            if (playParam === lastHandledSlug.current) {
                return;
            }

            if (playParam) {
                let index = filteredMeditations.findIndex(m =>
                    m.slug?.toLowerCase().trim() === playParam ||
                    m.title?.toLowerCase().trim() === playParam
                );

                if (index === -1) {
                    const existsInFullList = meditations.find(m =>
                        m.slug?.toLowerCase().trim() === playParam ||
                        m.title?.toLowerCase().trim() === playParam
                    );
                    if (existsInFullList) {
                        setFilters({ query: '', year: 'all', month: 'all', tags: [] });
                        return;
                    }
                    return;
                }

                const meditationToPlay = filteredMeditations[index];
                const targetPage = Math.floor(index / itemsPerPage) + 1;

                if (currentPage !== targetPage) setCurrentPage(targetPage);

                if (playingMeditation?.id !== meditationToPlay.id) {
                    handlePlay(meditationToPlay, true);
                    lastHandledSlug.current = playParam;
                } else {
                    setModalOpen(true);
                    lastHandledSlug.current = playParam;
                }
            }
        }
    }, [isLoading, meditations, filteredMeditations, searchParams, routeSlug, handlePlay, itemsPerPage, currentPage, playingMeditation, setModalOpen]);

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <Helmet>
                <title>{t('menu.meditations')} | Arunachala</title>
                <meta name="description" content="Meditaciones guiadas y mantras para tu paz interior." />
            </Helmet>

            <Header />

            <main className="flex-grow pt-40 md:pt-48 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="mb-8 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        <BackButton label={t('common.back_home')} />
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-headers text-forest text-center mb-6 uppercase tracking-wider pt-12 md:pt-0"
                    >
                        {t('meditations.title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center text-xl text-bark/80 max-w-2xl mx-auto mb-16"
                    >
                        {t('meditations.subtitle')}
                    </motion.p>

                    <MeditationSearch meditations={meditations} onFilterChange={setFilters} filters={filters} />

                    {isLoading ? (
                        <div className="text-center py-20">{t('meditations.loading')}</div>
                    ) : filteredMeditations.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 italic">
                            {filters.query || filters.year !== 'all' || filters.tags.length > 0 ? t('meditations.error_search') : t('meditations.empty')}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                <AnimatePresence>
                                    {currentItems.map((meditation, index) => {
                                        const currentLang = i18n.language.split('-')[0];
                                        const translation = meditation.translations?.[currentLang];
                                        const displayTitle = translation?.title || meditation.title;
                                        const displayExcerpt = translation?.excerpt || meditation.excerpt;

                                        return (
                                            <motion.div
                                                layout
                                                key={meditation.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="bg-white rounded-3xl shadow-lg overflow-hidden border border-bone hover:shadow-xl transition-all duration-300 group"
                                            >
                                                <div className="relative h-48 bg-matcha/20 flex items-center justify-center overflow-hidden">
                                                    {meditation.thumbnail_url ? (
                                                        <img
                                                            src={meditation.thumbnail_url.startsWith('http') ? meditation.thumbnail_url : `${API_BASE_URL}${meditation.thumbnail_url}`}
                                                            alt={displayTitle}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            onError={(e) => {
                                                                const target = e.currentTarget;
                                                                if (target.getAttribute('data-fallback')) {
                                                                    target.style.display = 'none';
                                                                    const parent = target.parentElement;
                                                                    if (parent) {
                                                                        const fileName = meditation.thumbnail_url?.split('/').pop() || 'Imagen';
                                                                        const errDiv = document.createElement('div');
                                                                        errDiv.className = "absolute inset-0 flex items-center justify-center p-4 text-center text-[10px] text-bark/30 italic break-all";
                                                                        errDiv.innerText = fileName;
                                                                        parent.appendChild(errDiv);
                                                                    }
                                                                    return;
                                                                }
                                                                target.setAttribute('data-fallback', 'true');
                                                                target.src = `${API_BASE_URL}/static/gallery/articles/meditation_default.webp`;
                                                                target.className = "w-full h-full object-cover opacity-60";
                                                            }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={`${API_BASE_URL}/static/gallery/articles/meditation_default.webp`}
                                                            alt="Meditation"
                                                            className="w-full h-full object-cover opacity-60"
                                                        />
                                                    )}

                                                    <div className="absolute flex gap-4 z-10">
                                                        {playingMeditation?.id === meditation.id ? (
                                                            <>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handlePlay(meditation); }}
                                                                    className="bg-white/90 rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-200"
                                                                    title={isPlaying ? "Pausar" : "Reanudar"}
                                                                >
                                                                    {isPlaying ? (
                                                                        <PauseIcon className="w-12 h-12 text-forest" />
                                                                    ) : (
                                                                        <PlayIcon className="w-12 h-12 text-forest pl-1" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); stop(); }}
                                                                    className="bg-white/90 rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-200"
                                                                    title="Detener y Reiniciar"
                                                                >
                                                                    <StopIcon className="w-12 h-12 text-red-500" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); if (meditation.media_url) handlePlay(meditation); }}
                                                                className="bg-white/90 rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-200"
                                                            >
                                                                <PlayIcon className="w-12 h-12 text-forest pl-1" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Sound Wave Animation & Volume Control */}
                                                    {playingMeditation?.id === meditation.id && (
                                                        <div className="absolute bottom-4 left-4 z-30">
                                                            <VolumeControl
                                                                volume={volume}
                                                                isMuted={isMuted}
                                                                onVolumeChange={setVolume}
                                                                onMuteToggle={() => setIsMuted(!isMuted)}
                                                                size="sm"
                                                            />
                                                        </div>
                                                    )}
                                                    {playingMeditation?.id === meditation.id && isPlaying && (
                                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-end gap-1 h-8 z-20 pointer-events-none">
                                                            {[...Array(5)].map((_, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    className="w-1 bg-white/80 rounded-full"
                                                                    animate={{
                                                                        height: [4, 16 + Math.random() * 16, 4],
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.5 + Math.random() * 0.5,
                                                                        repeat: Infinity,
                                                                        repeatType: "reverse",
                                                                        delay: i * 0.1,
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-6">
                                                    <h3 className="text-2xl font-headers text-forest mb-2">{displayTitle}</h3>
                                                    <div className="h-20 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                                                        <p className="text-bark/80 text-sm leading-relaxed">{displayExcerpt}</p>
                                                    </div>

                                                    {(() => {
                                                        let tTags = getTranslated(meditation, 'tags', i18n.language);
                                                        if (typeof tTags === 'string') {
                                                            try { tTags = JSON.parse(tTags); } catch (e) { }
                                                        }
                                                        let safeTags: string[] = [];
                                                        if (Array.isArray(tTags) && tTags.length > 0) safeTags = tTags;
                                                        else if (Array.isArray(meditation.tags)) safeTags = meditation.tags;
                                                        else if (typeof meditation.tags === 'string') {
                                                            try { safeTags = JSON.parse(meditation.tags); } catch { }
                                                        }

                                                        if (safeTags && safeTags.length > 0) {
                                                            return (
                                                                <div className="flex flex-wrap gap-2 mb-4">
                                                                    {safeTags.map(tag => {
                                                                        const isActive = filters.tags.includes(tag);
                                                                        return (
                                                                            <span
                                                                                key={tag}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setFilters(prev => ({
                                                                                        ...prev,
                                                                                        tags: isActive
                                                                                            ? prev.tags.filter(t => t !== tag)
                                                                                            : [...prev.tags, tag]
                                                                                    }));
                                                                                }}
                                                                                className={`px-2 py-1 text-xs rounded-md cursor-pointer transition-colors ${isActive
                                                                                    ? "bg-forest text-white hover:bg-forest/90"
                                                                                    : "bg-forest/5 text-forest hover:bg-forest/10"
                                                                                    }`}
                                                                            >
                                                                                #{tag}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}

                                                    {playingMeditation?.id === meditation.id && (
                                                        <button
                                                            onClick={() => setModalOpen(true)}
                                                            className="w-full py-2 bg-matcha/10 text-forest text-xs font-semibold rounded-lg hover:bg-matcha/20 transition-colors uppercase tracking-widest"
                                                        >
                                                            {t('meditations.open_player')}
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 md:gap-3 mt-16 pb-8">
                                    <button
                                        onClick={() => {
                                            setCurrentPage(1);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-full transition-all ${currentPage === 1
                                            ? 'text-bark/20 cursor-not-allowed'
                                            : 'bg-white text-forest shadow-md hover:bg-forest hover:text-white'
                                            }`}
                                        aria-label="Primera página"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const prevRangeStart = Math.max(1, Math.floor((currentPage - 1) / 5) * 5 - 4);
                                            setCurrentPage(prevRangeStart);
                                        }}
                                        disabled={currentPage <= 5 && Math.floor((currentPage - 1) / 5) === 0}
                                        className={`p-2 rounded-full transition-all ${currentPage <= 5 && Math.floor((currentPage - 1) / 5) === 0
                                            ? 'text-bark/20 cursor-not-allowed'
                                            : 'bg-white text-forest shadow-md hover:bg-forest hover:text-white'
                                            }`}
                                        aria-label={t('meditations.prev')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    <div className="flex items-center gap-1 md:gap-2">
                                        {(() => {
                                            const rangeSize = 5;
                                            const start = Math.floor((currentPage - 1) / rangeSize) * rangeSize + 1;
                                            const end = Math.min(totalPages, start + rangeSize - 1);

                                            const pages = [];
                                            for (let i = start; i <= end; i++) {
                                                pages.push(
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentPage(i)}
                                                        className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${currentPage === i
                                                            ? 'bg-forest text-white shadow-lg scale-110'
                                                            : 'bg-white text-bark/60 hover:bg-matcha/20 hover:text-forest'
                                                            }`}
                                                    >
                                                        {i}
                                                    </button>
                                                );
                                            }
                                            return pages;
                                        })()}
                                    </div>

                                    <button
                                        onClick={() => {
                                            const nextRangeStart = Math.min(totalPages, Math.floor((currentPage - 1) / 5) * 5 + 6);
                                            setCurrentPage(nextRangeStart);
                                        }}
                                        disabled={Math.floor((currentPage - 1) / 5) * 5 + 5 >= totalPages}
                                        className={`p-2 rounded-full transition-all ${Math.floor((currentPage - 1) / 5) * 5 + 5 >= totalPages
                                            ? 'text-bark/20 cursor-not-allowed'
                                            : 'bg-white text-forest shadow-md hover:bg-forest hover:text-white'
                                            }`}
                                        aria-label={t('meditations.next')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const lastRangeStart = Math.floor((totalPages - 1) / 5) * 5 + 1;
                                            setCurrentPage(lastRangeStart);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        disabled={currentPage >= Math.floor((totalPages - 1) / 5) * 5 + 1}
                                        className={`p-2 rounded-full transition-all ${currentPage >= Math.floor((totalPages - 1) / 5) * 5 + 1
                                            ? 'text-bark/20 cursor-not-allowed'
                                            : 'bg-white text-forest shadow-md hover:bg-forest hover:text-white'
                                            }`}
                                        aria-label="Último rango"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MeditationsPage;
