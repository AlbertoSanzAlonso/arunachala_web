import React from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import logo from '../assets/images/logo_transparent.webp';
import { useNavigate, Link } from 'react-router-dom';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        handleLinkClick();
        navigate(path);
    };

    const handleLinkClick = () => {
        setIsMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full z-50 p-4 md:py-3 md:px-8 flex justify-between items-center bg-bone shadow-md">
                <div className="cursor-pointer" onClick={() => handleNavigation('/')}>
                    <img src={logo} alt="Arunachala" className="h-16 md:h-20 w-auto" />
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
            </header>

            <div
                className={`fixed top-0 right-0 h-full w-full md:w-96 z-40 bg-bark/95 backdrop-blur-md shadow-2xl transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col items-center justify-center`}
            >
                <nav className="flex flex-col gap-10 text-center">
                    <Link to="/yoga" onClick={handleLinkClick} className="text-bone font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300">YOGA</Link>
                    <Link to="/masajes-y-terapias" onClick={handleLinkClick} className="text-bone font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300 uppercase">Masaje y terapias</Link>
                    <Link to="/contact" onClick={handleLinkClick} className="text-bone font-headers text-4xl hover:text-matcha transition-all hover:scale-105 transform duration-300">CONTACTO</Link>
                </nav>
            </div>
        </>
    );
};

export default Header;
