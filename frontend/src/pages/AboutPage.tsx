import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { AcademicCapIcon, SparklesIcon, HeartIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import instructorImg from '../assets/images/susana_portrait.webp';

const AboutPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <Helmet>
                <title>{t('about.seo.title')}</title>
                <meta name="description" content={t('about.seo.description')} />
            </Helmet>

            <Header />

            <main className="flex-grow pt-32 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="mb-8 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        <BackButton />
                    </div>

                    {/* Hero Section */}
                    <div className="flex flex-col items-center mb-24">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-headers text-forest text-center mb-12 uppercase tracking-wider pt-12 md:pt-0"
                        >
                            {t('about.title')}
                        </motion.h1>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-matcha/20 rounded-full blur-3xl group-hover:bg-matcha/30 transition-all duration-500" />
                                <div className="relative w-64 h-64 md:w-96 md:h-96 mx-auto rounded-full overflow-hidden border-8 border-white shadow-2xl">
                                    <img
                                        src={instructorImg}
                                        alt="Susana Pérez Gil"
                                        className="w-full h-full object-cover object-center grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl md:text-4xl font-headers text-matcha">
                                    {t('about.subtitle')}
                                </h2>
                                <p className="text-2xl font-headers text-forest/80 italic">
                                    {t('about.mission')}
                                </p>
                                <div className="h-1 w-20 bg-matcha rounded-full" />
                                <p className="text-lg leading-relaxed text-bark/90 font-light">
                                    {t('about.intro')}
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <section className="mb-24 bg-white/40 p-10 md:p-16 rounded-[3rem] shadow-sm border border-white/50">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <h3 className="text-3xl font-headers text-forest text-center">
                                    {t('about.path_title')}
                                </h3>
                                <p className="text-lg leading-relaxed text-bark/90 text-center">
                                    {t('about.path_p1')}
                                </p>
                            </motion.div>
                        </div>
                    </section>

                    {/* Specialties Section */}
                    <section className="mb-24">
                        <h3 className="text-3xl md:text-4xl font-headers text-forest text-center mb-16">
                            {t('about.specialties_title')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <HeartIcon className="w-8 h-8" />,
                                    title: t('about.cat_manual'),
                                    desc: t('about.cat_manual_desc'),
                                    delay: 0.1
                                },
                                {
                                    icon: <SparklesIcon className="w-8 h-8" />,
                                    title: t('about.cat_subtle'),
                                    desc: t('about.cat_subtle_desc'),
                                    delay: 0.2
                                },
                                {
                                    icon: <AcademicCapIcon className="w-8 h-8" />,
                                    title: t('about.cat_yoga'),
                                    desc: t('about.cat_yoga_desc'),
                                    delay: 0.3
                                }
                            ].map((spec, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: spec.delay }}
                                    viewport={{ once: true }}
                                    className="bg-white p-8 rounded-3xl shadow-lg border border-bone hover:border-matcha/30 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                                >
                                    <div className="p-4 bg-bone rounded-2xl text-matcha mb-6">
                                        {spec.icon}
                                    </div>
                                    <h4 className="text-xl font-headers text-forest mb-4 uppercase tracking-wider">{spec.title}</h4>
                                    <p className="text-bark/80 leading-relaxed italic">{spec.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-16 max-w-2xl mx-auto text-center font-headers text-xl text-forest/70 italic"
                        >
                            {t('about.approach')}
                        </motion.div>
                    </section>

                    {/* Arunachala Origin */}
                    <section className="mb-24 relative overflow-hidden rounded-[3rem] bg-forest text-white p-12 md:p-24 shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-matcha/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <h3 className="text-4xl font-headers text-matcha">
                                    {t('about.arunachala_title')}
                                </h3>
                                <p className="text-lg md:text-xl leading-relaxed font-light text-bone/90">
                                    {t('about.arunachala_p1')}
                                </p>
                                <div className="pt-8 text-2xl md:text-3xl font-headers border-t border-matcha/30 tracking-widest text-matcha">
                                    {t('about.mantra')}
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 italic text-center">
                                <p className="text-2xl md:text-3xl font-headers leading-relaxed">
                                    {t('about.quote')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="text-center max-w-3xl mx-auto py-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <h3 className="text-3xl md:text-4xl font-headers text-forest tracking-wider">
                                {t('about.cta_title')}
                            </h3>
                            <p className="text-xl text-bark/80 leading-relaxed font-light">
                                {t('about.cta_p1')}
                            </p>
                            <div className="pt-8">
                                <button
                                    onClick={() => navigate('/contacto')}
                                    className="px-12 py-4 bg-forest text-white rounded-full font-headers text-xl tracking-widest hover:bg-matcha hover:scale-105 transition-all duration-300 shadow-xl"
                                >
                                    {t('menu.contact')}
                                </button>
                            </div>
                        </motion.div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;
