import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalendarIcon, TagIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';
import { getImageUrl } from '../utils/imageUtils';
import ArticleModal from './ArticleModal';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    body?: string; // Added body
    category: string;
    thumbnail_url: string | null;
    tags: string[];
    created_at: string;
    translations?: any;
}

interface BlogSectionProps {
    category?: string;
    limit?: number;
    showViewAll?: boolean;
    title?: string;
    subtitle?: string;
    viewAllUrl?: string;
}

const BlogSection: React.FC<BlogSectionProps> = ({
    category,
    limit = 3,
    showViewAll = true,
    title,
    subtitle,
    viewAllUrl
}) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchArticles = async () => {
        try {
            let url = `${API_BASE_URL}/api/content?type=article&status=published`;
            if (category) {
                url += `&category=${category}`;
            }
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setArticles(data.slice(0, limit));
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    const handleArticleClick = async (article: Article) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content/slug/${article.slug}`);
            if (response.ok) {
                const fullArticle = await response.json();
                setSelectedArticle(fullArticle);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error("Error loading full article", error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCategoryLabel = (cat: string) => {
        const labels: Record<string, string> = {
            yoga: t('blog.categories.yoga', 'Yoga'),
            therapy: t('blog.categories.therapy', 'Terapias'),
            general: t('blog.categories.general', 'General')
        };
        return labels[cat] || cat;
    };

    if (isLoading) {
        return (
            <section className="py-16 bg-bone">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-bone">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-headers text-forest mb-4 uppercase tracking-wider"
                    >
                        {title || t('blog.section_title', 'Últimas Publicaciones')}
                    </motion.h2>
                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-bark/70 font-light"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </div>

                {articles.length === 0 ? (
                    <div className="text-center py-12 bg-white/50 rounded-2xl">
                        <p className="text-bark/60 text-lg">
                            {t('blog.no_articles_yet', 'Próximamente encontrarás aquí artículos interesantes')}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Articles Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {articles.map((article, index) => (
                                <motion.article
                                    key={article.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => handleArticleClick(article)}
                                    className="bg-white rounded-[2rem] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-48 bg-forest/10 overflow-hidden relative">
                                        {article.thumbnail_url && !article.thumbnail_url.includes('om_symbol.webp') && !article.thumbnail_url.includes('lotus_flower.webp') ? (
                                            <img
                                                src={getImageUrl(article.thumbnail_url)}
                                                alt={getTranslated(article, 'title', i18n.language)}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    if (target.getAttribute('data-fallback')) {
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            const fileName = article.thumbnail_url?.split('/').pop() || 'Imagen';
                                                            const errDiv = document.createElement('div');
                                                            errDiv.className = "absolute inset-0 flex items-center justify-center p-4 text-center text-[10px] text-bark/30 italic break-all";
                                                            errDiv.innerText = fileName;
                                                            parent.appendChild(errDiv);
                                                        }
                                                        return;
                                                    }
                                                    target.setAttribute('data-fallback', 'true');
                                                    target.src = article.category === 'yoga'
                                                        ? getImageUrl('/static/gallery/articles/om_symbol.webp')
                                                        : getImageUrl('/static/gallery/articles/lotus_flower.webp');
                                                    target.className = "w-24 h-24 object-contain opacity-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                {(article.category === 'yoga' || (article.thumbnail_url && article.thumbnail_url.includes('om_symbol.webp'))) ? (
                                                    <img src={getImageUrl('/static/gallery/articles/om_symbol.webp')} alt="Yoga" className="w-24 h-24 object-contain opacity-30 group-hover:scale-110 transition-transform duration-500" />
                                                ) : (article.category === 'therapy' || (article.thumbnail_url && article.thumbnail_url.includes('lotus_flower.webp'))) ? (
                                                    <img src={getImageUrl('/static/gallery/articles/lotus_flower.webp')} alt="Terapia" className="w-24 h-24 object-contain opacity-30 group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <TagIcon className="w-16 h-16 text-forest/30" />
                                                )}
                                            </div>
                                        )}
                                        {/* Category Badge */}
                                        <div className="absolute top-4 right-4 bg-forest/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-headers uppercase tracking-wider">
                                            {getCategoryLabel(article.category)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="text-2xl font-headers text-forest mb-3 group-hover:text-matcha transition-colors line-clamp-2">
                                            {getTranslated(article, 'title', i18n.language)}
                                        </h3>
                                        <p className="text-bark/70 mb-4 line-clamp-3">
                                            {getTranslated(article, 'excerpt', i18n.language)}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 text-sm text-bark/50">
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="w-4 h-4" />
                                                <span>{formatDate(article.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        {article.tags && article.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {article.tags.slice(0, 3).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-bone text-bark/60 rounded-full text-xs"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.article>
                            ))}
                        </div>

                        {/* View All Button */}
                        {showViewAll && articles.length >= limit && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <button
                                    onClick={() => navigate(viewAllUrl || (category ? `/blog/${category}` : '/blog'))}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-forest text-white rounded-full font-headers text-lg tracking-widest uppercase hover:bg-matcha transition-all duration-300 shadow-lg hover:shadow-xl group"
                                >
                                    {t('blog.view_all', 'Ver Todos los Artículos')}
                                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            <ArticleModal
                article={selectedArticle}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </section>
    );
};

export default BlogSection;
