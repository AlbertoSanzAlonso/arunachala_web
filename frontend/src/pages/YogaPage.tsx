import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

import BackButton from '../components/BackButton';

import omSymbol from '../assets/images/om_symbol.png';
import YogaSchedule from '../components/YogaSchedule';

const YogaPage: React.FC = () => {
    return (
        <div className="font-body text-bark min-h-screen flex flex-col pt-24">
            <Header />
            <main className="flex-grow bg-bone">
                <section className="py-20 px-8 max-w-7xl mx-auto">
                    <BackButton />
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <h2 className="text-5xl font-headers text-forest mb-6">Horarios de Yoga</h2>
                            <p className="text-xl leading-relaxed mb-6">
                                Explora nuestra variedad de clases de yoga diseñadas para ayudarte a encontrar equilibrio y paz.
                                Ya sea que actúes desde el cuerpo o la respiración, nuestro espacio es tuyo.
                            </p>
                        </div>
                        <div className="md:w-1/2 h-64 bg-matcha/20 rounded-2xl flex items-center justify-center p-8">
                            <img src={omSymbol} alt="Om Symbol" className="h-32 w-auto opacity-50 animate-pulse" />
                        </div>
                    </div>
                </section>

                <section className="bg-white/50 py-12">
                    <YogaSchedule />
                </section>
            </main>
            <Footer />
        </div >
    );
};

export default YogaPage;
