import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CalendarIcon, TagIcon, ShareIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';
import { getImageUrl } from '../utils/imageUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

    const fetchRelatedArticles = useCallback(async (category: string, currentId: number) => {
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
    }, []);

    const fetchArticle = useCallback(async () => {
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
    }, [slug, navigate, fetchRelatedArticles]);

    useEffect(() => {
        if (slug) {
            fetchArticle();
        }
    }, [slug, fetchArticle]);

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

    const cleanContent = (content: string) => {
        if (!content) return '';
        // Replace literal escaped newlines with actual newlines
        // Also handle double escaping just in case
        let cleaned = content
            .replace(/\\n/g, '\n')
            .replace(/\\\\n/g, '\n')
            .replace(/\\"/g, '"');

        // Remove the first H1 (# Title) if it exists at the start of the content (AI Generated)
        // This allows us to use our own H1 component title for ALL articles (Manual & AI)
        cleaned = cleaned.replace(/^#\s+.+(\n|$)/, '').trim();

        // Fix image URLs inline (Markdown: ![alt](/static/...) -> ![alt](https://.../static/...))
        cleaned = cleaned.replace(/(!\[.*?\]\()([^)]+)(\))/g, (match, p1, p2, p3) => {
            return `${p1}${getImageUrl(p2)}${p3}`;
        });

        // Fix HTML images (<img src="/static/..." /> -> <img src="https://.../static/..." />)
        cleaned = cleaned.replace(/(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi, (match, p1, p2, p3) => {
            return `${p1}${getImageUrl(p2)}${p3}`;
        });

        return cleaned;
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

    const handleShare = async () => {
        if (!article) return;
        const shareUrl = window.location.href;
        const title = translatedTitle;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: translatedExcerpt || t('blog.share_text', 'Echa un vistazo a este artículo en Arunachala Yoga'),
                    url: shareUrl,
                });
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert(t('common.copied_to_clipboard', 'Enlace copiado al portapapeles'));
            } catch (err) {
                console.error("Copy failed:", err);
            }
        }
    };

    return (
        <div className="font-body text-bark min-h-screen flex flex-col relative bg-bone">
            <Helmet>
                <title>{article.seo_title || translatedTitle}</title>
                <meta name="description" content={article.seo_description || translatedExcerpt} />
            </Helmet>

            <Header />

            <main className="flex-grow pt-40 md:pt-48 pb-16">
                <article className="max-w-4xl mx-auto px-6">
                    {/* Back Button */}
                    <div className="mb-0">
                        <BackButton to="/blog" label={t('blog.back_to_blog', 'Volver al Blog')} />
                    </div>

                    {/* Category Badge */}
                    <div className="mb-6">
                        <span className="inline-block bg-forest text-white px-4 py-2 rounded-full text-sm font-headers uppercase tracking-wider">
                            {getCategoryLabel(article.category)}
                        </span>
                    </div>

                    {/* RESTORED TITLE */}
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
                            {t('common.share', 'Compartir')}
                        </button>
                    </motion.div>

                    {/* Featured Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12 rounded-[2rem] overflow-hidden shadow-xl"
                    >
                        {article.thumbnail_url && !article.thumbnail_url.includes('om_symbol.webp') && !article.thumbnail_url.includes('lotus_flower.webp') ? (
                            <img
                                src={getImageUrl(article.thumbnail_url)}
                                alt={translatedTitle}
                                className="w-full h-auto"
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    if (target.getAttribute('data-fallback')) {
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            const fileName = article.thumbnail_url?.split('/').pop() || 'Imagen';
                                            const errDiv = document.createElement('div');
                                            errDiv.className = "w-full h-80 flex items-center justify-center p-8 text-center text-sm text-bark/30 italic break-all bg-forest/5";
                                            errDiv.innerText = fileName;
                                            parent.appendChild(errDiv);
                                        }
                                        return;
                                    }
                                    target.setAttribute('data-fallback', 'true');
                                    target.src = article.category === 'yoga'
                                        ? getImageUrl('/static/gallery/articles/om_symbol.webp')
                                        : getImageUrl('/static/gallery/articles/lotus_flower.webp');
                                    target.className = "w-48 h-48 object-contain opacity-30 mx-auto py-10";
                                }}
                            />
                        ) : (
                            <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-forest/20 to-matcha/20">
                                {(article.category === 'yoga' || (article.thumbnail_url && article.thumbnail_url.includes('om_symbol.webp'))) ? (
                                    <img src={getImageUrl('/static/gallery/articles/om_symbol.webp')} alt="Yoga" className="w-48 h-48 object-contain opacity-30" />
                                ) : (article.category === 'therapy' || (article.thumbnail_url && article.thumbnail_url.includes('lotus_flower.webp'))) ? (
                                    <img src={getImageUrl('/static/gallery/articles/lotus_flower.webp')} alt="Terapia" className="w-48 h-48 object-contain opacity-30" />
                                ) : (
                                    <TagIcon className="w-16 h-16 text-forest/30" />
                                )}
                            </div>
                        )}
                    </motion.div>

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
                        className="mb-12"
                    >
                        <div className="prose prose-lg prose-forest max-w-none">
                            {/<[a-z][\s\S]*>/i.test(translatedBody || '') ? (
                                <div dangerouslySetInnerHTML={{ __html: cleanContent(translatedBody) }} />
                            ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {cleanContent(translatedBody)}
                                </ReactMarkdown>
                            )}
                        </div>
                    </motion.div>

                    {/* Tags */}
                    {(() => {
                        // Manual translation logic for tags to ensure reliability
                        const currentLang = i18n.language?.split('-')[0] || 'es';

                        // Parse translations if string (common issue with some DB/API responses)
                        let translations = article.translations;
                        if (typeof translations === 'string') {
                            try {
                                translations = JSON.parse(translations);
                            } catch (e) {
                                console.error("Error parsing translations:", e);
                                translations = null;
                            }
                        }

                        let currentTags = article.tags;

                        // Check if translations exist and have tags for current language
                        if (
                            translations &&
                            translations[currentLang] &&
                            Array.isArray(translations[currentLang].tags) &&
                            translations[currentLang].tags.length > 0
                        ) {
                            currentTags = translations[currentLang].tags;
                        }

                        console.log('BlogDetail Debug - Lang:', currentLang, 'Tags:', currentTags);

                        if (!currentTags || currentTags.length === 0) return null;

                        return (
                            <motion.div
                                key={currentLang}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-wrap gap-3 mb-12 pt-8 border-t border-bark/10"
                            >
                                <TagIcon className="w-5 h-5 text-bark/40" />
                                {currentTags.map((tag: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-2 bg-white text-bark/70 rounded-full text-sm hover:bg-forest hover:text-white transition-colors cursor-pointer"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </motion.div>
                        );
                    })()}

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
                                            {related.thumbnail_url && !related.thumbnail_url.includes('om_symbol.webp') && !related.thumbnail_url.includes('lotus_flower.webp') ? (
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
                                                            : getImageUrl('/static/gallery/articles/lotus_flower.webp');
                                                        target.className = "w-12 h-12 object-contain opacity-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    {(related.category === 'yoga' || (related.thumbnail_url && related.thumbnail_url.includes('om_symbol.webp'))) ? (
                                                        <img src={getImageUrl('/static/gallery/articles/om_symbol.webp')} alt="Yoga" className="w-12 h-12 object-contain opacity-30 group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (related.category === 'therapy' || (related.thumbnail_url && related.thumbnail_url.includes('lotus_flower.webp'))) ? (
                                                        <img src={getImageUrl('/static/gallery/articles/lotus_flower.webp')} alt="Terapia" className="w-12 h-12 object-contain opacity-30 group-hover:scale-110 transition-transform duration-500" />
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
                    )}
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default BlogDetailPage;
