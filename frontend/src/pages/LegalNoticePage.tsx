import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ScaleIcon, ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';

const LegalNoticePage: React.FC = () => {
    const { t } = useTranslation();

    const sections = [
        {
            icon: <DocumentTextIcon className="w-8 h-8" />,
            title: t('legal.sections.identification.title'),
            content: [
                { label: t('legal.sections.identification.company'), value: t('legal.sections.identification.company_value') },
                { label: t('legal.sections.identification.cif'), value: t('legal.sections.identification.cif_value') },
                { label: t('legal.sections.identification.address'), value: t('legal.sections.identification.address_value') },
                { label: t('legal.sections.identification.email'), value: 'yogayterapiasarunachala@gmail.com', isEmail: true },
                { label: t('legal.sections.identification.phone'), value: '+34 678 481 971', isPhone: true }
            ]
        },
        {
            icon: <ScaleIcon className="w-8 h-8" />,
            title: t('legal.sections.object.title'),
            content: t('legal.sections.object.content')
        },
        {
            icon: <ShieldCheckIcon className="w-8 h-8" />,
            title: t('legal.sections.conditions.title'),
            content: t('legal.sections.conditions.content')
        }
    ];

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <Helmet>
                <title>{t('legal.seo.title')}</title>
                <meta name="description" content={t('legal.seo.description')} />
            </Helmet>

            <Header />

            <main className="flex-grow pt-40 md:pt-48 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="-mt-8 md:-mt-16 mb-8 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        <BackButton />
                    </div>

                    {/* Hero Section */}
                    <div className="flex flex-col items-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-headers text-forest text-center mb-6 uppercase tracking-wider pt-12 md:pt-0"
                        >
                            {t('legal.title')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-bark/70 text-center max-w-2xl"
                        >
                            {t('legal.subtitle')}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.4 }}
                            className="h-1 w-20 bg-matcha rounded-full mt-6"
                        />
                    </div>

                    {/* Content Sections */}
                    <div className="max-w-4xl mx-auto space-y-12">
                        {sections.map((section, idx) => (
                            <motion.section
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white/40 p-8 md:p-12 rounded-3xl shadow-sm border border-white/50"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-matcha/10 rounded-2xl text-matcha">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-headers text-forest">
                                        {section.title}
                                    </h2>
                                </div>

                                {Array.isArray(section.content) ? (
                                    <dl className="space-y-4">
                                        {section.content.map((item, itemIdx) => (
                                            <div key={itemIdx} className="border-b border-bark/10 pb-3 last:border-0">
                                                <dt className="text-sm font-semibold text-bark/60 uppercase tracking-wider mb-1">
                                                    {item.label}
                                                </dt>
                                                <dd className="text-lg text-bark">
                                                    {item.isEmail ? (
                                                        <a
                                                            href={`mailto:${item.value}`}
                                                            className="text-matcha hover:text-forest transition-colors"
                                                        >
                                                            {item.value}
                                                        </a>
                                                    ) : item.isPhone ? (
                                                        <a
                                                            href={`tel:${item.value.replace(/\s/g, '')}`}
                                                            className="text-matcha hover:text-forest transition-colors"
                                                        >
                                                            {item.value}
                                                        </a>
                                                    ) : (
                                                        item.value
                                                    )}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                ) : (
                                    <div className="prose prose-lg max-w-none">
                                        <p className="text-bark/90 leading-relaxed whitespace-pre-line">
                                            {section.content}
                                        </p>
                                    </div>
                                )}
                            </motion.section>
                        ))}

                        {/* Intellectual Property */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/40 p-8 md:p-12 rounded-3xl shadow-sm border border-white/50"
                        >
                            <h2 className="text-2xl md:text-3xl font-headers text-forest mb-6">
                                {t('legal.sections.property.title')}
                            </h2>
                            <p className="text-bark/90 leading-relaxed whitespace-pre-line">
                                {t('legal.sections.property.content')}
                            </p>
                        </motion.section>

                        {/* Liability */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/40 p-8 md:p-12 rounded-3xl shadow-sm border border-white/50"
                        >
                            <h2 className="text-2xl md:text-3xl font-headers text-forest mb-6">
                                {t('legal.sections.liability.title')}
                            </h2>
                            <p className="text-bark/90 leading-relaxed whitespace-pre-line">
                                {t('legal.sections.liability.content')}
                            </p>
                        </motion.section>

                        {/* Applicable Law */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-forest/5 p-8 md:p-12 rounded-3xl border-2 border-matcha/20"
                        >
                            <h2 className="text-2xl md:text-3xl font-headers text-forest mb-6">
                                {t('legal.sections.law.title')}
                            </h2>
                            <p className="text-bark/90 leading-relaxed whitespace-pre-line">
                                {t('legal.sections.law.content')}
                            </p>
                        </motion.section>

                        {/* Last Updated */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center text-sm text-bark/50 italic pt-8"
                        >
                            {t('legal.last_updated')}: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LegalNoticePage;
