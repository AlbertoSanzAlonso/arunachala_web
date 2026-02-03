import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import ArticleModal from '../components/ArticleModal';

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

const BlogPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [articles, setArticles] = useState<Article[]>([]);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Set initial category from URL path
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const categoryFromPath = pathParts[2]; // /blog/[category]

        if (categoryFromPath && ['yoga', 'therapy'].includes(categoryFromPath)) {
            setSelectedCategory(categoryFromPath);
        } else {
            setSelectedCategory('all');
        }
    }, [location.pathname]);

    useEffect(() => {
        fetchArticles();
    }, []);

    useEffect(() => {
        if (selectedCategory === 'all') {
            setFilteredArticles(articles);
        } else {
            setFilteredArticles(articles.filter(a => a.category === selectedCategory));
        }
    }, [selectedCategory, articles]);

    const fetchArticles = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content?type=article&status=published`);
            if (response.ok) {
                const data = await response.json();
                setArticles(data);
                setFilteredArticles(data);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleArticleClick = async (article: Article) => {
        try {
            // Unoptimistic UI: Show modal immediately with available info? 
            // Better: fetch body first then show, or show skeleton? 
            // Let's fetch quickly.
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

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            yoga: t('blog.categories.yoga', 'Yoga'),
            therapy: t('blog.categories.therapy', 'Terapias')
        };
        return labels[category] || category;
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <Helmet>
                <title>{t('blog.seo.title', 'Blog | Arunachala Yoga')}</title>
                <meta name="description" content={t('blog.seo.description', 'Artículos sobre yoga, meditación y bienestar')} />
            </Helmet>

            <Header />

            <main className="flex-grow pt-32 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="mb-8 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        <BackButton />
                    </div>

                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-headers text-forest mb-4 uppercase tracking-wider pt-12 md:pt-0"
                        >
                            {selectedCategory === 'yoga'
                                ? t('blog.yoga_title', 'Blog de Yoga')
                                : selectedCategory === 'therapy'
                                    ? t('blog.therapy_title', 'Blog de Terapias')
                                    : t('blog.title', 'Blog')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-bark/70 font-light"
                        >
                            {selectedCategory === 'yoga'
                                ? t('blog.yoga_subtitle', 'Artículos, consejos y reflexiones sobre la práctica del yoga')
                                : selectedCategory === 'therapy'
                                    ? t('blog.therapy_subtitle', 'Artículos sobre terapias holísticas, masajes y bienestar')
                                    : t('blog.subtitle', 'Artículos sobre yoga, meditación y bienestar')}
                        </motion.p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex justify-center gap-4 mb-12 flex-wrap">
                        {['all', 'yoga', 'therapy'].map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2 rounded-full font-headers tracking-widest uppercase text-sm transition-all duration-300 ${selectedCategory === category
                                    ? 'bg-forest text-white shadow-lg'
                                    : 'bg-white text-bark border border-bark/20 hover:border-forest hover:text-forest'
                                    }`}
                            >
                                {category === 'all' ? t('blog.all', 'Todos') : getCategoryLabel(category)}
                            </button>
                        ))}
                    </div>

                    {/* Articles Grid */}
                    {isLoading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
                        </div>
                    ) : filteredArticles.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-xl text-bark/60">{t('blog.no_articles', 'No hay artículos disponibles')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredArticles.map((article, index) => (
                                <motion.article
                                    key={article.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => handleArticleClick(article)}
                                    className="bg-white rounded-[2rem] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-48 bg-forest/10 overflow-hidden relative">
                                        {article.thumbnail_url ? (
                                            <img
                                                src={getImageUrl(article.thumbnail_url)}
                                                alt={getTranslated(article, 'title', i18n.language)}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <TagIcon className="w-16 h-16 text-forest/30" />
                                            </div>
                                        )}
                                        {/* Category Badge */}
                                        <div className="absolute top-4 right-4 bg-forest/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-headers uppercase tracking-wider">
                                            {getCategoryLabel(article.category)}
                                        </div>
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

            <ArticleModal
                article={selectedArticle}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <Footer />
        </div>
    );
};

export default BlogPage;
