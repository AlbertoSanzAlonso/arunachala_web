import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomeIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const FloatingNav: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are in a dashboard or auth page where we might NOT want this
    const isExcludedPath =
        location.pathname.startsWith('/dashboard') ||
        location.pathname.startsWith('/login') ||
        location.pathname.startsWith('/forgot-password') ||
        location.pathname.startsWith('/reset-password');

    useEffect(() => {
        const handleScroll = () => {
            const container = 
                document.getElementById('home-scroll-container') || 
                document.getElementById('yoga-scroll-container') || 
                document.getElementById('therapies-scroll-container');
            
            const scrollY = container ? container.scrollTop : window.scrollY;
            
            if (scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        const container = 
            document.getElementById('home-scroll-container') || 
            document.getElementById('yoga-scroll-container') || 
            document.getElementById('therapies-scroll-container');

        if (container) {
            container.addEventListener('scroll', handleScroll, { passive: true });
        }
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (container) container.removeEventListener('scroll', handleScroll);
        };
    }, [location.pathname]);

    const scrollToTop = () => {
        const container = 
            document.getElementById('home-scroll-container') || 
            document.getElementById('yoga-scroll-container') || 
            document.getElementById('therapies-scroll-container');

        if (container) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (isExcludedPath) return null;

    // On Home page, we only show "Back to Top" (since we are already at Home)
    const isHome = location.pathname === '/';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    className="fixed bottom-8 right-6 z-[60] flex flex-col gap-3 pointer-events-none"
                >
                    <div className="flex flex-col gap-3 pointer-events-auto">
                        {/* Volver al Inicio (Home) */}
                        {!isHome && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate('/')}
                                className="group relative flex items-center justify-center p-4 bg-white text-forest rounded-full shadow-2xl border border-forest/10 hover:bg-forest hover:text-white transition-all duration-300"
                                aria-label={t('common.back_home')}
                            >
                                <HomeIcon className="h-6 w-6" />
                                <span className="absolute right-full mr-3 px-3 py-1.5 bg-forest text-white text-xs font-headers uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
                                    {t('common.back_home')}
                                </span>
                            </motion.button>
                        )}

                        {/* Volver Arriba */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={scrollToTop}
                            className="group relative flex items-center justify-center p-4 bg-forest text-white rounded-full shadow-2xl hover:bg-matcha transition-all duration-300"
                            aria-label={t('yoga.common.back_to_top')}
                        >
                            <ChevronUpIcon className="h-6 w-6" />
                            <span className="absolute right-full mr-3 px-3 py-1.5 bg-forest text-white text-xs font-headers uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
                                {t('yoga.common.back_to_top')}
                            </span>
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FloatingNav;
