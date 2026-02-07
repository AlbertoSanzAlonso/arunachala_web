import React from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import logo from '../assets/images/logo_transparent_v2.webp';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const LANGUAGES = [
    { code: 'es', label: 'ES' },
    { code: 'ca', label: 'CA' },
    { code: 'en', label: 'EN' }
];

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const handleNavigation = (path: string) => {
        handleLinkClick();
        navigate(path);
    };

    const handleLinkClick = () => {
        setIsMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full z-50 p-4 md:py-3 md:px-8 flex justify-between items-center bg-[#5c6b3c] shadow-md transition-colors duration-300">
                <div className="cursor-pointer" onClick={() => handleNavigation('/')}>
                    <img
                        src={logo}
                        alt="Arunachala"
                        className="h-16 w-16 md:h-20 md:w-20 rounded-full object-contain border border-[#F5F5DC] bg-[#F5F5DC] transition-transform duration-300 hover:scale-105"
                    />
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Switcher Mini */}
                    {/* Language Switcher Mini */}
                    <div className="flex items-center bg-[#4a5730]/50 backdrop-blur-sm rounded-full p-1 border border-[#F5F5DC]/20 mr-2 z-50 overflow-hidden relative">
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
                <nav className="flex flex-col gap-10 text-center">
                    <button onClick={() => handleNavigation('/nuestro-espacio')} className="text-[#F5F5DC] font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.space', 'Nuestro Espacio')}</button>
                    <button onClick={() => handleNavigation('/blog')} className="text-[#F5F5DC] font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">Blog</button>
                    <button onClick={() => handleNavigation('/meditaciones')} className="text-[#F5F5DC] font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.meditations')}</button>
                    <button onClick={() => handleNavigation('/actividades')} className="text-[#F5F5DC] font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.activities')}</button>
                    <button onClick={() => handleNavigation('/quienes-somos')} className="text-[#F5F5DC] font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.about')}</button>
                    <button onClick={() => handleNavigation('/contacto')} className="text-[#F5F5DC] font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.contact')}</button>

                    {/* Mobile Language Switcher */}
                    <div className="flex gap-6 mt-8 md:hidden">
                        <button onClick={() => changeLanguage('es')} className={`text-xl font-body ${i18n.language.startsWith('es') ? 'text-matcha font-bold' : 'text-[#F5F5DC]'}`}>ES</button>
                        <button onClick={() => changeLanguage('ca')} className={`text-xl font-body ${i18n.language.startsWith('ca') ? 'text-matcha font-bold' : 'text-[#F5F5DC]'}`}>CA</button>
                        <button onClick={() => changeLanguage('en')} className={`text-xl font-body ${i18n.language.startsWith('en') ? 'text-matcha font-bold' : 'text-[#F5F5DC]'}`}>EN</button>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Header;
