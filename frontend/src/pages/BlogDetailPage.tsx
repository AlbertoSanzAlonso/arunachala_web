import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'config';
import { getTranslated } from 'utils/translate';
import { getImageUrl } from 'utils/imageUtils';
import { useUIStore } from 'store/uiStore';
import { Article } from 'types/blog';
import { getContentDetailPath, getContentListPath } from 'utils/contentPaths';

import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import PageSEO from 'components/providers/PageSEO';
import ArticleContent from 'components/sections/ArticleContent';
import RelatedArticles from 'components/sections/RelatedArticles';
import ArticleLightbox from 'components/sections/ArticleLightbox';
import FloatingNavigation from 'components/sections/FloatingNavigation';
import BottomNavigation from 'components/sections/BottomNavigation';
import ArticleHeader from 'components/sections/ArticleHeader';
import ArticleCTA from 'components/sections/ArticleCTA';
import ContentComments from 'components/sections/ContentComments';

const BASE_URL = 'https://www.yogayterapiasarunachala.es';

const BlogDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { t, i18n } = useTranslation();
    const { addToast } = useUIStore();
    const navigate = useNavigate();
    const location = useLocation();
    const isNewsRoute = location.pathname.startsWith('/noticias');

    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [thumbnailFailed, setThumbnailFailed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [prevArticle, setPrevArticle] = useState<Article | null>(null);
    const [nextArticle, setNextArticle] = useState<Article | null>(null);

    const fetchRelatedContent = useCallback(async (
        contentType: 'article' | 'announcement',
        category: string | null | undefined,
        currentId: number,
        tags: string[] = []
    ) => {
        try {
            const categoryParam = contentType === 'article' && category
                ? `&category=${encodeURIComponent(category)}`
                : '';
            const response = await fetch(
                `${API_BASE_URL}/api/content?type=${contentType}&status=published${categoryParam}&limit=40`
            );
            if (response.ok) {
                const data = await response.json();

                const currentIndex = data.findIndex((a: Article) => a.id === currentId);
                if (currentIndex !== -1) {
                    setCurrentPage(Math.floor(currentIndex / 9) + 1);
                    setPrevArticle(data[currentIndex - 1] || null);
                    setNextArticle(data[currentIndex + 1] || null);
                }

                const scored = data
                    .filter((a: Article) => a.id !== currentId)
                    .map((a: Article) => {
                        const matchingTags = (a.tags || []).filter(tag => tags.includes(tag));
                        return { article: a, score: matchingTags.length };
                    })
                    .filter((item: { article: Article; score: number }) =>
                        item.score > 0 ||
                        contentType === 'announcement' ||
                        (category && item.article.category === category)
                    )
                    .sort((a: { article: Article; score: number }, b: { article: Article; score: number }) => {
                        if (b.score !== a.score) return b.score - a.score;
                        return new Date(b.article.created_at).getTime() - new Date(a.article.created_at).getTime();
                    });

                setRelatedArticles(scored.slice(0, 3).map((s: { article: Article }) => s.article));
            }
        } catch (error) {
            console.error('Error fetching related content:', error);
        }
    }, []);

    const fetchArticle = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/content/slug/${slug}`);
            if (response.ok) {
                const data = await response.json();
                const contentType = data.type === 'announcement' ? 'announcement' : 'article';

                // Keep blog and news URLs separated
                if (contentType === 'announcement' && !isNewsRoute) {
                    navigate(`/noticias/${data.slug}${location.search}`, { replace: true });
                    return;
                }
                if (contentType === 'article' && isNewsRoute) {
                    navigate(`/blog/${data.slug}${location.search}`, { replace: true });
                    return;
                }

                setArticle(data);
                setThumbnailFailed(false);
                fetchRelatedContent(contentType, data.category, data.id, data.tags || []);
            } else {
                navigate(isNewsRoute ? '/noticias' : '/blog');
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            navigate(isNewsRoute ? '/noticias' : '/blog');
        } finally {
            setIsLoading(false);
        }
    }, [slug, navigate, fetchRelatedContent, isNewsRoute, location.search]);

    useEffect(() => {
        if (slug) fetchArticle();
    }, [slug, fetchArticle]);

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
            } catch (err) { console.error("Share failed:", err); }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                addToast('success', t('common.copied_to_clipboard'));
            } catch (err) { console.error("Copy failed:", err); }
        }
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedImage(null); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    useEffect(() => {
        document.body.style.overflow = selectedImage ? 'hidden' : 'unset';
    }, [selectedImage]);

    if (isLoading || !article) {
        return (
            <div className="min-h-screen bg-bone flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forest"></div>
            </div>
        );
    }

    const isAnnouncement = article.type === 'announcement';
    const contentType = isAnnouncement ? 'announcement' : 'article';
    const listPath = getContentListPath(contentType);
    const detailPath = getContentDetailPath(contentType, article.slug);

    const translatedTitle = getTranslated(article, 'title', i18n.language);
    const translatedBody = getTranslated(article, 'body', i18n.language);
    const translatedExcerpt = getTranslated(article, 'excerpt', i18n.language);
    const thumbnailSrc =
        article.thumbnail_url &&
        !article.thumbnail_url.includes('om_symbol.webp') &&
        !article.thumbnail_url.includes('logo_icon.webp') &&
        !article.thumbnail_url.includes('lotus_flower')
            ? getImageUrl(article.thumbnail_url)
            : '';
    const showThumbnail = Boolean(thumbnailSrc) && !thumbnailFailed;

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': isAnnouncement ? 'NewsArticle' : 'BlogPosting',
        headline: translatedTitle,
        description: translatedExcerpt,
        image: article.thumbnail_url ? getImageUrl(article.thumbnail_url) : `${BASE_URL}/logo_wide.webp`,
        datePublished: article.created_at,
        dateModified: article.updated_at || article.created_at,
        author: {
            '@type': 'Person',
            name: 'Susana Pérez Gil',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Arunachala Yoga y Terapias',
            logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/logo_wide.webp`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://www.yogayterapiasarunachala.es${detailPath}/`,
        },
    };

    return (
        <div className="font-body text-bark min-h-screen bg-bone selection:bg-matcha/30">
            <PageSEO
                title={`${translatedTitle} | Arunachala Yoga`}
                description={translatedExcerpt}
                ogImage={article.thumbnail_url ? getImageUrl(article.thumbnail_url) : undefined}
                ogType="article"
                structuredData={structuredData}
                breadcrumbCurrent={{
                    name: translatedTitle,
                    path: `${detailPath}/`,
                }}
            />

            <Header />

            <FloatingNavigation
                prevArticle={prevArticle}
                nextArticle={nextArticle}
                currentPage={currentPage}
                language={i18n.language}
                contentType={contentType}
            />

            <main className="flex-grow pt-4 md:pt-16 pb-16">
                <article className="max-w-4xl mx-auto px-6">
                    <ArticleHeader
                        category={article.category}
                        title={translatedTitle}
                        currentPage={currentPage}
                        onShare={handleShare}
                        prevArticle={prevArticle}
                        language={i18n.language}
                        contentType={contentType}
                        showCategory={!isAnnouncement}
                        backTo={`${listPath}?p=${currentPage}`}
                        backLabel={isAnnouncement
                            ? t('news.back_to_news', 'Volver a Noticias')
                            : t('blog.back_to_blog')}
                    />

                    {showThumbnail && (
                        <div
                            className="mb-12 rounded-[2rem] overflow-hidden shadow-xl cursor-zoom-in"
                            onClick={() => setSelectedImage(thumbnailSrc)}
                        >
                            <img
                                src={thumbnailSrc}
                                alt={translatedTitle}
                                className="w-full h-auto"
                                onError={() => setThumbnailFailed(true)}
                            />
                        </div>
                    )}

                    <ArticleContent body={translatedBody} onImageClick={setSelectedImage} />

                    <ContentComments contentId={article.id} />

                    <div className="lg:hidden mt-12">
                        <BottomNavigation
                            prevArticle={null}
                            nextArticle={nextArticle}
                            currentPage={currentPage}
                            language={i18n.language}
                            isTop={false}
                            contentType={contentType}
                        />
                    </div>

                    <div className="mt-12">
                        <ArticleCTA />
                    </div>

                    <RelatedArticles
                        articles={relatedArticles}
                        contentType={contentType}
                        title={isAnnouncement
                            ? t('news.related', 'Otras noticias')
                            : undefined}
                    />
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
                .prose { font-family: "Mulish", sans-serif; color: #5D4037; font-size: 1.125rem; line-height: 1.8; }
                .prose h1, .prose h2, .prose h3 { font-family: "Cormorant Garamond", serif; color: #2F4F4F; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; }
                .prose h1 { font-size: 2.5rem; }
                .prose h2 { font-size: 2rem; }
                .prose h3 { font-size: 1.75rem; }
                .prose blockquote { border-left: 4px solid #8FBC8F; padding-left: 1.5rem; font-style: italic; color: #5D4037; margin: 2rem 0; }
                .prose a { color: #8FBC8F; text-decoration: underline; }
                .prose img { margin: 2rem auto; display: block; border-radius: 1.5rem; }
            `}</style>
        </div>
    );
};

export default BlogDetailPage;
