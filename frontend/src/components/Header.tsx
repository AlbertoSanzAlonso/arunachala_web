import React from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import logo from '../assets/images/logo_transparent.webp';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
            <header className="fixed top-0 left-0 w-full z-50 p-4 md:py-3 md:px-8 flex justify-between items-center bg-bone shadow-md">
                <div className="cursor-pointer" onClick={() => handleNavigation('/')}>
                    <img src={logo} alt="Arunachala" className="h-16 md:h-20 w-auto" />
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Switcher Mini */}
                    <div className="flex gap-2 text-sm font-medium text-forest mr-2 z-50">
                        <button onClick={() => changeLanguage('es')} className={`hover:text-matcha ${i18n.language.startsWith('es') ? 'font-bold underline' : ''}`}>ES</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => changeLanguage('ca')} className={`hover:text-matcha ${i18n.language.startsWith('ca') ? 'font-bold underline' : ''}`}>CA</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => changeLanguage('en')} className={`hover:text-matcha ${i18n.language.startsWith('en') ? 'font-bold underline' : ''}`}>EN</button>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="relative z-50 text-forest hover:text-matcha transition-colors p-2"
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
                className={`fixed top-0 right-0 h-full w-full md:w-96 z-40 bg-bark/95 backdrop-blur-md shadow-2xl transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col items-center justify-center`}
            >
                <nav className="flex flex-col gap-10 text-center">
                    <button onClick={() => handleNavigation('/nuestro-espacio')} className="text-bone font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.space', 'Nuestro Espacio')}</button>
                    <button onClick={() => handleNavigation('/blog')} className="text-bone font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">Blog</button>
                    <button onClick={() => handleNavigation('/actividades')} className="text-bone font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.activities')}</button>
                    <button onClick={() => handleNavigation('/quienes-somos')} className="text-bone font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.about')}</button>
                    <button onClick={() => handleNavigation('/contacto')} className="text-bone font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">{t('menu.contact')}</button>

                    {/* Mobile Language Switcher */}
                    <div className="flex gap-6 mt-8 md:hidden">
                        <button onClick={() => changeLanguage('es')} className={`text-xl font-body ${i18n.language.startsWith('es') ? 'text-matcha font-bold' : 'text-bone'}`}>ES</button>
                        <button onClick={() => changeLanguage('ca')} className={`text-xl font-body ${i18n.language.startsWith('ca') ? 'text-matcha font-bold' : 'text-bone'}`}>CA</button>
                        <button onClick={() => changeLanguage('en')} className={`text-xl font-body ${i18n.language.startsWith('en') ? 'text-matcha font-bold' : 'text-bone'}`}>EN</button>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Header;
