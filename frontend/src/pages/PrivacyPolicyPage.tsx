import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShieldCheckIcon, UserIcon, ClipboardDocumentListIcon, KeyIcon, UsersIcon, ClockIcon, AcademicCapIcon, LockClosedIcon, FingerPrintIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';

const PrivacyPolicyPage: React.FC = () => {
    const { t } = useTranslation();

    const sections = [
        {
            icon: <UserIcon className="w-8 h-8" />,
            title: t('privacy.sections.responsible.title'),
            content: t('privacy.sections.responsible.content')
        },
        {
            icon: <ClipboardDocumentListIcon className="w-8 h-8" />,
            title: t('privacy.sections.data.title'),
            content: t('privacy.sections.data.content')
        },
        {
            icon: <AcademicCapIcon className="w-8 h-8" />,
            title: t('privacy.sections.purpose.title'),
            content: t('privacy.sections.purpose.content')
        },
        {
            icon: <KeyIcon className="w-8 h-8" />,
            title: t('privacy.sections.legal_base.title'),
            content: t('privacy.sections.legal_base.content')
        },
        {
            icon: <UsersIcon className="w-8 h-8" />,
            title: t('privacy.sections.recipients.title'),
            content: t('privacy.sections.recipients.content')
        },
        {
            icon: <ClockIcon className="w-8 h-8" />,
            title: t('privacy.sections.retention.title'),
            content: t('privacy.sections.retention.content')
        },
        {
            icon: <FingerPrintIcon className="w-8 h-8" />,
            title: t('privacy.sections.rights.title'),
            content: t('privacy.sections.rights.content')
        },
        {
            icon: <LockClosedIcon className="w-8 h-8" />,
            title: t('privacy.sections.security.title'),
            content: t('privacy.sections.security.content')
        },
        {
            icon: <ShieldCheckIcon className="w-8 h-8" />,
            title: t('privacy.sections.minors.title'),
            content: t('privacy.sections.minors.content')
        },
        {
            icon: <ArrowPathIcon className="w-8 h-8" />,
            title: t('privacy.sections.updates.title'),
            content: t('privacy.sections.updates.content')
        }
    ];

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <Helmet>
                <title>{t('privacy.seo.title')}</title>
                <meta name="description" content={t('privacy.seo.description')} />
            </Helmet>

            <Header />

            <main className="flex-grow pt-32 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="mb-8 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        <BackButton />
                    </div>

                    {/* Hero Section */}
                    <div className="flex flex-col items-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-headers text-forest text-center mb-6 uppercase tracking-wider pt-12 md:pt-0"
                        >
                            {t('privacy.title')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-bark/70 text-center max-w-2xl"
                        >
                            {t('privacy.subtitle')}
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
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-forest/5 p-8 rounded-2xl border border-forest/10 mb-12 italic text-bark/80 leading-relaxed"
                        >
                            {t('privacy.intro')}
                        </motion.div>

                        {sections.map((section, idx) => (
                            <motion.section
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
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

                                <div className="prose prose-lg max-w-none">
                                    <p className="text-bark/90 leading-relaxed whitespace-pre-line">
                                        {section.content}
                                    </p>
                                </div>
                            </motion.section>
                        ))}

                        {/* Last Updated */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center text-sm text-bark/50 italic pt-8"
                        >
                            {t('privacy.last_updated')}: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
