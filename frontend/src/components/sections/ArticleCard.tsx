import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalendarIcon, ArrowRightIcon, TagIcon } from '@heroicons/react/24/outline';
import { Article } from 'types/blog';
import { getImageUrl } from 'utils/imageUtils';
import { getTranslated } from 'utils/translate';

interface ArticleCardProps {
    article: Article;
    index: number;
    currentPage: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, index, currentPage }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.language, {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const translatedTitle = getTranslated(article, 'title', i18n.language);
    const translatedExcerpt = getTranslated(article, 'excerpt', i18n.language);
    const articleUrl = `/blog/${article.slug}?p=${currentPage}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500 group flex flex-col h-full border border-bark/5"
        >
            {/* Image Container - Now navigates to article */}
            <div 
                className="relative h-64 overflow-hidden bg-[#5c6b3c] cursor-pointer group" 
                style={{ transform: 'translateZ(0)' }}
                onClick={() => navigate(articleUrl)}
            >
                {article.thumbnail_url && !article.thumbnail_url.includes('om_symbol.webp') && !article.thumbnail_url.includes('logo_icon.webp') ? (
                    <img
                        src={getImageUrl(article.thumbnail_url)}
                        alt={translatedTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            const target = e.currentTarget;
                            if (target.getAttribute('data-fallback')) {
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    const fileName = article.thumbnail_url?.split('/').pop() || 'Imagen';
                                    const errDiv = document.createElement('div');
                                    errDiv.className = "absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-bark/30 italic break-all";
                                    errDiv.innerText = fileName;
                                    parent.appendChild(errDiv);
                                }
                                return;
                            }
                            target.setAttribute('data-fallback', 'true');
                            target.src = article.category === 'yoga' 
                                ? getImageUrl('/static/gallery/articles/om_symbol.webp')
                                : getImageUrl('/static/gallery/articles/logo_icon.webp');
                            target.className = "w-24 h-24 object-contain opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500";
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {(article.category === 'yoga' || (article.thumbnail_url && article.thumbnail_url.includes('om_symbol.webp'))) ? (
                            <motion.img 
                                src={getImageUrl('/static/gallery/articles/om_symbol.webp')} 
                                alt="Yoga" 
                                whileHover={{ scale: 1.1 }}
                                className="w-24 h-24 object-contain opacity-20 will-change-transform" 
                            />
                        ) : (article.category === 'therapy' || (article.thumbnail_url && article.thumbnail_url.includes('logo_icon.webp'))) ? (
                            <motion.img 
                                src={getImageUrl('/static/gallery/articles/logo_icon.webp')} 
                                alt="Terapia" 
                                whileHover={{ scale: 1.1 }}
                                className="w-24 h-24 object-contain opacity-20 will-change-transform" 
                            />
                        ) : (
                            <TagIcon className="w-12 h-12 text-forest/20" />
                        )}
                    </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-forest px-4 py-1.5 rounded-full text-xs font-headers tracking-widest uppercase shadow-sm">
                        {t(`blog.categories.${article.category}`, article.category)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-bark/40 text-xs mb-4 font-headers uppercase tracking-widest">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(article.created_at)}</span>
                </div>

                <h3 
                    className="text-2xl font-headers text-forest mb-4 line-clamp-2 leading-tight group-hover:text-matcha transition-colors cursor-pointer"
                    onClick={() => navigate(articleUrl)}
                >
                    {translatedTitle}
                </h3>

                <p className="text-bark/70 text-sm mb-8 line-clamp-3 leading-relaxed flex-grow">
                    {translatedExcerpt}
                </p>

                <button
                    onClick={() => navigate(articleUrl)}
                    className="flex items-center gap-2 text-forest font-headers uppercase tracking-widest text-sm group/btn self-start cursor-pointer"
                >
                    <span className="relative">
                        {t('blog.read_more')}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-matcha transition-all duration-300 group-hover/btn:w-full"></span>
                    </span>
                    <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-2 text-matcha" />
                </button>
            </div>
        </motion.div>
    );
};

export default ArticleCard;
