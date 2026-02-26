import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';
import { getImageUrl } from '../utils/imageUtils';
import ArticleModal from '../components/ArticleModal';
import BlogSearch, { FilterState } from '../components/BlogSearch';
import { Article } from '../types/blog';
import PageSEO from '../components/PageSEO';

// Article interface moved to types/blog.ts

const BlogPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial category from URL
    const pathParts = location.pathname.split('/');
    const categoryFromPath = (pathParts[2] && ['yoga', 'therapy'].includes(pathParts[2])) ? pathParts[2] : 'all';

    // Pagination
    const ITEMS_PER_PAGE = 9;
    const [currentPage, setCurrentPage] = useState(1);

    // Filters State
    const [filters, setFilters] = useState<FilterState>({
        query: '',
        category: categoryFromPath,
        year: 'all',
        month: 'all',
        tags: []
    });

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // Modal State
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchArticles();
    }, []);

    // Effect to update filtered articles when filters change
    useEffect(() => {
        let result = articles;

        // Filter by Query
        if (filters.query.trim()) {
            const q = filters.query.toLowerCase();
            // Normalize for better matching (ignoring accents)
            const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const normalizedQ = normalize(q);

            result = result.filter(a => {
                const title = normalize(getTranslated(a, 'title', i18n.language) || '');
                const excerpt = normalize(getTranslated(a, 'excerpt', i18n.language) || '');

                // Robust tags handling
                let tags = getTranslated(a, 'tags', i18n.language);
                if (typeof tags === 'string') {
                    try { tags = JSON.parse(tags); } catch (e) { tags = null; }
                }

                // Ensure we have an array of strings
                const rawTags = Array.isArray(a.tags) ? a.tags : [];
                const safeTags: string[] = (Array.isArray(tags) ? tags : rawTags) || [];

                const tagsMatch = safeTags.some((tag: any) =>
                    typeof tag === 'string' && normalize(tag).includes(normalizedQ)
                );

                return title.includes(normalizedQ) || excerpt.includes(normalizedQ) || tagsMatch;
            });
        }

        // Filter by Category
        if (filters.category !== 'all') {
            result = result.filter(a => a.category === filters.category);
        }

        // Filter by Year
        if (filters.year !== 'all') {
            result = result.filter(a => new Date(a.created_at).getFullYear().toString() === filters.year);
        }

        // Filter by Month
        if (filters.month !== 'all') {
            result = result.filter(a => new Date(a.created_at).getMonth().toString() === filters.month);
        }

        // Filter by Tags (AND logic: article must have all selected tags)
        if (filters.tags && filters.tags.length > 0) {
            result = result.filter(a => {
                // Use raw tags (a.tags) for filtering since filter state uses raw tags
                const rawTags = a.tags || [];
                return filters.tags.every(selectedTag => rawTags.includes(selectedTag));
            });
        }

        setFilteredArticles(result);
        setCurrentPage(1);
    }, [articles, filters, i18n.language]);

    const handleFilterChange = useCallback((newFilters: FilterState) => {
        setFilters(newFilters);

        // Update URL to reflect category change
        if (newFilters.category !== filters.category) {
            const newPath = newFilters.category === 'all' ? '/blog' : `/blog/${newFilters.category}`;
            navigate(newPath, { replace: true });
        }
    }, [filters.category, navigate]);

    const fetchArticles = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content?type=article&status=published`);
            if (response.ok) {
                const data = await response.json();
                setArticles(data);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleArticleClick = async (article: Article) => {
        if (!article.slug) {
            setSelectedArticle(article);
            setIsModalOpen(true);
            return;
        }

        try {
            // Show modal immediately with current data
            setSelectedArticle(article);
            setIsModalOpen(true);

            // Fetch full content in background
            const response = await fetch(`${API_BASE_URL}/api/content/slug/${article.slug}`);
            if (response.ok) {
                const fullArticle = await response.json();
                setSelectedArticle(fullArticle);
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
            <PageSEO
                title={t('blog.seo.title', 'Blog | Arunachala Yoga')}
                description={t('blog.seo.description', 'Artículos sobre yoga, meditación y bienestar')}
                canonical="https://www.yogayterapiasarunachala.es/blog"
            />

            <Header />

            <main className="flex-grow pt-40 md:pt-48 pb-16 relative">
                <div className="max-w-7xl mx-auto px-6 relative w-full">
                    <div className="mb-8 md:mb-0 md:absolute md:top-0 md:left-2 z-20">
                        {
                            filters.category === 'yoga' ? (
                                <BackButton to="/clases-de-yoga" label={t('blog.back_to_yoga', 'Volver a Yoga')} />
                            ) : filters.category === 'therapy' ? (
                                <BackButton to="/terapias-y-masajes" label={t('blog.back_to_therapies', 'Volver a Terapias')} />
                            ) : (
                                <BackButton to="/" label={t('common.back_home', 'Volver al Inicio')} />
                            )
                        }
                    </div>

                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-headers text-forest mb-4 uppercase tracking-wider pt-12 md:pt-0"
                        >
                            {filters.category === 'yoga'
                                ? t('blog.yoga_title', 'Blog de Yoga')
                                : filters.category === 'therapy'
                                    ? t('blog.therapy_title', 'Blog de Terapias')
                                    : t('blog.title', 'Blog')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-bark/70 font-light"
                        >
                            {filters.category === 'yoga'
                                ? t('blog.yoga_subtitle', 'Artículos, consejos y reflexiones sobre la práctica del yoga')
                                : filters.category === 'therapy'
                                    ? t('blog.therapy_subtitle', 'Artículos sobre terapias holísticas, masajes y bienestar')
                                    : t('blog.subtitle', 'Artículos sobre yoga, meditación y bienestar')}
                        </motion.p>
                    </div>

                    {/* Search & Filters */}
                    <BlogSearch
                        articles={articles}
                        onFilterChange={handleFilterChange}
                        initialCategory={categoryFromPath}
                        filters={filters}
                    />

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
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((article, index) => (
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
                                            <h2 className="text-2xl font-headers text-forest mb-3 group-hover:text-matcha transition-colors">
                                                {getTranslated(article, 'title', i18n.language)}
                                            </h2>
                                            <div className="h-20 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                                                <p className="text-bark/70 text-sm leading-relaxed">
                                                    {getTranslated(article, 'excerpt', i18n.language)}
                                                </p>
                                            </div>

                                            {/* Meta Info */}
                                            <div className="flex items-center gap-4 text-sm text-bark/50">
                                                <div className="flex items-center gap-1">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    <span>{formatDate(article.created_at)}</span>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            {(() => {
                                                const translatedTags = getTranslated(article, 'tags', i18n.language);
                                                const safeTags = (Array.isArray(translatedTags) && translatedTags.length > 0) ? translatedTags : article.tags;

                                                if (!safeTags || safeTags.length === 0) return null;

                                                return (
                                                    <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                                                        {safeTags.slice(0, 3).map((tagLabel: string, idx: number) => {
                                                            // Match translated tag to its raw name using the same index
                                                            const rawTagName = article.tags[idx] || tagLabel;
                                                            const isActive = filters.tags.includes(rawTagName);
                                                            return (
                                                                <span
                                                                    key={idx}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const tagName = rawTagName;
                                                                        setFilters(prev => ({
                                                                            ...prev,
                                                                            tags: isActive
                                                                                ? prev.tags.filter(t => t !== tagName)
                                                                                : [...prev.tags, tagName]
                                                                        }));
                                                                    }}
                                                                    className={`px-2 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer ${isActive
                                                                        ? "bg-forest text-white shadow-sm"
                                                                        : "bg-bone text-bark/60 hover:bg-matcha/20 hover:text-forest"
                                                                        }`}
                                                                >
                                                                    #{tagLabel}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </motion.article>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) > 1 && (
                                <div className="flex justify-center items-center gap-2 md:gap-3 mt-16 mb-8">
                                    {/* First Page - Hide if total pages <= 5 */}
                                    {Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) > 5 && (
                                        <button
                                            onClick={() => {
                                                setCurrentPage(1);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            disabled={currentPage === 1}
                                            className={`p-2 rounded-full transition-all ${currentPage === 1
                                                ? 'text-bark/20 cursor-not-allowed'
                                                : 'bg-white text-forest shadow-md hover:bg-forest hover:text-white'
                                                }`}
                                            aria-label="Primera página"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Prev Block - Hide if total pages <= 5 */}
                                    {Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) > 5 && (
                                        <button
                                            onClick={() => {
                                                const prevRangeStart = Math.max(1, Math.floor((currentPage - 1) / 5) * 5 - 4);
                                                setCurrentPage(prevRangeStart);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            disabled={currentPage <= 5}
                                            className={`p-2 rounded-full transition-all ${currentPage <= 5
                                                ? 'text-bark/20 cursor-not-allowed'
                                                : 'bg-white text-forest shadow-md hover:bg-forest hover:text-white'
                                                }`}
                                            aria-label={t('blog.prev_page', 'Anterior')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}

                                    <div className="flex items-center gap-1 md:gap-2">
                                        {(() => {
                                            const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
                                            const rangeSize = 5;
                                            const start = Math.floor((currentPage - 1) / rangeSize) * rangeSize + 1;
                                            const end = Math.min(totalPages, start + rangeSize - 1);

                                            const pages = [];
                                            for (let i = start; i <= end; i++) {
                                                pages.push(
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            setCurrentPage(i);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${currentPage === i
                                                            ? 'bg-forest text-white shadow-lg scale-110'
                                                            : 'bg-white text-bark/60 hover:bg-matcha/20 hover:text-forest'
                                                            }`}
                                                    >
                                                        {i}
                                                    </button>
                                                );
                                            }
                                            return pages;
                                        })()}
                                    </div>

                                    {/* Next Block - Hide if total pages <= 5 */}
                                    {Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) > 5 && (
                                        <button
                                            onClick={() => {
                                                const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
                                                const nextRangeStart = Math.min(totalPages, Math.floor((currentPage - 1) / 5) * 5 + 6);
                                                setCurrentPage(nextRangeStart);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            disabled={(() => {
                                                const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
                                                const currentBlockEnd = Math.floor((currentPage - 1) / 5) * 5 + 5;
                                                return currentBlockEnd >= totalPages;
                                            })()}
                                            className={`p-2 rounded-full transition-all ${(() => {
                                                const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
                                                const currentBlockEnd = Math.floor((currentPage - 1) / 5) * 5 + 5;
                                                return currentBlockEnd >= totalPages;
                                            })()
                                                ? 'text-bark/20 cursor-not-allowed'
                                                : 'bg-white text-forest shadow-md hover:bg-forest hover:text-white'
                                                }`}
                                            aria-label={t('blog.next_page', 'Siguiente')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Last Range - Hide if total pages <= 5 */}
                                    {Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) > 5 && (
                                        <button
                                            onClick={() => {
                                                const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
                                                const lastRangeStart = Math.floor((totalPages - 1) / 5) * 5 + 1;
                                                setCurrentPage(lastRangeStart);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            disabled={(() => {
                                                const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
                                                const lastRangeStart = Math.floor((totalPages - 1) / 5) * 5 + 1;
                                                return currentPage >= lastRangeStart;
                                            })()}
                                            className={`p-2 rounded-full transition-all ${(() => {
                                                const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
                                                const lastRangeStart = Math.floor((totalPages - 1) / 5) * 5 + 1;
                                                return currentPage >= lastRangeStart;
                                            })()
                                                ? 'text-bark/20 cursor-not-allowed'
                                                : 'bg-white text-forest shadow-md hover:bg-forest hover:text-white'
                                                }`}
                                            aria-label="Último rango"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
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
