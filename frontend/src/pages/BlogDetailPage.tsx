import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CalendarIcon, TagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';

interface Article {
    id: number;
    title: string;
    slug: string;
    body: string;
    excerpt: string;
    category: string;
    thumbnail_url: string | null;
    tags: string[];
    seo_title: string | null;
    seo_description: string | null;
    created_at: string;
    translations?: any;
}

const BlogDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

    useEffect(() => {
        if (slug) {
            fetchArticle();
        }
    }, [slug]);

    const fetchArticle = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content/slug/${slug}`);
            if (response.ok) {
                const data = await response.json();
                setArticle(data);
                // Fetch related articles from the same category
                fetchRelatedArticles(data.category, data.id);
            } else {
                navigate('/blog');
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            navigate('/blog');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRelatedArticles = async (category: string, currentId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content?type=article&category=${category}&status=published`);
            if (response.ok) {
                const data = await response.json();
                // Filter out current article and limit to 3
                const related = data.filter((a: Article) => a.id !== currentId).slice(0, 3);
                setRelatedArticles(related);
            }
        } catch (error) {
            console.error('Error fetching related articles:', error);
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
            therapy: t('blog.categories.therapy', 'Terapias'),
            general: t('blog.categories.general', 'General')
        };
        return labels[category] || category;
    };

    if (isLoading) {
        return (
            <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!article) {
        return null;
    }

    const translatedTitle = getTranslated(article, 'title', i18n.language);
    const translatedBody = getTranslated(article, 'body', i18n.language);
    const translatedExcerpt = getTranslated(article, 'excerpt', i18n.language);

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <Helmet>
                <title>{article.seo_title || translatedTitle}</title>
                <meta name="description" content={article.seo_description || translatedExcerpt} />
            </Helmet>

            <Header />

            <main className="flex-grow pt-32 pb-16">
                <article className="max-w-4xl mx-auto px-6">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/blog')}
                        className="flex items-center gap-2 text-bark/60 hover:text-forest transition-colors mb-8 group"
                    >
                        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-headers uppercase tracking-wider text-sm">{t('blog.back_to_blog', 'Volver al Blog')}</span>
                    </button>

                    {/* Category Badge */}
                    <div className="mb-6">
                        <span className="inline-block bg-forest text-white px-4 py-2 rounded-full text-sm font-headers uppercase tracking-wider">
                            {getCategoryLabel(article.category)}
                        </span>
                    </div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-headers text-forest mb-6 leading-tight"
                    >
                        {translatedTitle}
                    </motion.h1>

                    {/* Meta Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-4 text-bark/60 mb-8 pb-8 border-b border-bark/10"
                    >
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" />
                            <span>{formatDate(article.created_at)}</span>
                        </div>
                    </motion.div>

                    {/* Featured Image */}
                    {article.thumbnail_url && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-12 rounded-[2rem] overflow-hidden shadow-xl"
                        >
                            <img
                                src={article.thumbnail_url.startsWith('http') ? article.thumbnail_url : `${API_BASE_URL}${article.thumbnail_url}`}
                                alt={translatedTitle}
                                className="w-full h-auto"
                            />
                        </motion.div>
                    )}

                    {/* Excerpt */}
                    {translatedExcerpt && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl text-bark/80 font-light italic mb-8 pl-6 border-l-4 border-matcha"
                        >
                            {translatedExcerpt}
                        </motion.div>
                    )}

                    {/* Body Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="prose prose-lg max-w-none mb-12"
                        dangerouslySetInnerHTML={{ __html: translatedBody }}
                    />

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap gap-3 mb-12 pt-8 border-t border-bark/10"
                        >
                            <TagIcon className="w-5 h-5 text-bark/40" />
                            {article.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="px-4 py-2 bg-white text-bark/70 rounded-full text-sm hover:bg-forest hover:text-white transition-colors cursor-pointer"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </motion.div>
                    )}

                    {/* Related Articles */}
                    {relatedArticles.length > 0 && (
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
                                {relatedArticles.map((related) => (
                                    <div
                                        key={related.id}
                                        onClick={() => navigate(`/blog/${related.slug}`)}
                                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="h-32 bg-forest/10 overflow-hidden">
                                            {related.thumbnail_url ? (
                                                <img
                                                    src={related.thumbnail_url.startsWith('http') ? related.thumbnail_url : `${API_BASE_URL}${related.thumbnail_url}`}
                                                    alt={getTranslated(related, 'title', i18n.language)}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <TagIcon className="w-8 h-8 text-forest/30" />
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
                    )}
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default BlogDetailPage;
