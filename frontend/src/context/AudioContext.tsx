import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';
import { getImageUrl } from '../utils/imageUtils';


interface Meditation {
    id: number;
    title: string;
    excerpt?: string;
    media_url?: string;
    thumbnail_url?: string;
    slug?: string;
    translations?: {
        [key: string]: {
            title?: string;
            excerpt?: string;
        };
    };
}

interface AudioContextType {
    playingMeditation: Meditation | null;
    isPlaying: boolean;
    progress: number;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    playlist: Meditation[];
    isPlayerModalOpen: boolean;
    isMeditationInView: boolean;
    play: (meditation: Meditation, shouldOpenModal?: boolean, playlist?: Meditation[]) => void;
    pause: () => void;
    stop: () => void;
    next: () => void;
    previous: () => void;
    setIsPlayerModalOpen: (open: boolean) => void;
    setIsMeditationInView: (inView: boolean) => void;
    setVolume: (volume: number) => void;
    setIsMuted: (muted: boolean) => void;
    seek: (progress: number) => void;
}


const AudioContext = createContext<AudioContextType | undefined>(undefined);


export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [playingMeditation, setPlayingMeditation] = useState<Meditation | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.05); // Default to 0.05 as requested
    const [isMuted, setIsMutedState] = useState(false);
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [isMeditationInView, setIsMeditationInView] = useState(false);
    const [playlist, setPlaylist] = useState<Meditation[]>([]);
    const [homeMusicId, setHomeMusicId] = useState<number | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    if (!audioRef.current && typeof window !== 'undefined') {
        audioRef.current = new Audio();
    }

    const playlistRef = useRef<Meditation[]>([]);
    const currentMeditationRef = useRef<Meditation | null>(null);
    const playMeditationRef = useRef<any>(null);
    const { i18n } = useTranslation();
    const location = useLocation();
    const hasInitializedHomeMusic = useRef(false);
    const activePlayListener = useRef<(() => void) | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    // Fetch logo for background music use
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/site-config/logo_url`)
            .then(res => res.json())
            .then(data => {
                if (data.value) {
                    setLogoUrl(data.value);
                    // Update the background music thumbnail if it's currently playing
                    setPlayingMeditation(prev => {
                        if (prev && prev.id === -999) {
                            return { ...prev, thumbnail_url: data.value };
                        }
                        return prev;
                    });
                }
            })
            .catch(console.error);
    }, []);

    // Handle play attempts and interaction listeners
    const attemptPlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const cleanup = () => {
            if (activePlayListener.current) {
                window.removeEventListener('click', activePlayListener.current);
                window.removeEventListener('touchstart', activePlayListener.current);
                window.removeEventListener('keydown', activePlayListener.current);
                activePlayListener.current = null;
            }
        };

        const handleActualPlay = () => {
            if (audio.src) {
                audio.play().then(() => {
                    setIsPlaying(true);
                    cleanup();
                }).catch(() => {
                    // Still blocked or no source, keep listeners active
                });
            }
        };

        // Try immediate
        if (audio.src) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsPlaying(true);
                    cleanup();
                }).catch((error) => {
                    // Autoplay was blocked
                    if (error.name === 'NotAllowedError') {
                        cleanup(); // Remove any previous listeners just in case
                        activePlayListener.current = handleActualPlay;
                        window.addEventListener('click', handleActualPlay);
                        window.addEventListener('touchstart', handleActualPlay);
                        window.addEventListener('keydown', handleActualPlay, { once: true });
                    }
                });
            }
        }
    }, []);

    // Initialize homepage background music
    useEffect(() => {
        const initializeHomeMusic = async () => {
            try {
                // 1. Fetch both config and meditations in parallel to save time
                const [configRes, medRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/site-config/homepage_music_url`),
                    fetch(`${API_BASE_URL}/api/content?type=meditation&status=published`)
                ]);

                if (!configRes.ok || !medRes.ok) return;

                const [configData, meditations] = await Promise.all([
                    configRes.json(),
                    medRes.json()
                ]);

                const musicUrl = configData.value;
                if (!musicUrl) {
                    hasInitializedHomeMusic.current = true;
                    return;
                }

                const normalizeUrl = (u: string) => {
                    if (!u) return '';
                    // Remove domain, query params and trailing slashes
                    let path = u.replace(/^https?:\/\/[^/]+/, '');
                    path = path.split('?')[0].replace(/\/+$/, '');
                    if (!path.startsWith('/')) path = '/' + path;
                    return path;
                };

                const normalizedTarget = normalizeUrl(musicUrl);

                let targetMeditation = meditations.find((m: Meditation) => {
                    const normalizedMed = normalizeUrl(m.media_url || '');
                    return normalizedMed === normalizedTarget && normalizedMed !== '';
                });

                // If no matching meditation found, create a virtual one for background music
                if (!targetMeditation && musicUrl) {
                    targetMeditation = {
                        id: -999, // Special ID for background music
                        title: 'Bienvenid@ a Arunachala',
                        media_url: musicUrl,
                        thumbnail_url: undefined, // will be updated when logo loads
                        translations: {
                            es: { title: 'Bienvenid@ a Arunachala' },
                            en: { title: 'Welcome to Arunachala' },
                            ca: { title: 'Benvingut/da a Arunachala' }
                        }
                    };
                }

                if (targetMeditation) {
                    setHomeMusicId(targetMeditation.id);

                    if (!currentMeditationRef.current) {
                        setPlayingMeditation(targetMeditation);
                        setPlaylist([targetMeditation]);

                        const audio = audioRef.current;
                        if (audio) {
                            const url = targetMeditation.media_url || '';
                            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
                            audio.src = fullUrl;
                            audio.preload = 'auto';
                            audio.volume = 0.05;
                            setVolumeState(0.05);
                            audio.load();
                            audio.loop = true;

                            // If we are currently on home, try to play
                            if ((location.pathname === '/' || location.pathname === '') && !location.pathname.includes('dashboard')) {
                                attemptPlay();
                            }
                        }
                    }
                }
                hasInitializedHomeMusic.current = true;
            } catch (error) {
                console.error("Error initializing background music:", error);
            }
        };

        if (!hasInitializedHomeMusic.current) {
            initializeHomeMusic();
        }
        // Only run once on mount - intentionally no dependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Background playback exception for home music on mobile
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && playingMeditation?.id === homeMusicId) {
                // If it's mobile (rough check by width)
                if (window.innerWidth < 1024) {
                    if (audioRef.current) {
                        audioRef.current.pause();
                        setIsPlaying(false);
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [playingMeditation, homeMusicId]);

    // Also trigger attemptPlay when location switches to home and it's initialized but paused
    useEffect(() => {
        if ((location.pathname === '/' || location.pathname === '') && !location.pathname.includes('dashboard') && audioRef.current?.paused && playingMeditation) {
            attemptPlay();
        }
    }, [location.pathname, playingMeditation, attemptPlay]);

    // Keep refs in sync
    useEffect(() => {
        playlistRef.current = playlist;
    }, [playlist]);

    useEffect(() => {
        currentMeditationRef.current = playingMeditation;
    }, [playingMeditation]);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current.load();
        }
        setPlayingMeditation(null);
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
        setIsPlayerModalOpen(false);
        setPlaylist([]);
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    const playMeditation = useCallback((meditation: Meditation, shouldOpenModal: boolean = false, newPlaylist?: Meditation[]) => {
        if (!meditation || !audioRef.current) return;

        if (newPlaylist) {
            setPlaylist(newPlaylist);
        }

        const audio = audioRef.current;
        audio.preload = 'auto'; // Optimize for speed

        if (currentMeditationRef.current?.id === meditation.id) {
            if (audio.paused) {
                attemptPlay();
            } else {
                pause();
            }
        } else {
            audio.pause();

            const url = meditation.media_url || '';
            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

            audio.src = fullUrl;
            audio.volume = volume;
            audio.muted = isMuted;
            audio.load();

            attemptPlay();

            setPlayingMeditation(meditation);
        }

        if (shouldOpenModal) {
            setIsPlayerModalOpen(true);
        }
    }, [volume, isMuted, pause, attemptPlay]);

    // Playback time tracker
    const playTimeAccumulator = useRef<number>(0);
    const lastSysTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && playingMeditation?.slug) {
            lastSysTimeRef.current = Date.now();
            interval = setInterval(() => {
                const now = Date.now();
                const diff = (now - lastSysTimeRef.current) / 1000;
                lastSysTimeRef.current = now;

                playTimeAccumulator.current += diff;

                if (playTimeAccumulator.current >= 10) {
                    const secondsToReport = Math.floor(playTimeAccumulator.current);
                    playTimeAccumulator.current -= secondsToReport;

                    fetch(`${API_BASE_URL}/api/content/slug/${playingMeditation.slug}/playback`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ seconds: secondsToReport })
                    }).catch(() => {
                        // ignore errors to not flood console
                    });
                }
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, playingMeditation]);

    // Setup global listeners once
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (audio.duration > 0) {
                setProgress((audio.currentTime / audio.duration) * 100);
                if ('mediaSession' in navigator && navigator.mediaSession.setPositionState) {
                    try {
                        navigator.mediaSession.setPositionState({
                            duration: audio.duration,
                            playbackRate: audio.playbackRate,
                            position: audio.currentTime,
                        });
                    } catch (_) { }
                }
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        const handleEnded = () => {
            const currentP = playlistRef.current;
            const currentM = currentMeditationRef.current;
            if (currentP.length > 0 && currentM) {
                const currentIndex = currentP.findIndex(m => m.id === currentM.id);
                if (currentIndex !== -1 && currentIndex < currentP.length - 1) {
                    if (playMeditationRef.current) {
                        playMeditationRef.current(currentP[currentIndex + 1]);
                    }
                } else {
                    stop();
                }
            } else {
                stop();
            }
        };

        const handleError = (e: any) => {
            console.error("Audio playback error:", e);
            stop();
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [stop]);

    useEffect(() => {
        playMeditationRef.current = playMeditation;
    }, [playMeditation]);

    const next = useCallback(() => {
        const currentM = currentMeditationRef.current;
        const currentP = playlistRef.current;
        if (!currentM || currentP.length === 0) return;
        const currentIndex = currentP.findIndex(m => m.id === currentM.id);
        if (currentIndex !== -1 && currentIndex < currentP.length - 1) {
            playMeditation(currentP[currentIndex + 1]);
        } else if (currentIndex === currentP.length - 1) {
            playMeditation(currentP[0]);
        }
    }, [playMeditation]);

    const previous = useCallback(() => {
        const currentM = currentMeditationRef.current;
        const currentP = playlistRef.current;
        if (!currentM || currentP.length === 0) return;
        const currentIndex = currentP.findIndex(m => m.id === currentM.id);
        if (currentIndex !== -1 && currentIndex > 0) {
            playMeditation(currentP[currentIndex - 1]);
        } else if (currentIndex === 0) {
            playMeditation(currentP[currentP.length - 1]);
        }
    }, [playMeditation]);

    // Media Session API
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        if (playingMeditation) {
            if (playingMeditation.id === homeMusicId) {
                // If it's home music, we want to show it in lock screen now with fixed title and logo
                const displayTitle = getTranslated(playingMeditation, 'title', i18n.language) || 'Bienvenid@ a Arunachala';
                const artworkUrl = getImageUrl(logoUrl || '/logo_icon.webp');

                const isWebp = artworkUrl.includes('.webp');
                const imgType = isWebp ? 'image/webp' : artworkUrl.includes('.png') ? 'image/png' : 'image/jpeg';

                navigator.mediaSession.metadata = new window.MediaMetadata({
                    title: displayTitle,
                    artist: 'Arunachala Yoga',
                    album: 'Música de fondo',
                    artwork: [
                        { src: artworkUrl, sizes: '96x96', type: imgType },
                        { src: artworkUrl, sizes: '128x128', type: imgType },
                        { src: artworkUrl, sizes: '192x192', type: imgType },
                        { src: artworkUrl, sizes: '256x256', type: imgType },
                        { src: artworkUrl, sizes: '512x512', type: imgType },
                    ]
                });
                return;
            }

            const title = getTranslated(playingMeditation, 'title', i18n.language);
            const artworkUrl = playingMeditation.thumbnail_url
                ? getImageUrl(playingMeditation.thumbnail_url)
                : getImageUrl('/logo_icon.webp');

            const isWebp = artworkUrl.includes('.webp');
            const imgType = isWebp ? 'image/webp' : artworkUrl.includes('.png') ? 'image/png' : 'image/jpeg';

            navigator.mediaSession.metadata = new window.MediaMetadata({
                title: title,
                artist: 'Arunachala Yoga',
                album: 'Meditaciones Guiadas',
                artwork: [
                    { src: artworkUrl, sizes: '96x96', type: imgType },
                    { src: artworkUrl, sizes: '128x128', type: imgType },
                    { src: artworkUrl, sizes: '192x192', type: imgType },
                    { src: artworkUrl, sizes: '256x256', type: imgType },
                    { src: artworkUrl, sizes: '384x384', type: imgType },
                    { src: artworkUrl, sizes: '512x512', type: imgType },
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => {
                if (audioRef.current) {
                    audioRef.current.play().catch(console.error);
                }
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                pause();
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                previous();
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                next();
            });

            try {
                navigator.mediaSession.setActionHandler('seekto', (details) => {
                    if (details.seekTime !== undefined && audioRef.current) {
                        audioRef.current.currentTime = details.seekTime;
                    }
                });
            } catch (error) { }
        } else {
            navigator.mediaSession.metadata = null;
        }
    }, [playingMeditation, homeMusicId, next, previous, pause, i18n.language, logoUrl]);

    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }, [isPlaying]);

    const setVolume = useCallback((val: number) => {
        setVolumeState(val);
        if (audioRef.current) {
            audioRef.current.volume = val;
            if (val > 0 && isMuted) {
                setIsMutedState(false);
                audioRef.current.muted = false;
            } else if (val === 0 && !isMuted) {
                setIsMutedState(true);
                audioRef.current.muted = true;
            }
        }
    }, [isMuted]);

    const setIsMuted = useCallback((val: boolean) => {
        setIsMutedState(val);
        if (audioRef.current) {
            audioRef.current.muted = val;
        }
    }, []);

    const seek = useCallback((p: number) => {
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
            const seekTime = (p / 100) * audioRef.current.duration;
            audioRef.current.currentTime = seekTime;
            setProgress(p);
        }
    }, []);

    return (
        <AudioContext.Provider value={{
            playingMeditation,
            isPlaying,
            progress,
            currentTime,
            duration,
            volume,
            isMuted,
            playlist,
            isPlayerModalOpen,
            isMeditationInView,
            play: playMeditation,
            pause,
            stop,
            next,
            previous,
            setIsPlayerModalOpen,
            setIsMeditationInView,
            setVolume,
            setIsMuted,
            seek
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
