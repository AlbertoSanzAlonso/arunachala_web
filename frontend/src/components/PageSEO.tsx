import React from 'react';
import { Helmet } from 'react-helmet-async';

interface PageSEOProps {
    title?: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
    ogType?: string;
    structuredData?: object;
}

const PageSEO: React.FC<PageSEOProps> = ({
    title = 'Arunachala Yoga y Terapias',
    description = 'Centro de Yoga y Terapias en Castelldefels. Clases de Hatha Yoga, Vinyasa, Meditación guiada y Terapias Holísticas para tu bienestar integral.',
    canonical = 'https://www.yogayterapiasarunachala.es',
    ogImage = 'https://www.yogayterapiasarunachala.es/logo_wide.webp',
    ogType = 'website',
    structuredData
}) => {
    const siteTitle = title.includes('Arunachala') ? title : `${title} | Arunachala Yoga y Terapias`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical} />

            {/* Open Graph tags */}
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={canonical} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content="Arunachala Yoga y Terapias" />

            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

export default PageSEO;
