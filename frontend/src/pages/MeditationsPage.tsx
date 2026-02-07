import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { API_BASE_URL } from '../config';
import { Helmet } from 'react-helmet-async';
import { PlayCircleIcon, PauseCircleIcon, SpeakerWaveIcon, SpeakerXMarkIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Meditation {
    id: number;
    title: string;
    excerpt?: string;
    media_url?: string;
    thumbnail_url?: string;
}

const MeditationsPage: React.FC = () => {
    const { t } = useTranslation();
    const [meditations, setMeditations] = useState<Meditation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [playingId, setPlayingId] = useState<number | null>(null);
    const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

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

    const handlePlay = (meditation: Meditation) => {
        const url = meditation.media_url || '';
        console.log("handlePlay triggered for:", meditation.title, "URL:", url);

        if (playingId === meditation.id && audio) {
            console.log("Toggling existing audio. Paused:", audio.paused);
            if (audio.paused) {
                audio.play().catch(err => console.error("Error playing audio:", err));
            } else {
                audio.pause();
                // We don't null playingId here so the player stays active
            }
        } else {
            console.log("Starting new audio flow...");
            if (audio) {
                console.log("Stopping previous audio");
                audio.pause();
            }
            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
            console.log("Full Audio URL:", fullUrl);
            const newAudio = new Audio(fullUrl);

            newAudio.play().then(() => {
                console.log("Audio started playing successfully");
            }).catch(err => {
                console.error("Failed to play audio:", err);
                alert("No se pudo reproducir el audio. Verifica tu conexión o el formato del archivo.");
            });

            newAudio.onended = () => {
                console.log("Audio ended");
                setPlayingId(null);
                setProgress(0);
                setCurrentTime(0);
                setIsPlaying(false);
                setIsPlayerModalOpen(false);
            };
            setAudio(newAudio);
            setPlayingId(meditation.id);
            setSelectedMeditation(meditation);
            setIsPlayerModalOpen(true);
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

    const stopAudio = () => {
        if (audio) {
            audio.pause();
            setAudio(null);
            setPlayingId(null);
            setIsPlayerModalOpen(false);
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
                        <BackButton />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-headers text-forest text-center mb-6 uppercase tracking-wider pt-12 md:pt-0">
                        {t('menu.meditations')}
                    </h1>
                    <p className="text-center text-xl text-bark/80 max-w-2xl mx-auto mb-16">
                        Encuentra un momento de calma y conexión con nuestras meditaciones guiadas y mantras.
                    </p>

                    {isLoading ? (
                        <div className="text-center py-20">Cargando meditaciones...</div>
                    ) : meditations.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 italic">
                            Próximamente compartiremos nuevas meditaciones contigo.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {meditations.map((meditation) => (
                                <div key={meditation.id} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-bone hover:shadow-xl transition-all duration-300 group">
                                    <div className="relative h-48 bg-matcha/20 flex items-center justify-center overflow-hidden">
                                        {meditation.thumbnail_url ? (
                                            <img
                                                src={meditation.thumbnail_url.startsWith('http') ? meditation.thumbnail_url : `${API_BASE_URL}${meditation.thumbnail_url}`}
                                                alt={meditation.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-forest/30 to-matcha/30" />
                                        )}

                                        <button
                                            onClick={() => meditation.media_url && handlePlay(meditation)}
                                            className="absolute bg-white/90 rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-200 z-10"
                                        >
                                            <PlayCircleIcon className="w-12 h-12 text-forest" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl font-headers text-forest mb-2">{meditation.title}</h3>
                                        <p className="text-bark/80 line-clamp-3 mb-4">{meditation.excerpt}</p>

                                        {playingId === meditation.id && (
                                            <button
                                                onClick={() => setIsPlayerModalOpen(true)}
                                                className="w-full py-2 bg-matcha/10 text-forest text-xs font-semibold rounded-lg hover:bg-matcha/20 transition-colors uppercase tracking-widest"
                                            >
                                                Abrir Reproductor
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Player Modal */}
                <Transition appear show={isPlayerModalOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
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

                                        {selectedMeditation && (
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-48 h-48 rounded-2xl shadow-xl mb-8 overflow-hidden bg-matcha/20">
                                                    {selectedMeditation.thumbnail_url ? (
                                                        <img
                                                            src={selectedMeditation.thumbnail_url.startsWith('http') ? selectedMeditation.thumbnail_url : `${API_BASE_URL}${selectedMeditation.thumbnail_url}`}
                                                            alt={selectedMeditation.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-forest to-matcha" />
                                                    )}
                                                </div>

                                                <h3 className="text-2xl font-headers text-forest mb-2">
                                                    {selectedMeditation.title}
                                                </h3>
                                                <p className="text-bark/60 text-sm mb-8 italic">
                                                    Meditación Guiada
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
                                                <div className="flex items-center space-x-8">
                                                    <button
                                                        onClick={toggleMute}
                                                        className="text-bark/40 hover:text-forest transition-colors"
                                                    >
                                                        {isMuted ? (
                                                            <SpeakerXMarkIcon className="w-8 h-8" />
                                                        ) : (
                                                            <SpeakerWaveIcon className="w-8 h-8" />
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => audio && (audio.paused ? audio.play() : audio.pause())}
                                                        className="bg-forest text-white rounded-full p-4 shadow-lg hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        {isPlaying ? (
                                                            <PauseCircleIcon className="w-10 h-10" />
                                                        ) : (
                                                            <PlayCircleIcon className="w-10 h-10" />
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={stopAudio}
                                                        className="text-red-400 hover:text-red-600 transition-colors text-xs font-bold uppercase tracking-widest"
                                                    >
                                                        Detener
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </main>

            <Footer />
        </div>
    );
};

export default MeditationsPage;
