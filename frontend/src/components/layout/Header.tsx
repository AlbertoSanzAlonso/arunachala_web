import React from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import logo from 'assets/images/logo_transparent_v2.webp';
import christmasLogo from 'assets/images/arunachala-yoga-navidad-logo.webp';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from 'context/AudioContext';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowsPointingOutIcon, ForwardIcon, BackwardIcon, ShareIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL } from 'config';
import { isChristmasSeason } from 'utils/dateUtils';
import { getImageUrl } from 'utils/imageUtils';
import { useUIStore } from 'store/uiStore';

const LANGUAGES = [
    { code: 'es', label: 'ES' },
    { code: 'ca', label: 'CA' },
    { code: 'en', label: 'EN' }
];

function measureScrollGutter() {
    const scroller =
        document.getElementById('home-scroll-container') ||
        document.getElementById('yoga-scroll-container') ||
        document.getElementById('therapies-scroll-container');
    // En el scroll de la ventana, un `fixed` ya queda a la izquierda de la barra.
    // En home, yoga y terapias la barra es del contenedor interno y el menú la tapa.
    if (!scroller) return 0;
    return Math.max(0, scroller.offsetWidth - scroller.clientWidth);
}

const Header: React.FC = () => {
    const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
    const [hasPromotions, setHasPromotions] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [scrollGutter, setScrollGutter] = React.useState(0);
    const [showVolume, setShowVolume] = React.useState(false);
    const { t, i18n } = useTranslation();
    const { addToast } = useUIStore();

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

    React.useEffect(() => {
        const update = () => setScrollGutter(measureScrollGutter());
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [isMenuOpen]);

    const scrollToTop = () => {
        const homeContainer = document.getElementById('home-scroll-container');
        if (homeContainer) {
            homeContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNavLinkClick = (path: string) => (e: React.MouseEvent) => {
        const normalizedPath = path.endsWith('/') ? path : `${path}/`;
        const currentPath = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;

        if (currentPath === normalizedPath || (path === '/' && currentPath === '/')) {
            e.preventDefault();
            setIsMenuOpen(false);
            scrollToTop();
        } else {
            setIsMenuOpen(false);
        }
    };


    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLang = i18n.language.split('-')[0];
    const displayTitle = playingMeditation?.translations?.[currentLang]?.title || playingMeditation?.title;

    // Use the context-provided inView status to decide visibility
    const shouldShowMiniPlayer = !!playingMeditation && !isMeditationInView;

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!playingMeditation) return;

        const shareUrl = `${window.location.origin}/meditaciones/${playingMeditation.slug || ''}`;
        const title = playingMeditation.title;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: t('meditations.share_text', 'Escucha esta meditación en Arunachala Yoga'),
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
        <>
            <header className="sticky top-0 w-full z-50 px-2 py-3 short:py-2.5 short:px-3 lg:py-4 lg:px-8 flex justify-between items-center bg-[#5c6b3c] shadow-md transition-colors duration-300">
                {/* Logo Section */}
                <Link
                    to="/"
                    onClick={handleNavLinkClick('/')}
                    className={`cursor-pointer flex-shrink-0 flex items-center justify-center h-12 w-12 short:h-9 short:w-9 md:h-16 md:w-16 short:md:h-11 short:md:w-11 lg:h-[70px] lg:w-[70px] short:lg:h-12 short:lg:w-12 rounded-full border border-[#F5F5DC] transition-transform duration-300 hover:scale-110 shadow-sm ${isChristmas
                        ? 'bg-[#F5F5DC] p-1 md:p-1 short:p-0.5' // Use same beige as before
                        : 'bg-[#F5F5DC] p-1.5 md:p-1.5 short:p-1'
                        }`}
                >
                    <img
                        src={isChristmas ? christmasLogo : (logoUrl || logo)}
                        alt="Arunachala Yoga y Terapias - Logo"
                        className={`w-full h-full object-contain ${isChristmas ? 'mix-blend-multiply' : ''}`}
                        onError={(e) => {
                            if (isChristmas) {
                                e.currentTarget.src = logoUrl || logo;
                            }
                        }}
                    />
                </Link>

                {/* Right Side Controls */}
                <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0 flex-1 justify-end">
                    {/* Mini Player */}
                    <AnimatePresence>
                        {shouldShowMiniPlayer && (

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                className="flex items-center min-w-0"
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
                                            onClick={handleShare}
                                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white"
                                            title={t('common.share', 'Compartir')}
                                        >
                                            <ShareIcon className="w-4 h-4" />
                                        </button>

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
                                <div className="lg:hidden flex items-center gap-0.5 sm:gap-2 bg-[#F5F5DC] p-1 sm:p-1.5 rounded-full shadow-lg border border-[#5c6b3c]/20 mr-1 overflow-hidden relative group min-w-0">
                                    {/* Sublte BG Image */}
                                    {playingMeditation?.thumbnail_url && (
                                        <div className="absolute inset-x-0 inset-y-0 opacity-10 pointer-events-none -z-10">
                                            <img
                                                src={getImageUrl(playingMeditation.thumbnail_url)}
                                                alt=""
                                                className="w-full h-full object-cover blur-sm scale-150"
                                            />
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : play(playingMeditation); }}
                                        className="w-8 h-8 flex items-center justify-center bg-[#5c6b3c] text-[#F5F5DC] rounded-full active:scale-90 transition-transform relative z-10"
                                    >
                                        {isPlaying ? (
                                            <PauseIcon className="w-4 h-4" />
                                        ) : (
                                            <PlayIcon className="w-4 h-4 pl-0.5" />
                                        )}
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        className="w-8 h-8 flex items-center justify-center text-[#5c6b3c]/80 hover:text-[#5c6b3c] active:scale-90 transition-transform relative z-10"
                                        title={t('common.share', 'Compartir')}
                                    >
                                        <ShareIcon className="w-4.5 h-4.5" />
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsPlayerModalOpen(true); }}
                                        className="w-8 h-8 flex items-center justify-center text-[#5c6b3c]/80 hover:text-[#5c6b3c] active:scale-90 transition-transform relative z-10"
                                    >
                                        <ArrowsPointingOutIcon className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Language Switcher Mini */}
                    <div className="notranslate flex items-center bg-[#4a5730]/50 backdrop-blur-sm rounded-full p-1 short:p-0.5 border border-[#F5F5DC]/20 z-50 overflow-hidden relative">
                        {LANGUAGES.map((lang) => {
                            const isActive = i18n.language.startsWith(lang.code);
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`relative z-10 w-8 h-8 short:w-7 short:h-7 flex items-center justify-center text-xs short:text-[10px] font-bold tracking-wide transition-colors duration-300 ${isActive ? 'text-[#5c6b3c]' : 'text-[#F5F5DC] hover:text-white'
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
                        className="relative z-50 text-[#F5F5DC] hover:text-[#becf81] transition-colors p-2 short:p-1"
                        aria-label="Toggle Menu"
                    >
                        <div className={`transition-transform duration-300 ease-in-out ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                            {isMenuOpen ? (
                                <XMarkIcon className="h-10 w-10 short:h-8 short:w-8 md:h-12 md:w-12 short:md:h-9 short:md:w-9" />
                            ) : (
                                <Bars3Icon className="h-10 w-10 short:h-8 short:w-8 md:h-12 md:w-12 short:md:h-9 short:md:w-9" />
                            )}
                        </div>
                    </button>
                </div>
            </header>

            <div
                style={{ right: scrollGutter }}
                className="pointer-events-none fixed top-0 left-0 z-[49] h-full overflow-hidden md:left-auto md:w-96"
            >
            <div
                className={`flex h-full w-full flex-col items-center justify-center bg-[#5c6b3c]/95 shadow-2xl backdrop-blur-md transition-transform duration-500 short:justify-start short:overflow-y-auto short:pt-20 ${isMenuOpen ? 'pointer-events-auto translate-x-0' : 'translate-x-full'}`}
            >
                <nav className={`flex w-full flex-col gap-6 px-6 text-center md:gap-8 short:gap-3.5 ${hasPromotions ? 'mt-24 short:mt-4' : 'short:mt-2'}`}>
                    <Link to="/quienes-somos" onClick={handleNavLinkClick('/quienes-somos')} className="text-[#F5F5DC] font-headers text-2xl md:text-4xl short:text-2xl min-w-0 max-w-full px-2 hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.about')}</Link>
                    <Link to="/blog" onClick={handleNavLinkClick('/blog')} className="text-[#F5F5DC] font-headers text-2xl md:text-4xl short:text-2xl min-w-0 max-w-full px-2 hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">Blog</Link>
                    <Link to="/meditaciones" onClick={handleNavLinkClick('/meditaciones')} className="text-[#F5F5DC] font-headers text-2xl md:text-4xl short:text-2xl min-w-0 max-w-full px-2 hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.meditations')}</Link>
                    <Link to="/actividades" onClick={handleNavLinkClick('/actividades')} className="text-[#F5F5DC] font-headers text-2xl md:text-4xl short:text-2xl min-w-0 max-w-full px-2 hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.activities')}</Link>
                    <Link to="/nuestro-espacio" onClick={handleNavLinkClick('/nuestro-espacio')} className="text-[#F5F5DC] font-headers text-2xl md:text-4xl short:text-2xl min-w-0 max-w-full px-2 hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.space', 'Nuestro Espacio')}</Link>
                    <Link to="/contacto" onClick={handleNavLinkClick('/contacto')} className="text-[#F5F5DC] font-headers text-2xl md:text-4xl short:text-2xl min-w-0 max-w-full px-2 hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.contact')}</Link>
                    <Link to="/preguntas-frecuentes" onClick={handleNavLinkClick('/preguntas-frecuentes')} className="text-[#F5F5DC] font-headers text-2xl md:text-4xl short:text-2xl min-w-0 max-w-full px-2 hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.faq')}</Link>

                    {/* Added Promociones apartada y en color marrón - Only if active promotions exist */}
                    {hasPromotions && (
                        <div className="mt-0 pt-5 short:pt-3 border-t border-[#F5F5DC]/10 flex flex-col items-center">
                            <Link
                                to="/promociones"
                                onClick={handleNavLinkClick('/promociones')}
                                className="text-white bg-bark/40 hover:bg-bark px-6 py-2.5 md:px-8 md:py-3 short:px-5 short:py-2 rounded-full font-headers text-2xl md:text-4xl short:text-2xl hover:text-bone transition-all hover:scale-105 transform duration-300 uppercase border border-white/20 max-w-full"
                            >
                                {t('menu.promotions', 'Promociones')}
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
            </div>
        </>
    );
};

export default Header;
