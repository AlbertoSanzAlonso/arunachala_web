import React, { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

interface Review {
    id: string | number;
    author: string;
    text: string;
    rating: number;
    time: string;
}

const MOCK_REVIEWS: Review[] = [
    {
        id: 1,
        author: "María García",
        text: "Un lugar mágico para reconectar con uno mismo. Las clases de yoga son excepcionales.",
        rating: 5,
        time: "hace 2 semanas"
    },
    {
        id: 2,
        author: "Carlos Ruiz",
        text: "Los terapeutas son muy profesionales. Salí totalmente renovado después del masaje.",
        rating: 5,
        time: "hace 1 mes"
    },
    {
        id: 3,
        author: "Elena Torres",
        text: "El ambiente es paz pura. Me encanta venir a desconectar del ruido de la ciudad.",
        rating: 5,
        time: "hace 3 semanas"
    }
];

const ReviewsSection: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
    const [rating, setRating] = useState(4.9);
    const [totalReviews, setTotalReviews] = useState(124);
    // Use a Google Maps Search URL as the default fallback
    const [googleUrl, setGoogleUrl] = useState("https://www.google.com/maps/search/?api=1&query=Arunachala+Yoga");

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Determine API URL based on environment or default to localhost
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/api/reviews`);

                if (response.ok) {
                    const data = await response.json();
                    if (data.reviews && data.reviews.length > 0) {
                        setReviews(data.reviews);
                        setRating(data.rating || 4.9);
                        setTotalReviews(data.total_reviews || 124);
                        if (data.url) {
                            setGoogleUrl(data.url);
                        }
                    }
                }
            } catch (error) {
                console.log('Using mock reviews (Backend might be offline)');
            }
        };

        fetchReviews();
    }, []);

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
