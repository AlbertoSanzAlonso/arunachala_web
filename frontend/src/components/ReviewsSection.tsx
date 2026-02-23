import React, { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL } from '../config';

interface Review {
    id: string | number;
    author: string;
    text: string;
    rating: number;
    time: string;
}

const ReviewsSection: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    // Use a Google Maps Search URL as the default fallback
    const [googleUrl, setGoogleUrl] = useState("https://www.google.com/maps/search/?api=1&query=Yoga+y+Terapias+Arunachala");

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

    // If no reviews and not loading, we can show a special state or nothing
    if (!isLoading && reviews.length === 0 && rating === 0) {
        return (
            <section className="py-16 bg-bone">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-headers text-forest mb-6">Tu opinión nos importa</h2>
                    <p className="text-bark/70 mb-8 max-w-2xl mx-auto">
                        Aún no hemos conectado las reseñas de Google. Si has pasado por nuestro centro,
                        nos encantaría conocer tu experiencia.
                    </p>
                    <a
                        href={googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-forest text-white px-8 py-3 rounded-full hover:bg-matcha transition-all shadow-lg font-bold"
                    >
                        Dejar una reseña en Google
                    </a>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-bone">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-headers text-forest mb-4">Lo que dicen de nosotros</h2>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-bark">{rating}</span>
                        <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className="h-6 w-6" />
                            ))}
                        </div>
                        <span className="text-bark/60 text-sm">({totalReviews} reseñas en Google)</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-bark/5">
                            <div className="flex items-center gap-1 mb-3 text-yellow-500">
                                {[...Array(Math.round(review.rating))].map((_, i) => (
                                    <StarIcon key={i} className="h-4 w-4" />
                                ))}
                            </div>
                            <p className="text-bark/80 mb-4 italic line-clamp-4">"{review.text}"</p>
                            <div className="flex justify-between items-end border-t border-bark/10 pt-4">
                                <span className="font-bold text-forest">{review.author}</span>
                                <span className="text-xs text-bark/40">{review.time}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <a
                        href={googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-forest font-bold hover:text-matcha transition-colors border-b-2 border-transparent hover:border-matcha"
                    >
                        <span>Ver todas las reseñas en Google</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ReviewsSection;
