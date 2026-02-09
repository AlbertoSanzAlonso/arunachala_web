import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { API_BASE_URL } from '../config';
import { Helmet } from 'react-helmet-async';
import { PlayCircleIcon, PauseCircleIcon, SpeakerWaveIcon, SpeakerXMarkIcon, XMarkIcon, PlayIcon, PauseIcon, MagnifyingGlassIcon, StopIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import MeditationSearch, { FilterState } from '../components/MeditationSearch';
import { getTranslated } from '../utils/translate';

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

const VolumeControl: React.FC<{
    volume: number;
    isMuted: boolean;
    onVolumeChange: (val: number) => void;
    onMuteToggle: () => void;
    size?: 'sm' | 'md';
}> = ({ volume, isMuted, onVolumeChange, onMuteToggle, size = 'md' }) => {
    const isSmall = size === 'sm';
    return (
        <div className={`flex items-center group/volume ${isSmall ? 'gap-1 p-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm' : 'gap-3'}`}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onMuteToggle();
                }}
                className="text-forest hover:text-matcha transition-colors outline-none"
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted || volume === 0 ? (
                    <SpeakerXMarkIcon className={isSmall ? "w-5 h-5" : "w-8 h-8"} />
                ) : (
                    <SpeakerWaveIcon className={isSmall ? "w-5 h-5" : "w-8 h-8"} />
                )}
            </button>
            <div className={`overflow-hidden transition-all duration-300 flex items-center ${isSmall ? 'w-0 group-hover/volume:w-20 pr-1' : 'w-0 group-hover/volume:w-24 opacity-0 group-hover/volume:opacity-100'}`}>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                        e.stopPropagation();
                        onVolumeChange(parseFloat(e.target.value));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`accent-forest cursor-pointer appearance-none bg-forest/20 rounded-full ${isSmall ? 'h-1 w-full' : 'h-1.5 w-full'}`}
                />
            </div>
        </div>
    );
};

const MeditationsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const { slug: routeSlug } = useParams();
    const [meditations, setMeditations] = useState<Meditation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [playingId, setPlayingId] = useState<number | null>(null);
    const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const playButtonRef = React.useRef<HTMLButtonElement>(null);


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
    const filteredMeditations = React.useMemo(() => {
        return meditations.filter((meditation) => {
            const currentLang = i18n.language.split('-')[0];
            const translation = meditation.translations?.[currentLang];
            const displayTitle = (translation?.title || meditation.title).toLowerCase();
            const displayExcerpt = (translation?.excerpt || meditation.excerpt || '').toLowerCase();
            const q = filters.query.toLowerCase();

            // Query Filter
            if (q && !displayTitle.includes(q) && !displayExcerpt.includes(q)) {
                return false;
            }

            // Year Filter
            if (filters.year !== 'all') {
                const year = new Date(meditation.created_at).getFullYear().toString();
                if (year !== filters.year) return false;
            }

            // Month Filter
            if (filters.month !== 'all') {
                const month = new Date(meditation.created_at).getMonth().toString();
                if (month !== filters.month) return false;
            }

            // Tags Filter
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

                // Check if ALL selected tags are present
                return filters.tags.every(tag => safeTags.includes(tag));
            }

            return true;
        });
    }, [meditations, filters, i18n.language]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredMeditations.length / itemsPerPage);
    const currentItems = filteredMeditations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = React.useCallback((meditation: Meditation) => {
        if (!meditation) return;
        const url = meditation.media_url || '';

        // Prepare selection immediately
        setSelectedMeditation(meditation);
        setIsPlayerModalOpen(true);

        if (playingId === meditation.id && audio) {
            if (audio.paused) {
                audio.play().catch(e => console.error("Playback error", e));
            } else {
                audio.pause();
            }
        } else {
            // New audio track
            if (audio) {
                audio.pause();
            }
            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
            const newAudio = new Audio(fullUrl);
            newAudio.volume = volume;
            newAudio.muted = isMuted;

            newAudio.play().catch(err => {
                console.warn("Autoplay blocked or playback error:", err);
            });

            newAudio.onended = () => {
                setPlayingId(null);
                setProgress(0);
                setCurrentTime(0);
                setIsPlaying(false);
                setIsPlayerModalOpen(false);
            };

            setAudio(newAudio);
            setPlayingId(meditation.id);
        }
    }, [audio, playingId, volume, isMuted, API_BASE_URL]);

    useEffect(() => {
        const fetchMeditations = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/content?type=meditation&status=published`);
                if (response.ok) {
                    const data = await response.json();
                    setMeditations(data);
                }
            } catch (error) {
                console.error("Error fetching meditations", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeditations();
    }, []);

    // Auto-play from URL parameter
    useEffect(() => {
        if (!isLoading && meditations.length > 0) {
            const playParam = (searchParams.get('play') || routeSlug)?.toLowerCase().trim();
            if (playParam) {
                const meditationToPlay = meditations.find(m =>
                    m.slug?.toLowerCase().trim() === playParam ||
                    m.title?.toLowerCase().trim() === playParam
                );

                if (meditationToPlay) {
                    // Crucial: ensure modal state is set even if already playing
                    setSelectedMeditation(meditationToPlay);
                    setIsPlayerModalOpen(true);

                    if (meditationToPlay.id !== playingId) {
                        handlePlay(meditationToPlay);
                    }
                }
            }
        }
    }, [isLoading, meditations, searchParams, routeSlug, playingId, handlePlay]);

    // Effect to handle audio events
    useEffect(() => {
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handlePlayEvent = () => setIsPlaying(true);
        const handlePauseEvent = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('play', handlePlayEvent);
        audio.addEventListener('pause', handlePauseEvent);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('play', handlePlayEvent);
            audio.removeEventListener('pause', handlePauseEvent);
        };
    }, [audio]);

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        if (audio) {
            audio.volume = newVolume;
            if (newVolume > 0 && isMuted) {
                audio.muted = false;
                setIsMuted(false);
            } else if (newVolume === 0 && !isMuted) {
                audio.muted = true;
                setIsMuted(true);
            }
        }
    };

    const toggleMute = () => {
        if (audio) {
            audio.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleCloseModal = () => {
        setIsPlayerModalOpen(false);
        // We keep audio playing in background if user wants, 
        // but for meditations, usually closing the player means stopping?
        // Let's keep it playing but provide a "Stop" or just let it be.
        // Actually, most meditation apps keep playing. 
        // But user asked for a modal "reproductor", so let's allow closing the view without stopping.
    };

    const stopAudio = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (audio) {
            audio.pause();
            audio.currentTime = 0; // Reset to start
            setAudio(null);
            setPlayingId(null);
            setIsPlayerModalOpen(false);
            setProgress(0);
            setIsPlaying(false);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audio) return;
        const seekTime = (parseFloat(e.target.value) / 100) * duration;
        audio.currentTime = seekTime;
        setProgress(parseFloat(e.target.value));
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <Helmet>
                <title>{t('menu.meditations')} | Arunachala</title>
                <meta name="description" content="Meditaciones guiadas y mantras para tu paz interior." />
            </Helmet>

            <Header />

            <main className="flex-grow pt-32 pb-16 relative">
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

                    {/* Search Bar Component */}
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
                                <AnimatePresence mode="popLayout">
                                    {currentItems.map((meditation, index) => {
                                        const currentLang = i18n.language.split('-')[0]; // Handle 'es-ES' -> 'es'
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
                                                        {playingId === meditation.id ? (
                                                            <>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); if (meditation.media_url) handlePlay(meditation); }}
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
                                                                    onClick={stopAudio}
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
                                                    {playingId === meditation.id && (
                                                        <div className="absolute bottom-4 left-4 z-30">
                                                            <VolumeControl
                                                                volume={volume}
                                                                isMuted={isMuted}
                                                                onVolumeChange={handleVolumeChange}
                                                                onMuteToggle={toggleMute}
                                                                size="sm"
                                                            />
                                                        </div>
                                                    )}
                                                    {playingId === meditation.id && isPlaying && (
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
                                                                                    // window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: scroll up
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

                                                    {playingId === meditation.id && (
                                                        <button
                                                            onClick={() => setIsPlayerModalOpen(true)}
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

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 md:gap-3 mt-16 pb-8">
                                    {/* First Page */}
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

                                    {/* Prev Block */}
                                    <button
                                        onClick={() => {
                                            // Jump to the first page of the previous block of 5
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
                                                        onClick={() => {
                                                            setCurrentPage(i);
                                                        }}
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

                                    {/* Next Block */}
                                    <button
                                        onClick={() => {
                                            // Jump to the first page of the next block of 5
                                            const nextRangeStart = Math.min(totalPages, Math.floor((currentPage - 1) / 5) * 5 + 6);
                                            setCurrentPage(nextRangeStart);
                                        }}
                                        disabled={(() => {
                                            const currentBlockEnd = Math.floor((currentPage - 1) / 5) * 5 + 5;
                                            return currentBlockEnd >= totalPages;
                                        })()}
                                        className={`p-2 rounded-full transition-all ${(() => {
                                            const currentBlockEnd = Math.floor((currentPage - 1) / 5) * 5 + 5;
                                            return currentBlockEnd >= totalPages;
                                        })()
                                            ? 'text-bark/20 cursor-not-allowed'
                                            : 'bg-white text-forest shadow-md hover:bg-forest hover:text-white'
                                            }`}
                                        aria-label={t('meditations.next')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* Last Range */}
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

                <Transition appear show={isPlayerModalOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={handleCloseModal} initialFocus={playButtonRef}>

                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-bark/40 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all relative border border-bone">
                                        <button
                                            onClick={handleCloseModal}
                                            className="absolute top-4 right-4 text-bark/40 hover:text-bark/80 transition-colors"
                                        >
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>

                                        {selectedMeditation && (() => {
                                            const currentLang = i18n.language.split('-')[0];
                                            const translation = selectedMeditation.translations?.[currentLang];
                                            const displayTitle = translation?.title || selectedMeditation.title;

                                            return (
                                                <div className="flex flex-col items-center text-center">
                                                    <div className="w-48 h-48 rounded-2xl shadow-xl mb-8 overflow-hidden bg-matcha/20">
                                                        {selectedMeditation.thumbnail_url ? (
                                                            <img
                                                                src={selectedMeditation.thumbnail_url.startsWith('http') ? selectedMeditation.thumbnail_url : `${API_BASE_URL}${selectedMeditation.thumbnail_url}`}
                                                                alt={displayTitle}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.currentTarget;
                                                                    if (target.getAttribute('data-fallback')) {
                                                                        target.style.display = 'none';
                                                                        const parent = target.parentElement;
                                                                        if (parent) {
                                                                            const fileName = selectedMeditation.thumbnail_url?.split('/').pop() || 'Imagen';
                                                                            const errDiv = document.createElement('div');
                                                                            errDiv.className = "w-full h-full flex items-center justify-center p-4 text-center text-sm text-bark/30 italic break-all";
                                                                            errDiv.innerText = fileName;
                                                                            parent.appendChild(errDiv);
                                                                        }
                                                                        return;
                                                                    }
                                                                    target.setAttribute('data-fallback', 'true');
                                                                    target.src = `${API_BASE_URL}/static/gallery/articles/meditation_default.webp`;
                                                                    target.className = "w-full h-full object-cover opacity-80";
                                                                }}
                                                            />
                                                        ) : (
                                                            <img
                                                                src={`${API_BASE_URL}/static/gallery/articles/meditation_default.webp`}
                                                                alt="Meditation"
                                                                className="w-full h-full object-cover opacity-80"
                                                            />
                                                        )}
                                                    </div>

                                                    <h3 className="text-2xl font-headers text-forest mb-2">
                                                        {displayTitle}
                                                    </h3>
                                                    <p className="text-bark/60 text-sm mb-8 italic">
                                                        {t('meditations.guided_meditation')}
                                                    </p>

                                                    {/* Progress Bar */}
                                                    <div className="w-full space-y-2 mb-8">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={duration > 0 ? (currentTime / duration) * 100 : 0}
                                                            onChange={handleSeek}
                                                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-forest transition-all"
                                                            style={{ backgroundSize: `${progress}% 100%` }}
                                                        />
                                                        <div className="flex justify-between text-xs text-bark/40 font-mono font-medium">
                                                            <span>{formatTime(currentTime)}</span>
                                                            <span>{formatTime(duration)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Controls */}
                                                    <div className="grid grid-cols-3 items-center w-full mt-4">
                                                        <div className="flex justify-start">
                                                            <VolumeControl
                                                                volume={volume}
                                                                isMuted={isMuted}
                                                                onVolumeChange={handleVolumeChange}
                                                                onMuteToggle={toggleMute}
                                                            />
                                                        </div>

                                                        <div className="flex justify-center">
                                                            <button
                                                                ref={playButtonRef}
                                                                onClick={() => audio && (audio.paused ? audio.play() : audio.pause())}
                                                                className="bg-forest text-white rounded-full p-4 shadow-lg hover:scale-105 active:scale-95 transition-all outline-none"
                                                            >
                                                                {isPlaying ? (
                                                                    <PauseCircleIcon className="w-10 h-10" />
                                                                ) : (
                                                                    <PlayCircleIcon className="w-10 h-10" />
                                                                )}
                                                            </button>
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <button
                                                                onClick={stopAudio}
                                                                className="text-red-400 hover:text-red-600 transition-colors text-xs font-bold uppercase tracking-widest outline-none"
                                                            >
                                                                {t('meditations.stop')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </main >

            <Footer />
        </div >
    );
};

export default MeditationsPage;
