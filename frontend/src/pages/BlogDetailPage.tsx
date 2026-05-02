import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'config';
import { getTranslated } from 'utils/translate';
import { getImageUrl } from 'utils/imageUtils';
import { useUIStore } from 'store/uiStore';
import { Article } from 'types/blog';

// Components
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import PageSEO from 'components/ui/PageSEO';
import ArticleContent from 'pages/blog/components/ArticleContent';
import RelatedArticles from 'pages/blog/components/RelatedArticles';
import ArticleLightbox from 'pages/blog/components/ArticleLightbox';
import FloatingNavigation from 'pages/blog/components/FloatingNavigation';
import BottomNavigation from 'pages/blog/components/BottomNavigation';
import ArticleHeader from 'pages/blog/components/ArticleHeader';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [prevArticle, setPrevArticle] = useState<Article | null>(null);
    const [nextArticle, setNextArticle] = useState<Article | null>(null);

    const fetchRelatedArticles = useCallback(async (category: string, currentId: number, tags: string[] = []) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content?type=article&status=published`);
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
                        const matchingTags = (a.tags || []).filter(t => tags.includes(t));
                        return { article: a, score: matchingTags.length };
                    })
                    .filter((item: any) => item.score > 0 || item.article.category === category)
                    .sort((a: any, b: any) => {
                        if (b.score !== a.score) return b.score - a.score;
                        return new Date(b.article.created_at).getTime() - new Date(a.article.created_at).getTime();
                    });

                setRelatedArticles(scored.slice(0, 3).map((s: any) => s.article));
            }
        } catch (error) {
            console.error('Error fetching related articles:', error);
        }
    }, []);

    const fetchArticle = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/content/slug/${slug}`);
            if (response.ok) {
                const data = await response.json();
                setArticle(data);
                fetchRelatedArticles(data.category, data.id, data.tags || []);
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

    // Close lightbox on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedImage(null); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Prevent scroll when lightbox is open
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

    const translatedTitle = getTranslated(article, 'title', i18n.language);
    const translatedBody = getTranslated(article, 'body', i18n.language);

    return (
        <div className="font-body text-bark min-h-screen bg-bone selection:bg-matcha/30">
            <PageSEO 
                title={`${translatedTitle} | Arunachala Yoga`}
                description={getTranslated(article, 'excerpt', i18n.language)}
                ogImage={article.thumbnail_url ? getImageUrl(article.thumbnail_url) : undefined}
            />
            
            <Header />

            <FloatingNavigation 
                prevArticle={prevArticle}
                nextArticle={nextArticle}
                currentPage={currentPage}
                navigate={navigate}
                language={i18n.language}
            />

            <main className="flex-grow pt-4 md:pt-16 pb-16">
                <article className="max-w-4xl mx-auto px-6">
                    <ArticleHeader 
                        category={article.category}
                        title={translatedTitle}
                        currentPage={currentPage}
                        onShare={handleShare}
                    />

                    {article.thumbnail_url && (
                        <div 
                            className="mb-12 rounded-[2rem] overflow-hidden shadow-xl cursor-zoom-in"
                            onClick={() => setSelectedImage(getImageUrl(article.thumbnail_url!))}
                        >
                            <img src={getImageUrl(article.thumbnail_url)} alt={translatedTitle} className="w-full h-auto" />
                        </div>
                    )}

                    <ArticleContent body={translatedBody} onImageClick={setSelectedImage} />

                    <BottomNavigation 
                        prevArticle={prevArticle}
                        nextArticle={nextArticle}
                        currentPage={currentPage}
                        navigate={navigate}
                        language={i18n.language}
                    />

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
