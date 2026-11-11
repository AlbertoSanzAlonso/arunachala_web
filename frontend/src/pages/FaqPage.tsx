import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/ui/BackButton';
import PageSEO from '../components/providers/PageSEO';
import { API_BASE_URL } from '../config';
import { BUSINESS, BUSINESS_ADDRESS_LINE, businessPostalAddress } from '../config/business';

interface FaqItem {
    q: string;
    a: string;
}

interface PricedItem {
    id?: number;
    name?: string;
    title?: string;
    price?: string;
    duration_min?: number;
}

const FaqPage: React.FC = () => {
    const { t } = useTranslation();
    const safeItems = useMemo(() => {
        const items = t('faq.items', { returnObjects: true }) as FaqItem[];
        return Array.isArray(items) ? items : [];
    }, [t]);
    const [rates, setRates] = useState<PricedItem[]>([]);
    const [massages, setMassages] = useState<PricedItem[]>([]);
    const [therapies, setTherapies] = useState<PricedItem[]>([]);

    useEffect(() => {
        const load = async (url: string) => {
            try {
                const response = await fetch(url);
                if (!response.ok) return [];
                const data = await response.json();
                return Array.isArray(data) ? data : [];
            } catch {
                return [];
            }
        };
        load(`${API_BASE_URL}/api/promotions/tarifas`).then(setRates);
        load(`${API_BASE_URL}/api/treatments/massages`).then(setMassages);
        load(`${API_BASE_URL}/api/treatments/therapies`).then(setTherapies);
    }, []);

    const priced = (list: PricedItem[]) => list.filter((item) => item.price);

    const formatPrice = (price: string) => {
        const value = price.trim();
        if (/[€$]|euro/i.test(value)) return value;
        return `${value} €`;
    };

    const structuredData = useMemo(() => ([
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: safeItems.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.a,
                },
            })),
        },
        {
            '@context': 'https://schema.org',
            '@type': 'YogaStudio',
            name: BUSINESS.name,
            url: BUSINESS.url,
            telephone: BUSINESS.phoneTel,
            email: BUSINESS.email,
            address: businessPostalAddress,
        },
    ]), [safeItems]);

    const groups = [
        { title: t('faq.yoga_rates'), items: priced(rates), label: (item: PricedItem) => item.title || item.name || '' },
        { title: t('faq.massages'), items: priced(massages), label: (item: PricedItem) => item.name || item.title || '' },
        { title: t('faq.therapies'), items: priced(therapies), label: (item: PricedItem) => item.name || item.title || '' },
    ].filter((group) => group.items.length > 0);

    return (
        <div className="font-body text-bark min-h-screen flex flex-col">
            <PageSEO
                title={t('faq.title')}
                description={t('faq.seo_description')}
                structuredData={structuredData}
            />
            <Header />
            <main className="flex-grow pt-4 md:pt-16 pb-20">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="mb-8">
                        <BackButton />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-headers text-forest leading-tight mb-6">
                        {t('faq.title')}
                    </h1>
                    <p className="text-lg leading-relaxed text-bark/90 mb-4">{t('faq.intro')}</p>
                    <p className="text-base leading-relaxed text-bark/80 mb-12">
                        {BUSINESS.name}. {BUSINESS_ADDRESS_LINE}. {BUSINESS.phoneDisplay}. {BUSINESS.email}.
                    </p>

                    <div className="space-y-10">
                        {safeItems.map((item) => (
                            <article key={item.q}>
                                <h2 className="text-2xl font-headers text-forest mb-3">{item.q}</h2>
                                <p className="text-lg leading-relaxed text-bark/90">{item.a}</p>
                            </article>
                        ))}
                    </div>

                    <section className="mt-16 pt-10 border-t border-forest/10">
                        <h2 className="text-2xl md:text-3xl font-headers text-forest mb-3">{t('faq.prices_title')}</h2>
                        <p className="text-lg leading-relaxed text-bark/90 mb-8">{t('faq.prices_intro')}</p>
                        {groups.length === 0 ? (
                            <p className="text-bark/70">{t('faq.prices_empty')}</p>
                        ) : (
                            <div className="space-y-8">
                                {groups.map((group) => (
                                    <div key={group.title}>
                                        <h3 className="text-xl font-headers text-matcha mb-3">{group.title}</h3>
                                        <ul className="space-y-2">
                                            {group.items.map((item) => (
                                                <li key={`${group.title}-${item.id}-${group.label(item)}`} className="flex justify-between gap-4 border-b border-forest/10 py-2">
                                                    <span>
                                                        {group.label(item)}
                                                        {item.duration_min ? ` · ${item.duration_min} min` : ''}
                                                    </span>
                                                    <span className="font-medium text-forest whitespace-nowrap">{formatPrice(item.price || '')}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <p className="mt-12 text-bark/70">
                        <Link to="/contacto/" className="text-forest underline underline-offset-4 hover:text-matcha">{t('menu.contact')}</Link>
                        {' · '}
                        <Link to="/clases-de-yoga/" className="text-forest underline underline-offset-4 hover:text-matcha">{t('menu.yoga')}</Link>
                        {' · '}
                        <Link to="/terapias-y-masajes/" className="text-forest underline underline-offset-4 hover:text-matcha">{t('menu.therapies')}</Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FaqPage;
