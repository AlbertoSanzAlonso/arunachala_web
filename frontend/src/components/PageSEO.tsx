import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface PageSEOProps {
    title?: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
    ogType?: string;
    structuredData?: object | object[];
    noindex?: boolean;
}

const BASE_URL = 'https://www.yogayterapiasarunachala.es';

const PageSEO: React.FC<PageSEOProps> = ({
    title,
    description = 'Clases de Yoga, masajes y terapias: Centro de Yoga en Cornellà de Llobregat',
    canonical,
    ogImage = `${BASE_URL}/logo_wide.webp`,
    ogType = 'website',
    structuredData,
    noindex = false
}) => {
    const { i18n, t } = useTranslation();
    
    // SSR Fallback para el pathname
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
    
    // Obtener parámetros importantes para el canonical (como slug o activity)
    const searchParams = new URLSearchParams(currentSearch);
    const importantParams = ['slug', 'activity', 'lng'];
    const canonicalParams = new URLSearchParams();
    
    importantParams.forEach(param => {
        if (searchParams.has(param)) {
            canonicalParams.set(param, searchParams.get(param)!);
        }
    });

    const queryString = canonicalParams.toString();
    const normalizedPath = currentPath === '/' ? '/' : (currentPath.endsWith('/') ? currentPath : `${currentPath}/`);
    const resolvedCanonical = canonical || `${BASE_URL}${normalizedPath}${queryString ? `?${queryString}` : ''}`;

    // Lógica de título simplificada con 'Cornellà' estándar (acento grave)
    const siteTitle = title 
        ? `${title} | Arunachala Yoga y Terapias`
        : t('seo.default_title', 'Arunachala Yoga y Terapias | Centro de Bienestar en Cornellà');

    return (
        <Helmet htmlAttributes={{ lang: i18n.language.split('-')[0] }}>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta name="author" content="Alberto Sanz Alonso" />
            <link rel="canonical" href={resolvedCanonical} />

            {/* Language alternates for Multilingual SEO */}
            {/* Solo incluimos alternativas si tienen su parámetro de idioma para que Google no las vea como duplicados exactos */}
            <link rel="alternate" hrefLang="es" href={resolvedCanonical} />
            <link rel="alternate" hrefLang="ca" href={`${resolvedCanonical}?lng=ca`} />
            <link rel="alternate" hrefLang="en" href={`${resolvedCanonical}?lng=en`} />
            <link rel="alternate" hrefLang="x-default" href={resolvedCanonical} />
            
            {/* Robots control */}
            {noindex ? (
                <meta name="robots" content="noindex, nofollow" />
            ) : (
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
            )}

            {/* Open Graph tags */}
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={resolvedCanonical} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content="Arunachala Yoga y Terapias" />
            <meta property="og:locale" content={i18n.language.replace('-', '_')} />

            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Unified Structured Data */}
            {structuredData && (
                Array.isArray(structuredData) ? (
                    structuredData.map((data, idx) => (
                        <script key={idx} type="application/ld+json">
                            {JSON.stringify(data)}
                        </script>
                    ))
                ) : (
                    <script type="application/ld+json">
                        {JSON.stringify(structuredData)}
                    </script>
                )
            )}
        </Helmet>
    );
};

export default PageSEO;

