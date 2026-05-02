import React, { Fragment, useRef, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlayCircleIcon, PauseCircleIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useAudio } from 'context/AudioContext';
import { API_BASE_URL } from 'config';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { getImageUrl } from 'utils/imageUtils';

import VolumeControl from 'components/ui/VolumeControl';
import ShareButton from 'components/ui/ShareButton';

const MeditationPlayerModal: React.FC = () => {
    const { t, i18n } = useTranslation();
    const {
        playingMeditation,
        isPlaying,
        progress,
        currentTime,
        duration,
        volume,
        isMuted,
        isPlayerModalOpen: isModalOpen,
        playlist,
        play,
        pause,
        stop,
        next,
        previous,
        setIsPlayerModalOpen: setModalOpen,
        setVolume,
        setIsMuted,
        seek
    } = useAudio();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { slug: routeSlug } = useParams();
    const playButtonRef = useRef<HTMLButtonElement>(null);

    // Fetch site logo for background music fallback
    const [siteLogoUrl, setSiteLogoUrl] = useState<string | null>(null);
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/site-config/logo_url`)
            .then(res => res.json())
            .then(data => { if (data.value) setSiteLogoUrl(data.value); })
            .catch(() => { });
    }, []);

    const handleCloseModal = () => {
        setModalOpen(false);
        if (routeSlug || searchParams.get('play')) {
            navigate('/meditaciones', { replace: true });
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        seek(parseFloat(e.target.value));
    };

    const stopAudio = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        stop();
    };



    if (!playingMeditation) return null;

    const currentLang = i18n.language.split('-')[0];
    const translation = playingMeditation.translations?.[currentLang];
    const displayTitle = translation?.title || playingMeditation.title;
    const isBackgroundMusic = playingMeditation.id === -999;

    // Artwork: for background music use site logo, for meditations use thumbnail or lotus
    const artworkUrl = isBackgroundMusic
        ? (siteLogoUrl ? getImageUrl(siteLogoUrl) : '/logo_icon.webp')
        : playingMeditation.thumbnail_url
            ? getImageUrl(playingMeditation.thumbnail_url)
            : '/logo_icon.webp';

    return (
        <Transition appear show={isModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleCloseModal} initialFocus={playButtonRef}>
                <Transition.Child
                    as="div"
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
                            as="div"
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                            className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all relative border border-bone"
                        >
                            <Dialog.Panel as="div">
                                <button
                                    onClick={handleCloseModal}
                                    className="absolute top-4 right-4 text-bark/40 hover:text-bark/80 transition-colors z-20"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>

                                <div className="flex flex-col items-center text-center relative z-10">
                                    {/* Blurred Background for Mobile/Premium feel */}
                                    <div className="absolute -inset-8 -z-10 overflow-hidden rounded-3xl opacity-20 blur-2xl transition-opacity">
                                        <img
                                            src={artworkUrl}
                                            alt=""
                                            className="w-full h-full object-cover scale-150"
                                        />
                                    </div>

                                    {/* Dynamic background for the whole panel on mobile */}
                                    <div className="absolute inset-0 -z-20 md:hidden overflow-hidden rounded-3xl opacity-10">
                                        <img
                                            src={artworkUrl}
                                            alt=""
                                            className="w-full h-full object-cover blur-md scale-110"
                                        />
                                    </div>

                                    <div className="w-48 h-48 rounded-2xl shadow-xl mb-8 overflow-hidden bg-matcha/20 relative z-20">
                                        <img
                                            src={artworkUrl}
                                            alt={displayTitle}
                                            className={`w-full h-full ${isBackgroundMusic ? 'object-contain p-4' : 'object-cover'}`}
                                            onError={(e) => { e.currentTarget.src = '/logo_icon.webp'; }}
                                        />
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
                                    <div className="flex flex-col w-full gap-6">
                                        <div className="flex items-center justify-between w-full">
                                            <VolumeControl
                                                volume={volume}
                                                isMuted={isMuted}
                                                onVolumeChange={setVolume}
                                                onMuteToggle={() => setIsMuted(!isMuted)}
                                            />

                                            <div className="flex items-center gap-4">
                                                <ShareButton
                                                    url={`/meditaciones/${playingMeditation.slug || ''}${searchParams.get('play') ? '?play=true' : ''}`}
                                                    title={displayTitle}
                                                    text={t('meditations.share_text', 'Escucha esta meditación en Arunachala Yoga')}
                                                    className="text-forest hover:text-matcha transition-colors flex items-center gap-2"
                                                    iconClassName="w-5 h-5"
                                                    showLabel={true}
                                                />

                                                <button
                                                    onClick={stopAudio}
                                                    className="text-red-500/60 hover:text-red-500 transition-colors uppercase text-[10px] font-bold tracking-widest"
                                                >
                                                    {t('meditations.stop')}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-8">
                                            <button
                                                onClick={previous}
                                                disabled={playlist.length <= 1}
                                                className="text-forest/40 hover:text-forest disabled:opacity-20 transition-all active:scale-95"
                                                title="Anterior"
                                            >
                                                <BackwardIcon className="w-10 h-10" />
                                            </button>

                                            <button
                                                ref={playButtonRef}
                                                onClick={() => isPlaying ? pause() : play(playingMeditation)}
                                                className="bg-forest text-white rounded-full p-6 shadow-xl hover:scale-105 active:scale-95 transition-all outline-none"
                                            >
                                                {isPlaying ? (
                                                    <PauseCircleIcon className="w-12 h-12" />
                                                ) : (
                                                    <PlayCircleIcon className="w-12 h-12" />
                                                )}
                                            </button>

                                            <button
                                                onClick={next}
                                                disabled={playlist.length <= 1}
                                                className="text-forest/40 hover:text-forest disabled:opacity-20 transition-all active:scale-95"
                                                title="Siguiente"
                                            >
                                                <ForwardIcon className="w-10 h-10" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default MeditationPlayerModal;
