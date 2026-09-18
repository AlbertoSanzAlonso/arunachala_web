import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import PageSEO from 'components/providers/PageSEO';
import { API_BASE_URL } from 'config';
import { Article } from 'types/blog';
import { FilterState } from 'components/blog-search';
import BlogHeader from 'components/sections/BlogHeader';
import ArticleCard from 'components/sections/ArticleCard';
import BlogPagination from 'components/sections/BlogPagination';

const NewsPage: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>({
        query: '',
        category: 'all',
        year: 'all',
        month: 'all',
        tags: []
    });

    const gridRef = useRef<HTMLDivElement>(null);
    const ITEMS_PER_PAGE = 9;
    const [currentPage, setCurrentPage] = useState(() => {
        const searchParams = new URLSearchParams(location.search);
        const p = searchParams.get('p');
        if (p) return parseInt(p);
        const savedPage = sessionStorage.getItem('news_current_page');
        return savedPage ? parseInt(savedPage) : 1;
    });

    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        setCurrentPage(1);
    }, [filters]);

    const fetchNews = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/content?type=announcement&status=published`);
            if (response.ok) {
                const data = await response.json();
                setArticles(data);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFilterChange = useCallback((newFilters: FilterState) => {
        setFilters({ ...newFilters, category: 'all' });
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            await fetchNews();

            const savedScroll = sessionStorage.getItem('news_scroll_pos');
            const savedPage = sessionStorage.getItem('news_current_page');

            if (savedScroll && savedPage) {
                setTimeout(() => {
                    window.scrollTo({
                        top: parseInt(savedScroll),
                        behavior: 'instant' as ScrollBehavior
                    });
                    sessionStorage.removeItem('news_scroll_pos');
                    sessionStorage.removeItem('news_current_page');
                }, 200);
            }
        };

        loadInitialData();

        return () => {
            if (window.location.pathname.startsWith('/noticias/')) {
                sessionStorage.setItem('news_scroll_pos', window.scrollY.toString());
                sessionStorage.setItem('news_current_page', currentPage.toString());
            }
        };
    }, [fetchNews, currentPage]);

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const matchesSearch = !filters.query ||
                article.title.toLowerCase().includes(filters.query.toLowerCase()) ||
                (article.body && article.body.toLowerCase().includes(filters.query.toLowerCase()));

            const date = article.created_at ? new Date(article.created_at) : null;
            const matchesYear = filters.year === 'all' || (date && date.getFullYear().toString() === filters.year);
            const matchesMonth = filters.month === 'all' || (date && date.getMonth().toString() === filters.month);

            const matchesTags = filters.tags.length === 0 ||
                filters.tags.every(tag =>
                    (article.tags || []).some((t: string) => t.toLowerCase() === tag.toLowerCase())
                );

            return matchesSearch && matchesYear && matchesMonth && matchesTags;
        });
    }, [articles, filters]);

    const paginatedArticles = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredArticles, currentPage]);

    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);

    return (
        <div className="font-body text-bark min-h-screen flex flex-col bg-bone">
            <PageSEO
                title={t('news.seo_title', 'Noticias | Arunachala Yoga y Terapias')}
                description={t('news.seo_description', 'Noticias y avisos del centro Aruṇāchala Yoga y Terapias en Cornellà.')}
            />

            <Header />

            <main className="flex-grow">
                <BlogHeader
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    articles={articles}
                    title={t('news.title', 'Noticias')}
                    subtitle={t('news.subtitle', 'Sigue de cerca nuestro camino')}
                    hideCategoryTabs
                    backTo="/quienes-somos"
                    backLabel={t('news.back_to_about', 'Volver a Quiénes somos')}
                    searchPlaceholder={t('news.search_placeholder', 'Buscar noticias...')}
                />

                <section ref={gridRef} className="max-w-7xl mx-auto px-6 pt-0 pb-20 scroll-mt-32">
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
                                                contentType="announcement"
                                                showCategory={false}
                                            />
                                        ))}
                                    </div>

                                    <BlogPagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={(page) => {
                                            setCurrentPage(page);
                                            const grid = gridRef.current;
                                            if (grid) {
                                                const targetY = grid.offsetTop - 120;
                                                window.scrollTo({ top: targetY, behavior: 'auto' });
                                                setTimeout(() => {
                                                    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }, 100);
                                            }
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-bark/5">
                                    <div className="text-forest/20 text-6xl mb-6">🔍</div>
                                    <h3 className="text-2xl font-headers text-forest mb-2">
                                        {t('news.no_results', 'No se han encontrado noticias')}
                                    </h3>
                                    <p className="text-bark/50">
                                        {t('news.try_other_filters', 'Prueba con otros términos de búsqueda.')}
                                    </p>
                                    <button
                                        onClick={() => handleFilterChange({
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

export default NewsPage;
