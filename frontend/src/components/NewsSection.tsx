import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, BellIcon, ArrowRightIcon, TagIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';
import { getImageUrl } from '../utils/imageUtils';
import ArticleModal from './ArticleModal';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    type: string;
    category: string | null;
    thumbnail_url: string | null;
    tags: string[];
    created_at: string;
    translations?: any;
}

const NewsSection: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Increased limit slightly to benefit from the slider
                const response = await fetch(`${API_BASE_URL}/api/content?type=announcement&status=published&limit=10`);
                if (response.ok) {
                    const data = await response.json();
                    setNews(data);
                    // Initialize scroll state after data is loaded and rendered
                    // This needs to be called after the DOM elements are available
                    // A small timeout ensures rendering has occurred
                    setTimeout(() => {
                        handleScroll();
                    }, 0);
                }
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNews();
    }, []); // Empty dependency array means this runs once on mount

    const handleNewsClick = (item: NewsItem) => {
        // We modify the item for the modal to ensure it has a valid category string or default
        const modalItem = {
            ...item,
            category: item.category || 'general'
        };
        setSelectedNews(modalItem as any);
        setIsModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(i18n.language, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            const target = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: target, behavior: 'smooth' });
        }
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    if (isLoading) return null;

    return (
        <section className="mb-24 overflow-hidden">
            <div className="max-w-7xl mx-auto md:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-[10vw] md:px-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-matcha/10 rounded-2xl text-matcha">
                            <BellIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-3xl md:text-4xl font-headers text-forest uppercase tracking-wider">
                                {t('about.news.title', 'Noticias')}
                            </h3>
                            <p className="text-bark/60 italic">
                                {t('about.news.subtitle', 'Sigue de cerca nuestro camino')}
                            </p>
                        </div>
                    </div>

                    {news.length > 0 && (
                        <button
                            onClick={() => navigate('/blog')}
                            className="hidden md:flex items-center gap-2 text-matcha hover:text-forest transition-colors font-headers tracking-widest uppercase text-sm border-b border-matcha/30 hover:border-forest pb-1"
                        >
                            <span>{t('common.view_all_news', 'Ver todas las noticias')}</span>
                            <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {news.length === 0 ? (
                    <div className="text-center py-12 bg-white/40 rounded-[3rem] border border-white/50 border-dashed mx-6 md:mx-0">
                        <p className="text-bark/50 font-light">Próximamente compartiremos noticias y avisos sobre nuestro centro.</p>
                    </div>
                ) : (
                    <div className="relative group/slider">
                        <div className="relative flex items-center">
                            {/* Navigation Arrows */}
                            {news.length > 3 && (
                                <>
                                    <button
                                        onClick={() => scroll('left')}
                                        disabled={!canScrollLeft}
                                        className={`absolute left-0 z-20 p-3 rounded-full bg-white/90 shadow-xl border border-forest/10 -translate-x-1/2 hidden md:flex items-center justify-center transition-all duration-300 hover:bg-forest hover:text-white disabled:opacity-0 disabled:pointer-events-none group-hover/slider:translate-x-0 ${!canScrollLeft ? 'opacity-0' : 'opacity-100'}`}
                                        aria-label="Anterior"
                                    >
                                        <ChevronLeftIcon className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => scroll('right')}
                                        disabled={!canScrollRight}
                                        className={`absolute right-0 z-20 p-3 rounded-full bg-white/90 shadow-xl border border-forest/10 translate-x-1/2 hidden md:flex items-center justify-center transition-all duration-300 hover:bg-forest hover:text-white disabled:opacity-0 disabled:pointer-events-none group-hover/slider:translate-x-0 ${!canScrollRight ? 'opacity-0' : 'opacity-100'}`}
                                        aria-label="Siguiente"
                                    >
                                        <ChevronRightIcon className="w-6 h-6" />
                                    </button>
                                </>
                            )}

                            <div
                                ref={scrollRef}
                                onScroll={handleScroll}
                                className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory md:snap-none hide-scrollbar pb-12 pt-4 px-[10vw] md:px-1 w-full"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {news.map((item, idx) => (
                                    <motion.article
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => handleNewsClick(item)}
                                        className="flex-none w-[80vw] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-center snap-always md:snap-none bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col h-full border border-white"
                                    >
                                        <div className="h-48 bg-forest/5 overflow-hidden relative">
                                            {item.thumbnail_url ? (
                                                <img
                                                    src={getImageUrl(item.thumbnail_url)}
                                                    alt={getTranslated(item, 'title', i18n.language)}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            const icon = document.createElement('div');
                                                            icon.className = "absolute inset-0 flex items-center justify-center opacity-20 text-forest";
                                                            icon.innerHTML = '<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path></svg>';
                                                            parent.appendChild(icon);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest/5 to-matcha/5">
                                                    <TagIcon className="w-12 h-12 text-forest/20" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-8 flex flex-col flex-grow">
                                            <div className="flex items-center gap-2 text-matcha font-headers text-[10px] tracking-widest uppercase mb-4">
                                                <CalendarIcon className="w-4 h-4" />
                                                {formatDate(item.created_at)}
                                            </div>

                                            <h4 className="text-xl font-headers text-forest mb-4 group-hover:text-matcha transition-colors line-clamp-2 leading-tight">
                                                {getTranslated(item, 'title', i18n.language)}
                                            </h4>

                                            <p className="text-bark/70 text-sm leading-relaxed font-light mb-6 line-clamp-3">
                                                {getTranslated(item, 'excerpt', i18n.language) || getTranslated(item, 'body', i18n.language)?.replace(/<[^>]*>/g, '').slice(0, 120) + '...'}
                                            </p>

                                            <div className="mt-auto flex items-center gap-2 text-forest group-hover:text-matcha transition-colors">
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Leer más</span>
                                                <ArrowRightIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center md:hidden">
                    <button
                        onClick={() => navigate('/blog')}
                        className="px-8 py-3 bg-white border border-matcha/30 text-matcha rounded-full font-headers tracking-widest uppercase text-sm hover:bg-matcha hover:text-white transition-all duration-300 shadow-sm"
                    >
                        {t('common.view_all_news', 'Ver todas las noticias')}
                    </button>
                </div>
            </div>

            <ArticleModal
                article={selectedNews as any}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </section>
    );
};

export default NewsSection;
