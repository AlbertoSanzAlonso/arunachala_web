
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TagIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from 'utils/imageUtils';
import { getTranslated } from 'utils/translate';
import { Article } from 'types/blog';

interface RelatedArticlesProps {
    articles: Article[];
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ articles }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    if (articles.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 pt-12 border-t border-bark/10"
        >
            <h2 className="text-3xl font-headers text-forest mb-8 uppercase tracking-wider">
                {t('blog.related_articles', 'Artículos Relacionados')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map((related) => (
                    <div
                        key={related.id}
                        onClick={() => navigate(`/blog/${related.slug}`)}
                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    >
                        <div className="h-32 bg-forest/10 overflow-hidden relative">
                            {related.thumbnail_url && !related.thumbnail_url.includes('om_symbol.webp') && !related.thumbnail_url.includes('logo_icon.webp') ? (
                                <img
                                    src={getImageUrl(related.thumbnail_url)}
                                    alt={getTranslated(related, 'title', i18n.language)}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        if (target.getAttribute('data-fallback')) {
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                const fileName = related.thumbnail_url?.split('/').pop() || 'Imagen';
                                                const errDiv = document.createElement('div');
                                                errDiv.className = "absolute inset-0 flex items-center justify-center p-2 text-center text-[10px] text-bark/30 italic break-all";
                                                errDiv.innerText = fileName;
                                                parent.appendChild(errDiv);
                                            }
                                            return;
                                        }
                                        target.setAttribute('data-fallback', 'true');
                                        target.src = related.category === 'yoga'
                                            ? getImageUrl('/static/gallery/articles/om_symbol.webp')
                                            : getImageUrl('/static/gallery/articles/logo_icon.webp');
                                        target.className = "w-12 h-12 object-contain opacity-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500";
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    {(related.category === 'yoga' || (related.thumbnail_url && related.thumbnail_url.includes('om_symbol.webp'))) ? (
                                        <img src={getImageUrl('/static/gallery/articles/om_symbol.webp')} alt="Yoga" className="w-12 h-12 object-contain opacity-30 group-hover:scale-110 transition-transform duration-500" />
                                    ) : (related.category === 'therapy' || (related.thumbnail_url && related.thumbnail_url.includes('logo_icon.webp'))) ? (
                                        <img src={getImageUrl('/static/gallery/articles/logo_icon.webp')} alt="Terapia" className="w-12 h-12 object-contain opacity-30 group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <TagIcon className="w-6 h-6 text-forest/30" />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-headers text-forest group-hover:text-matcha transition-colors line-clamp-2">
                                {getTranslated(related, 'title', i18n.language)}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default RelatedArticles;
