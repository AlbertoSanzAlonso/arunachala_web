
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getImageUrl } from 'utils/imageUtils';
import { getTranslated } from 'utils/translate';
import { Article } from 'types/blog';
import omSymbol from 'assets/images/om_symbol.png';

interface RelatedArticlesProps {
    articles: Article[];
    contentType?: 'article' | 'announcement';
    title?: string;
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({
    articles,
    contentType = 'article',
    title,
}) => {
    const { t, i18n } = useTranslation();
    const basePath = contentType === 'announcement' ? '/noticias' : '/blog';

    if (articles.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 pt-12 border-t border-bark/10"
        >
            <h2 className="text-3xl font-headers text-forest mb-8 uppercase tracking-wider">
                {title || t('blog.related_articles', 'Artículos Relacionados')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map((related) => {
                    const isYogaWatermark =
                        related.category === 'yoga' || Boolean(related.thumbnail_url?.includes('om_symbol.webp'));
                    const watermarkSrc = isYogaWatermark ? omSymbol : '/logo_icon.webp';
                    const watermarkAlt = isYogaWatermark ? 'Yoga' : 'Terapia';
                    const resolvedThumb =
                        related.thumbnail_url &&
                        !related.thumbnail_url.includes('om_symbol.webp') &&
                        !related.thumbnail_url.includes('logo_icon.webp')
                            ? getImageUrl(related.thumbnail_url)
                            : '';

                    return (
                    <Link
                        key={related.id}
                        to={`${basePath}/${related.slug}`}
                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group block"
                    >
                        <div className="h-32 bg-forest/10 overflow-hidden relative">
                            {resolvedThumb ? (
                                <img
                                    src={resolvedThumb}
                                    alt={getTranslated(related, 'title', i18n.language)}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        if (target.getAttribute('data-fallback')) {
                                            target.style.display = 'none';
                                            return;
                                        }
                                        target.setAttribute('data-fallback', 'true');
                                        target.src = watermarkSrc;
                                        target.alt = watermarkAlt;
                                        target.className = "w-12 h-12 object-contain opacity-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500";
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <img
                                        src={watermarkSrc}
                                        alt={watermarkAlt}
                                        className="w-12 h-12 object-contain opacity-30 group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-headers text-forest group-hover:text-matcha transition-colors line-clamp-2">
                                {getTranslated(related, 'title', i18n.language)}
                            </h3>
                        </div>
                    </Link>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default RelatedArticles;
