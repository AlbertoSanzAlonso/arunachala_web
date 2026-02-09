import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config';

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
    const [volume, setVolumeState] = useState(1);
    const [isMuted, setIsMutedState] = useState(false);
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [isMeditationInView, setIsMeditationInView] = useState(false);
    const [playlist, setPlaylist] = useState<Meditation[]>([]);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playlistRef = useRef<Meditation[]>([]);
    const currentMeditationRef = useRef<Meditation | null>(null);

    // Keep refs in sync with state for use in event listeners
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
            audioRef.current = null;
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

    const next = useCallback(() => {
        const currentM = currentMeditationRef.current;
        const currentP = playlistRef.current;
        if (!currentM || currentP.length === 0) return;
        const currentIndex = currentP.findIndex(m => m.id === currentM.id);
        if (currentIndex !== -1 && currentIndex < currentP.length - 1) {
            play(currentP[currentIndex + 1]);
        } else if (currentIndex === currentP.length - 1) {
            play(currentP[0]);
        }
    }, []);

    const previous = useCallback(() => {
        const currentM = currentMeditationRef.current;
        const currentP = playlistRef.current;
        if (!currentM || currentP.length === 0) return;
        const currentIndex = currentP.findIndex(m => m.id === currentM.id);
        if (currentIndex !== -1 && currentIndex > 0) {
            play(currentP[currentIndex - 1]);
        } else if (currentIndex === 0) {
            play(currentP[currentP.length - 1]);
        }
    }, []);

    const play = useCallback((meditation: Meditation, shouldOpenModal: boolean = false, newPlaylist?: Meditation[]) => {
        if (!meditation) return;

        if (newPlaylist) {
            setPlaylist(newPlaylist);
        }

        if (currentMeditationRef.current?.id === meditation.id && audioRef.current) {
            if (audioRef.current.paused) {
                audioRef.current.play().catch(console.error);
                setIsPlaying(true);
            } else {
                pause();
            }
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }

            const url = meditation.media_url || '';
            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
            const newAudio = new Audio(fullUrl);
            newAudio.volume = volume;
            newAudio.muted = isMuted;

            newAudio.addEventListener('timeupdate', () => {
                setCurrentTime(newAudio.currentTime);
                if (newAudio.duration > 0) {
                    setProgress((newAudio.currentTime / newAudio.duration) * 100);
                }
            });

            newAudio.addEventListener('loadedmetadata', () => {
                setDuration(newAudio.duration);
            });

            newAudio.addEventListener('play', () => setIsPlaying(true));
            newAudio.addEventListener('pause', () => setIsPlaying(false));

            newAudio.addEventListener('ended', () => {
                const currentP = playlistRef.current;
                if (currentP.length > 0) {
                    // Manual trigger of next logic
                    const currentM = currentMeditationRef.current;
                    const currentIndex = currentP.findIndex(m => m.id === (currentM?.id || meditation.id));
                    if (currentIndex !== -1 && currentIndex < currentP.length - 1) {
                        play(currentP[currentIndex + 1]);
                    } else {
                        stop();
                    }
                } else {
                    stop();
                }
            });

            newAudio.play().catch(err => {
                console.warn("Playback error:", err);
            });

            audioRef.current = newAudio;
            setPlayingMeditation(meditation);
        }

        if (shouldOpenModal) {
            setIsPlayerModalOpen(true);
        }
    }, [volume, isMuted, pause, stop]);

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
            play,
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
