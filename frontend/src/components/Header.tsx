import React from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import logo from '../assets/images/logo_transparent_v2.webp';
import christmasLogo from '../assets/images/arunachala-yoga-navidad-logo.webp';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowsPointingOutIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL } from '../config';
import { isChristmasSeason } from '../utils/dateUtils';
import { getImageUrl } from '../utils/imageUtils';

const LANGUAGES = [
    { code: 'es', label: 'ES' },
    { code: 'ca', label: 'CA' },
    { code: 'en', label: 'EN' }
];

const Header: React.FC = () => {
    const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
    const [hasPromotions, setHasPromotions] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [showVolume, setShowVolume] = React.useState(false);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    // Automatically detect Christmas mode based on date
    const isChristmas = isChristmasSeason();

    const {
        playingMeditation,
        isPlaying,
        play,
        pause,
        stop,
        next,
        previous,
        playlist,
        volume,
        isMuted,
        isMeditationInView,
        setVolume,
        setIsMuted,
        setIsPlayerModalOpen
    } = useAudio();

    React.useEffect(() => {
        const fetchLogo = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/site-config/logo_url`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.value) setLogoUrl(getImageUrl(data.value));
                }
            } catch (error) {
                console.error("Error fetching logo:", error);
            }
        };

        const fetchPromotions = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/promotions/`);
                if (response.ok) {
                    const data = await response.json();
                    setHasPromotions(data.length > 0);
                }
            } catch (error) {
                console.error("Error fetching promotions:", error);
            }
        };

        fetchLogo();
        fetchPromotions();
    }, []);

    const handleNavigation = (path: string) => {
        setIsMenuOpen(false);
        const homeContainer = document.getElementById('home-scroll-container');

        if (window.location.pathname === path) {
            if (homeContainer) {
                homeContainer.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            navigate(path);
            // Delay slightly to let the new DOM render before scrolling its specific container
            setTimeout(() => {
                const newHomeContainer = document.getElementById('home-scroll-container');
                if (newHomeContainer) {
                    newHomeContainer.scrollTo(0, 0);
                } else {
                    window.scrollTo(0, 0);
                }
            }, 0);
        }
    };


    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLang = i18n.language.split('-')[0];
    const displayTitle = playingMeditation?.translations?.[currentLang]?.title || playingMeditation?.title;

    // Use the context-provided inView status to decide visibility
    const shouldShowMiniPlayer = !!playingMeditation && !isMeditationInView;


    const isHome = window.location.pathname === '/';

    return (
        <>
            <header className={`${isHome ? 'sticky w-full' : 'fixed left-0 right-0'} top-0 z-50 p-2 lg:py-3 lg:px-8 flex justify-between items-center bg-[#5c6b3c] shadow-md transition-colors duration-300`}>
                {/* Logo Section */}
                <div
                    className={`cursor-pointer flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full border border-[#F5F5DC] transition-transform duration-300 hover:scale-110 shadow-sm ${isChristmas
                        ? 'bg-[#F5F5DC] p-1 md:p-1' // Use same beige as before
                        : 'bg-[#F5F5DC] p-1.5 md:p-1.5'
                        }`}
                    onClick={() => handleNavigation('/')}
                >
                    <img
                        src={isChristmas ? christmasLogo : (logoUrl || logo)}
                        alt="Arunachala Yoga y Terapias - Logo Navidad"
                        className={`w-full h-full object-contain ${isChristmas ? 'mix-blend-multiply' : ''}`}
                        onError={(e) => {
                            if (isChristmas) {
                                // Fallback to normal logo if christmas one is missing
                                e.currentTarget.src = logoUrl || logo;
                                e.currentTarget.parentElement!.className = "cursor-pointer flex items-center justify-center h-16 w-16 md:h-18 md:w-18 rounded-full border border-[#F5F5DC] bg-[#F5F5DC] p-1.5 md:p-1.5 transition-transform duration-300 hover:scale-105 shadow-sm";
                            }
                        }}
                    />
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Mini Player */}
                    <AnimatePresence>
                        {shouldShowMiniPlayer && (

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                className="flex items-center"
                            >
                                {/* Desktop Version */}
                                <div className="hidden lg:flex items-center bg-[#F5F5DC]/10 backdrop-blur-md rounded-full border border-white/20 text-white mr-2 shadow-lg h-10 overflow-hidden">
                                    {/* Controls Group */}
                                    <div className="flex items-center gap-1 px-3 border-r border-white/10 h-full">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); previous(); }}
                                            disabled={playlist.length <= 1}
                                            className="hover:scale-110 transition-transform disabled:opacity-20 p-1"
                                            title="Anterior"
                                        >
                                            <BackwardIcon className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : play(playingMeditation); }}
                                            className="hover:scale-110 transition-transform bg-white/20 p-1.5 rounded-full"
                                        >
                                            {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 pl-0.5" />}
                                        </button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); next(); }}
                                            disabled={playlist.length <= 1}
                                            className="hover:scale-110 transition-transform disabled:opacity-20 p-1"
                                            title="Siguiente"
                                        >
                                            <ForwardIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Info & Volume Group */}
                                    <div className="flex items-center max-w-[250px] px-3 h-full gap-2">
                                        <div className="flex flex-col min-w-[50px] max-w-[120px]">
                                            <span className="text-[10px] font-medium truncate leading-none text-white/90">
                                                {displayTitle}
                                            </span>
                                        </div>

                                        {/* Animated Volume Control */}
                                        <motion.div
                                            className="flex items-center h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                            initial={false}
                                            animate={{ width: showVolume ? 'auto' : '32px' }}
                                            onMouseEnter={() => setShowVolume(true)}
                                            onMouseLeave={() => setShowVolume(false)}
                                        >
                                            <div className="flex items-center px-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                                                    className="text-white hover:text-white transition-opacity flex-shrink-0"
                                                >
                                                    {isMuted ? <SpeakerXMarkIcon className="w-4 h-4 opacity-100" /> : <SpeakerWaveIcon className="w-4 h-4" />}
                                                </button>

                                                <AnimatePresence>
                                                    {showVolume && (
                                                        <motion.div
                                                            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                                                            animate={{ opacity: 1, width: 60, marginLeft: 8 }}
                                                            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                                                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                                            className="flex items-center overflow-hidden"
                                                        >
                                                            <input
                                                                type="range"
                                                                min="0" max="1" step="0.01"
                                                                value={isMuted ? 0 : volume}
                                                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-14 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-white"
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Action Group */}
                                    <div className="flex items-center px-2 gap-1 h-full bg-white/5 border-l border-white/10">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsPlayerModalOpen(true); }}
                                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white"
                                            title="Abrir reproductor"
                                        >
                                            <ArrowsPointingOutIcon className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); stop(); }}
                                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                                            title="Cerrar reproductor"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile/Tablet Version: Improved dual controls */}
                                <div className="lg:hidden flex items-center gap-2 bg-[#F5F5DC] p-1.5 rounded-full shadow-lg border border-[#5c6b3c]/20 mr-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : play(playingMeditation); }}
                                        className="w-8 h-8 flex items-center justify-center bg-[#5c6b3c] text-[#F5F5DC] rounded-full active:scale-90 transition-transform"
                                    >
                                        {isPlaying ? (
                                            <PauseIcon className="w-4 h-4" />
                                        ) : (
                                            <PlayIcon className="w-4 h-4 pl-0.5" />
                                        )}
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsPlayerModalOpen(true); }}
                                        className="w-8 h-8 flex items-center justify-center text-[#5c6b3c]/80 hover:text-[#5c6b3c] active:scale-90 transition-transform"
                                    >
                                        <ArrowsPointingOutIcon className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Language Switcher Mini */}
                    <div className="notranslate flex items-center bg-[#4a5730]/50 backdrop-blur-sm rounded-full p-1 border border-[#F5F5DC]/20 z-50 overflow-hidden relative">
                        {LANGUAGES.map((lang) => {
                            const isActive = i18n.language.startsWith(lang.code);
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`relative z-10 w-8 h-8 flex items-center justify-center text-xs font-bold tracking-wide transition-colors duration-300 ${isActive ? 'text-[#5c6b3c]' : 'text-[#F5F5DC] hover:text-white'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="language-indicator"
                                            className="absolute inset-0 bg-[#F5F5DC] rounded-full shadow-sm -z-10"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    {lang.label}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="relative z-50 text-[#F5F5DC] hover:text-[#becf81] transition-colors p-2"
                        aria-label="Toggle Menu"
                    >
                        <div className={`transition-transform duration-300 ease-in-out ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                            {isMenuOpen ? (
                                <XMarkIcon className="h-10 w-10 md:h-12 md:w-12" />
                            ) : (
                                <Bars3Icon className="h-10 w-10 md:h-12 md:w-12" />
                            )}
                        </div>
                    </button>
                </div>
            </header>

            <div
                className={`fixed top-0 right-0 h-full w-full md:w-96 z-40 bg-[#5c6b3c]/95 backdrop-blur-md shadow-2xl transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col items-center justify-center`}
            >
                <nav className={`flex flex-col gap-8 text-center ${hasPromotions ? 'mt-24' : ''}`}>
                    <button onClick={() => handleNavigation('/quienes-somos')} className="text-[#F5F5DC] font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.about')}</button>
                    <button onClick={() => handleNavigation('/blog')} className="text-[#F5F5DC] font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">Blog</button>
                    <button onClick={() => handleNavigation('/meditaciones')} className="text-[#F5F5DC] font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.meditations')}</button>
                    <button onClick={() => handleNavigation('/actividades')} className="text-[#F5F5DC] font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.activities')}</button>
                    <button onClick={() => handleNavigation('/nuestro-espacio')} className="text-[#F5F5DC] font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.space', 'Nuestro Espacio')}</button>
                    <button onClick={() => handleNavigation('/contacto')} className="text-[#F5F5DC] font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.contact')}</button>

                    {/* Added Promociones apartada y en color marrón - Only if active promotions exist */}
                    {hasPromotions && (
                        <div className="mt-0 pt-5 border-t border-[#F5F5DC]/10 flex flex-col items-center">
                            <button
                                onClick={() => handleNavigation('/promociones')}
                                className="text-white bg-bark/40 hover:bg-bark px-8 py-3 rounded-full font-headers text-4xl hover:text-bone transition-all hover:scale-105 transform duration-300 uppercase border border-white/20"
                            >
                                {t('menu.promotions', 'Promociones')}
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </>
    );
};

export default Header;
