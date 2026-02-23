import React, { useEffect, useState, useCallback } from 'react';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';

interface Review {
    id: string | number;
    author: string;
    text: string;
    rating: number;
    time: string;
    author_url?: string;
}

const ReviewsSection: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [googleUrl, setGoogleUrl] = useState("https://www.google.com/maps/search/?api=1&query=Yoga+y+Terapias+Arunachala");
    const { t } = useTranslation();

    useEffect(() => {
        const fetchReviews = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/reviews`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.reviews) {
                        setReviews(data.reviews);
                        setRating(data.rating || 0);
                        setTotalReviews(data.total_reviews || 0);
                        if (data.url) {
                            setGoogleUrl(data.url);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const nextReview = useCallback(() => {
        if (reviews.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, [reviews.length]);

    const prevReview = useCallback(() => {
        if (reviews.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    }, [reviews.length]);

    useEffect(() => {
        if (!isAutoPlaying || reviews.length <= 1) return;

        const interval = setInterval(nextReview, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, reviews.length, nextReview]);

    if (!isLoading && reviews.length === 0 && rating === 0) {
        return (
            <section className="py-16 bg-bone">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-headers text-forest mb-6">{t('reviews.reviews_empty_title')}</h2>
                    <p className="text-bark/70 mb-8 max-w-2xl mx-auto">
                        {t('reviews.reviews_empty_desc')}
                    </p>
                    <a
                        href="https://g.page/r/CVw134UN-wSPEBM/review"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-forest text-white px-8 py-3 rounded-full hover:bg-matcha transition-all shadow-lg font-bold"
                    >
                        {t('reviews.reviews_leave')}
                    </a>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-bone overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-headers text-forest mb-4">{t('reviews.reviews_title')}</h2>
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-bark">{rating}</span>
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} className="h-7 w-7" />
                                ))}
                            </div>
                        </div>
                        <a
                            href={googleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-bark/60 text-sm hover:text-forest transition-colors border-b border-dashed border-bark/20"
                        >
                            ({totalReviews} {t('reviews.reviews_google_count')})
                        </a>
                    </div>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Navigation Arrows */}
                    {reviews.length > 1 && (
                        <>
                            <button
                                onClick={() => { prevReview(); setIsAutoPlaying(false); }}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-20 p-2 rounded-full bg-white shadow-md text-forest hover:bg-forest hover:text-white transition-all duration-300"
                                aria-label="Anterior reseña"
                            >
                                <ChevronLeftIcon className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => { nextReview(); setIsAutoPlaying(false); }}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-20 p-2 rounded-full bg-white shadow-md text-forest hover:bg-forest hover:text-white transition-all duration-300"
                                aria-label="Siguiente reseña"
                            >
                                <ChevronRightIcon className="h-6 w-6" />
                            </button>
                        </>
                    )}

                    <div className="relative min-h-[350px] md:min-h-[300px] flex items-center justify-center px-4">
                        <AnimatePresence mode="wait">
                            {reviews.length > 0 && (
                                <motion.a
                                    key={reviews[currentIndex].id}
                                    href={reviews[currentIndex].author_url || googleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="absolute w-full bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 group"
                                    onMouseEnter={() => setIsAutoPlaying(false)}
                                    onMouseLeave={() => setIsAutoPlaying(true)}
                                >
                                    <div className="flex items-center gap-1 mb-6 text-yellow-500">
                                        {[...Array(Math.round(reviews[currentIndex].rating))].map((_, i) => (
                                            <StarIcon key={i} className="h-5 w-5" />
                                        ))}
                                    </div>
                                    <p className="text-bark/80 text-lg md:text-xl mb-8 italic line-clamp-4 leading-relaxed group-hover:text-bark transition-colors">
                                        "{reviews[currentIndex].text}"
                                    </p>
                                    <div className="flex justify-between items-center border-t border-bark/10 pt-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-forest text-lg group-hover:text-matcha transition-colors">
                                                {reviews[currentIndex].author}
                                            </span>
                                            <span className="text-xs text-bark/40 uppercase tracking-widest font-medium">{t('reviews.reviews_verified')}</span>
                                        </div>
                                        <span className="text-xs text-bark/40">{reviews[currentIndex].time}</span>
                                    </div>
                                </motion.a>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center gap-2 mt-12">
                        {reviews.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setCurrentIndex(i); setIsAutoPlaying(false); }}
                                className={`h-2 transition-all duration-300 rounded-full ${i === currentIndex ? 'w-8 bg-forest' : 'w-2 bg-bark/20'}`}
                                aria-label={`Ir a reseña ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <a
                        href="https://g.page/r/CVw134UN-wSPEBM/review"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-forest text-white px-10 py-4 rounded-full hover:bg-matcha transition-all shadow-xl font-bold text-lg hover:-translate-y-1"
                    >
                        <span>{t('reviews.reviews_share')}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ReviewsSection;
