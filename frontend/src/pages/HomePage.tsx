import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; // v2 imports
import videoBg from '../assets/videos/VIDEOWEB.mov';
import logo from '../assets/images/logo_transparent.webp';

const HomePage: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="font-body text-bark relative">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full z-50 p-4 flex justify-between items-center bg-bone shadow-md">
                <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <img src={logo} alt="Arunachala" className="h-16 w-auto" />
                </div>

                {/* Mobile Menu Button (Always visible as requested 'mobile phone format') */}
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="text-forest hover:text-matcha transition-colors"
                >
                    <Bars3Icon className="h-8 w-8" />
                </button>
            </header>

            {/* Slide-out Menu */}
            <div className={`fixed inset-0 z-50 bg-bark/95 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col items-center justify-center`}>
                <button
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute top-6 right-6 text-bone hover:text-matcha"
                >
                    <XMarkIcon className="h-10 w-10" />
                </button>
                <nav className="flex flex-col gap-8 text-center bg-transparent">
                    <button onClick={() => { setIsMenuOpen(false); scrollToSection('yoga'); }} className="text-bone font-headers text-4xl hover:text-matcha transition">YOGA</button>
                    <button onClick={() => { setIsMenuOpen(false); scrollToSection('therapies'); }} className="text-bone font-headers text-4xl hover:text-matcha transition">MASAJES</button>
                    <button onClick={() => { setIsMenuOpen(false); }} className="text-bone font-headers text-4xl hover:text-matcha transition">CONTACT</button>
                </nav>
            </div>

            {/* Hero Section with Video */}
            <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    src={videoBg}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                {/* Overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-black/30"></div>

                {/* Main Options */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl px-4 text-center">
                    <div
                        onClick={() => scrollToSection('yoga')}
                        className="group cursor-pointer p-8 border-2 border-transparent hover:border-bone/50 rounded-xl transition-all duration-500 bg-black/20 hover:bg-black/40 backdrop-blur-sm"
                    >
                        <h2 className="text-4xl md:text-6xl font-headers text-bone mb-4 group-hover:scale-110 transition-transform duration-500">YOGA</h2>
                        <p className="text-bone/80 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                            Muévete y respira
                        </p>
                    </div>

                    <div
                        onClick={() => scrollToSection('therapies')}
                        className="group cursor-pointer p-8 border-2 border-transparent hover:border-bone/50 rounded-xl transition-all duration-500 bg-black/20 hover:bg-black/40 backdrop-blur-sm"
                    >
                        <h2 className="text-4xl md:text-6xl font-headers text-bone mb-4 group-hover:scale-110 transition-transform duration-500">MASAJES</h2>
                        <p className="text-bone/80 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                            Recupera tu bienestar
                        </p>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-bone/70">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Content Sections */}
            <main className="bg-bone relative z-10">
                <section id="yoga" className="py-20 px-8 max-w-7xl mx-auto border-b border-bark/10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <h2 className="text-5xl font-headers text-forest mb-6">Yoga Schedule</h2>
                            <p className="text-xl leading-relaxed mb-6">
                                Explore our variety of yoga classes designed to help you find balance and peace.
                                Whether you act from the body or the breath, our space is yours.
                            </p>
                            <button className="bg-forest text-bone font-bold py-3 px-8 rounded-full hover:bg-matcha hover:text-forest transition-all duration-300 shadow-lg">
                                View Full Schedule
                            </button>
                        </div>
                        <div className="md:w-1/2 h-64 bg-matcha/20 rounded-2xl flex items-center justify-center">
                            {/* Placeholder for Yoga Image */}
                            <span className="text-forest/50 font-headers">Yoga Image Placeholder</span>
                        </div>
                    </div>
                </section>

                <section id="therapies" className="py-20 px-8 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                        <div className="md:w-1/2 text-right md:text-left">
                            <h2 className="text-5xl font-headers text-forest mb-6">Therapies</h2>
                            <p className="text-xl leading-relaxed mb-6">
                                Discover healing therapies tailored to your individual needs.
                                Reconnect with your inner self through our guided sessions.
                            </p>
                            <button className="bg-forest text-bone font-bold py-3 px-8 rounded-full hover:bg-matcha hover:text-forest transition-all duration-300 shadow-lg">
                                Book a Session
                            </button>
                        </div>
                        <div className="md:w-1/2 h-64 bg-forest/20 rounded-2xl flex items-center justify-center">
                            {/* Placeholder for Therapy Image */}
                            <span className="text-forest/50 font-headers">Therapy Image Placeholder</span>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-bark text-bone py-12 text-center">
                <p>&copy; 2024 Arunachala Web. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;
