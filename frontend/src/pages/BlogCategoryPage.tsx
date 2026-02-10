import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';
import { getImageUrl } from '../utils/imageUtils';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    thumbnail_url: string | null;
    tags: string[];
    created_at: string;
    translations?: any;
}

const BlogCategoryPage: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchArticles = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content?type=article&category=${category}&status=published`);
            if (response.ok) {
                const data = await response.json();
                setArticles(data);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setIsLoading(false);
        }
    }, [category]);

    useEffect(() => {
        if (category) {
            fetchArticles();
        }
    }, [category, fetchArticles]);

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

    const getCategoryTitle = () => {
        const titles: Record<string, string> = {
            yoga: t('blog.category_pages.yoga.title', 'Blog de Yoga'),
            therapy: t('blog.category_pages.therapy.title', 'Blog de Terapias'),
            general: t('blog.category_pages.general.title', 'Blog General')
        };
        return titles[category || ''] || t('blog.title', 'Blog');
    };

    const getCategorySubtitle = () => {
        const subtitles: Record<string, string> = {
            yoga: t('blog.category_pages.yoga.subtitle', 'Artículos, consejos y reflexiones sobre la práctica del yoga'),
            therapy: t('blog.category_pages.therapy.subtitle', 'Artículos sobre terapias holísticas, masajes y bienestar'),
            general: t('blog.category_pages.general.subtitle', 'Artículos sobre bienestar y vida consciente')
        };
        return subtitles[category || ''] || t('blog.subtitle', 'Artículos sobre yoga, meditación y bienestar');
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <Helmet>
                <title>{getCategoryTitle()} | Arunachala Yoga</title>
                <meta name="description" content={getCategorySubtitle()} />
            </Helmet>

            <Header />

            <main className="flex-grow pt-40 md:pt-48 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="-mt-8 md:-mt-16 mb-8 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        <BackButton />
                    </div>

                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block mb-4"
                        >
                            <span className="bg-forest text-white px-6 py-2 rounded-full text-sm font-headers uppercase tracking-wider">
                                {getCategoryLabel(category || '')}
                            </span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-headers text-forest mb-4 uppercase tracking-wider pt-12 md:pt-0"
                        >
                            {getCategoryTitle()}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-bark/70 font-light max-w-3xl mx-auto"
                        >
                            {getCategorySubtitle()}
                        </motion.p>
                    </div>

                    {/* Articles Grid */}
                    {isLoading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-xl text-bark/60">{t('blog.no_articles', 'No hay artículos disponibles')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {articles.map((article, index) => (
                                <motion.article
                                    key={article.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => navigate(`/blog/${article.slug}`)}
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
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h2 className="text-2xl font-headers text-forest mb-3 group-hover:text-matcha transition-colors">
                                            {getTranslated(article, 'title', i18n.language)}
                                        </h2>
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
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogCategoryPage;
