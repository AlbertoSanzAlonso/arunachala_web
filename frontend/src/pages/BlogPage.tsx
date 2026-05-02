
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import PageSEO from 'components/ui/PageSEO';
import { API_BASE_URL } from 'config';
import { Article } from 'types/blog';

// Modular components
import BlogHeader from 'pages/blog/components/BlogHeader';
import ArticleCard from 'pages/blog/components/ArticleCard';
import BlogPagination from 'pages/blog/components/BlogPagination';

const BlogPage: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        query: '',
        category: 'all',
        year: 'all',
        month: 'all',
        tags: [] as string[]
    });
    
    // Pagination
    const ITEMS_PER_PAGE = 9;
    const [currentPage, setCurrentPage] = useState(() => {
        // 1. Try URL parameter first
        const searchParams = new URLSearchParams(location.search);
        const p = searchParams.get('p');
        if (p) return parseInt(p);
        
        // 2. Fallback to session storage
        const savedPage = sessionStorage.getItem('blog_current_page');
        return savedPage ? parseInt(savedPage) : 1;
    });

    // Protection against filters resetting page on mount
    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        setCurrentPage(1);
    }, [filters]);

    const fetchArticles = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/content?type=article&status=published`);
            if (response.ok) {
                const data = await response.json();
                setArticles(data);
            }
        } catch (error) {
            console.error('Error fetching blog articles:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            await fetchArticles();
            
            // Restore scroll position after data is loaded and rendered
            const savedScroll = sessionStorage.getItem('blog_scroll_pos');
            const savedPage = sessionStorage.getItem('blog_current_page');
            
            if (savedScroll && savedPage) {
                setTimeout(() => {
                    window.scrollTo({
                        top: parseInt(savedScroll),
                        behavior: 'instant' as any
                    });
                    // Only clear after a successful restoration
                    // We can keep them for a bit or clear them here
                    sessionStorage.removeItem('blog_scroll_pos');
                    sessionStorage.removeItem('blog_current_page');
                }, 200); // 200ms to be safe with layout rendering
            }
        };
        
        loadInitialData();

        // Save state on unmount
        return () => {
            if (window.location.pathname.startsWith('/blog/')) {
                sessionStorage.setItem('blog_scroll_pos', window.scrollY.toString());
                sessionStorage.setItem('blog_current_page', currentPage.toString());
            }
        };
    }, [fetchArticles, currentPage]);



    // Filter logic
    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const matchesCategory = filters.category === 'all' || article.category === filters.category;
            const matchesSearch = !filters.query || 
                article.title.toLowerCase().includes(filters.query.toLowerCase()) ||
                (article.body && article.body.toLowerCase().includes(filters.query.toLowerCase()));
            
            // Date filters
            const date = article.created_at ? new Date(article.created_at) : null;
            const matchesYear = filters.year === 'all' || (date && date.getFullYear().toString() === filters.year);
            const matchesMonth = filters.month === 'all' || (date && date.getMonth().toString() === filters.month);
            
            // Tags filter
            const matchesTags = filters.tags.length === 0 || 
                filters.tags.every(tag => (article.tags || []).includes(tag));

            return matchesCategory && matchesSearch && matchesYear && matchesMonth && matchesTags;
        });
    }, [articles, filters]);

    // Paginated results
    const paginatedArticles = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredArticles, currentPage]);

    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);

    return (
        <div className="font-body text-bark min-h-screen flex flex-col bg-bone">
            <PageSEO
                title={t('blog.seo_title', 'Blog | Arunachala Yoga y Terapias')}
                description={t('blog.seo_description', 'Artículos sobre yoga, meditación, terapias naturales y bienestar integral en Barcelona.')}
            />

            <Header />

            <main className="flex-grow">
                {/* Hero */}
                <BlogHeader 
                    filters={filters}
                    onFilterChange={setFilters}
                    articles={articles}
                />

                {/* Content Grid */}
                <section className="max-w-7xl mx-auto px-6 pt-0 pb-20">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
                        </div>
                    ) : (
                        <>
                            {filteredArticles.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                        {paginatedArticles.map((article, index) => (
                                            <ArticleCard 
                                                key={article.id} 
                                                article={article} 
                                                index={index} 
                                                currentPage={currentPage}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    <BlogPagination 
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={(page) => {
                                            setCurrentPage(page);
                                            window.scrollTo({ top: 400, behavior: 'smooth' });
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-bark/5">
                                    <div className="text-forest/20 text-6xl mb-6">🔍</div>
                                    <h3 className="text-2xl font-headers text-forest mb-2">
                                        {t('blog.no_results', 'No se han encontrado artículos')}
                                    </h3>
                                    <p className="text-bark/50">
                                        {t('blog.try_other_filters', 'Prueba con otros términos de búsqueda o categorías.')}
                                    </p>
                                    <button 
                                        onClick={() => setFilters({
                                            query: '',
                                            category: 'all',
                                            year: 'all',
                                            month: 'all',
                                            tags: []
                                        })}
                                        className="mt-8 text-matcha font-headers uppercase tracking-widest text-sm hover:underline"
                                    >
                                        {t('blog.clear_filters', 'Limpiar todos los filtros')}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPage;
