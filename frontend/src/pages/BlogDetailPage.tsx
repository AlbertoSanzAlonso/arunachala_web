
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalendarIcon, ShareIcon } from '@heroicons/react/24/outline';

import Header from '../components/Header';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';
import BackButton from '../components/BackButton';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';
import { getImageUrl } from '../utils/imageUtils';
import { useUIStore } from '../store/uiStore';
import { Article } from '../types/blog';

// Modular components
import ArticleLightbox from './blog/components/ArticleLightbox';
import ArticleContent from './blog/components/ArticleContent';
import RelatedArticles from './blog/components/RelatedArticles';

const BlogDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { t, i18n } = useTranslation();
    const { addToast } = useUIStore();
    const navigate = useNavigate();
    
    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);

    const fetchRelatedArticles = useCallback(async (category: string, currentId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content?type=article&category=${category}&status=published`);
            if (response.ok) {
                const data = await response.json();
                const related = data.filter((a: Article) => a.id !== currentId).slice(0, 3);
                setRelatedArticles(related);
            }
        } catch (error) {
            console.error('Error fetching related articles:', error);
        }
    }, []);

    const fetchArticle = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content/slug/${slug}`);
            if (response.ok) {
                const data = await response.json();
                setArticle(data);
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
    }, [slug, navigate, fetchRelatedArticles]);

    useEffect(() => {
        if (slug) {
            fetchArticle();
        }
    }, [slug, fetchArticle]);

    // UI Handlers
    const handleImageClick = (src: string) => {
        setSelectedImage(src);
        setIsZoomed(false);
    };

    const handleShare = async () => {
        if (!article) return;
        const shareUrl = window.location.href;
        const title = getTranslated(article, 'title', i18n.language);

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: getTranslated(article, 'excerpt', i18n.language) || t('blog.share_text'),
                    url: shareUrl,
                });
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                addToast('success', t('common.copied_to_clipboard'));
            } catch (err) {
                console.error("Copy failed:", err);
            }
        }
    };

    // Close lightbox on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedImage(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Prevent scroll when lightbox is open
    useEffect(() => {
        if (selectedImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [selectedImage]);

    if (isLoading) {
        return (
            <div className="font-body text-bark min-h-screen flex flex-col bg-bone">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!article) return null;

    const translatedTitle = getTranslated(article, 'title', i18n.language);
    const translatedBody = getTranslated(article, 'body', i18n.language);
    const translatedExcerpt = getTranslated(article, 'excerpt', i18n.language);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.language, {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <PageSEO
                title={article.seo_title || translatedTitle}
                description={article.seo_description || translatedExcerpt}
                ogImage={article.thumbnail_url ? getImageUrl(article.thumbnail_url) : undefined}
                ogType="article"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": translatedTitle,
                    "image": article.thumbnail_url ? getImageUrl(article.thumbnail_url) : "https://www.yogayterapiasarunachala.es/logo_wide.webp",
                    "datePublished": article.created_at,
                    "dateModified": article.updated_at || article.created_at,
                    "author": [{
                        "@type": "Person",
                        "name": "Susana Pérez Gil",
                        "url": "https://www.yogayterapiasarunachala.es/quienes-somos/"
                    }],
                    "publisher": {
                        "@type": "Organization",
                        "name": "Arunachala Yoga y Terapias",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://www.yogayterapiasarunachala.es/logo_transparent.png"
                        }
                    },
                    "description": translatedExcerpt || article.seo_description
                }}
            />

            <Header />

            <main className="flex-grow pt-4 md:pt-16 pb-16">
                <article className="max-w-4xl mx-auto px-6">
                    <div className="mb-4">
                        <BackButton to="/blog" label={t('blog.back_to_blog')} />
                    </div>

                    <div className="mb-6">
                        <span className="inline-block bg-forest text-white px-4 py-2 rounded-full text-sm font-headers tracking-wider">
                            {t(`blog.categories.${article.category}`, article.category)}
                        </span>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-headers text-forest mb-6 leading-tight"
                    >
                        {translatedTitle}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center justify-between gap-4 text-bark/60 mb-8 pb-8 border-b border-bark/10"
                    >
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" />
                            <span>{formatDate(article.created_at)}</span>
                        </div>

                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-forest/20 text-forest hover:bg-forest hover:text-white transition-all text-sm font-medium"
                        >
                            <ShareIcon className="w-4 h-4" />
                            {t('common.share')}
                        </button>
                    </motion.div>

                    {/* Featured Image */}
                    {article.thumbnail_url && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-12 rounded-[2rem] overflow-hidden shadow-xl cursor-zoom-in"
                            onClick={() => article.thumbnail_url && handleImageClick(getImageUrl(article.thumbnail_url))}
                        >
                            <img
                                src={getImageUrl(article.thumbnail_url)}
                                alt={translatedTitle}
                                className="w-full h-auto"
                            />
                        </motion.div>
                    )}

                    {/* Content */}
                        <ArticleContent body={translatedBody} onImageClick={handleImageClick} />
                    </motion.div>

                    {/* Blog CTA Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-16 p-8 md:p-12 bg-forest/5 rounded-[2.5rem] border border-forest/10 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-matcha/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-forest/10 rounded-full -ml-16 -mb-16 blur-3xl" />
                        
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-3xl md:text-4xl font-headers text-forest">
                                {t('blog.cta.title')}
                            </h3>
                            <p className="text-bark/70 text-lg max-w-2xl mx-auto italic">
                                {article.category === 'therapy' 
                                    ? t('blog.cta.description_therapy') 
                                    : t('blog.cta.description_yoga')}
                            </p>
                            <div className="pt-4">
                                <button
                                    onClick={() => navigate('/contacto')}
                                    className="px-10 py-4 bg-forest text-white rounded-full font-headers uppercase tracking-widest text-sm hover:bg-matcha hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    {t('blog.cta.button')}
                                </button>
                            </div>
                        </div>
                    </motion.section>

                    {/* Related */}
                    <RelatedArticles articles={relatedArticles} />
                </article>
            </main>

            <Footer />

            <ArticleLightbox 
                selectedImage={selectedImage}
                isZoomed={isZoomed}
                onClose={() => setSelectedImage(null)}
                onToggleZoom={() => setIsZoomed(!isZoomed)}
            />

            <style>{`
                .prose { 
                    font-family: "Mulish", sans-serif; 
                    color: #5D4037; 
                    font-size: 1.125rem; 
                    line-height: 1.8;
                }
                .prose h1, .prose h2, .prose h3 { font-family: "Cormorant Garamond", serif; color: #2F4F4F; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; }
                .prose h1 { font-size: 2.5rem; }
                .prose h2 { font-size: 2rem; }
                .prose h3 { font-size: 1.75rem; }
                .prose blockquote { border-left: 4px solid #8FBC8F; padding-left: 1.5rem; font-style: italic; color: #5D4037; margin: 2rem 0; }
                .prose a { color: #8FBC8F; text-decoration: underline; }
                .prose img { margin: 2rem auto; display: block; }
            `}</style>
        </div>
    );
};

export default BlogDetailPage;
