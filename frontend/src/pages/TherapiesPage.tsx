import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

import BackButton from '../components/BackButton';

import lotusFlower from '../assets/images/lotus_flower.png';

const TherapiesPage: React.FC = () => {
    return (
        <div className="font-body text-bark min-h-screen flex flex-col pt-24">
            <Header />
            <main className="flex-grow bg-bone">
                <section className="py-20 px-8 max-w-7xl mx-auto">
                    <BackButton />
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                        <div className="md:w-1/2 text-right md:text-left">
                            <h2 className="text-5xl font-headers text-forest mb-6">Terapias y Masajes</h2>
                            <p className="text-xl leading-relaxed mb-6">
                                Descubre terapias curativas adaptadas a tus necesidades individuales.
                                Reconecta con tu ser interior a través de nuestras sesiones guiadas.
                            </p>
                            <button className="bg-forest text-bone font-bold py-3 px-8 rounded-full hover:bg-matcha hover:text-forest transition-all duration-300 shadow-lg">
                                Reservar Sesión
                            </button>
                        </div>
                        <div className="md:w-1/2 h-64 bg-forest/20 rounded-2xl flex items-center justify-center p-8">
                            <img src={lotusFlower} alt="Lotus Flower" className="h-32 w-auto opacity-50 animate-pulse" />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default TherapiesPage;
