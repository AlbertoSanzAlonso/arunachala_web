import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ImageSliderProps {
    images: string[];
    interval?: number;
    children?: React.ReactNode;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, interval = 5000, children }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const slideInterval = setInterval(() => {
            nextSlide();
        }, interval);
        return () => clearInterval(slideInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, interval]);

    // Reset index if images array shrinks
    useEffect(() => {
        if (currentIndex >= images.length) {
            setCurrentIndex(0);
        }
    }, [images, currentIndex]);

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    };

    return (
        <div className="relative w-full h-[500px] md:h-[600px] group overflow-hidden bg-gray-900 rounded-2xl">
            {/* Main Image Display */}
            <div
                style={{ backgroundImage: `url(${images[currentIndex]})` }}
                className="w-full h-full bg-center bg-cover duration-1000 ease-in-out transition-all transform scale-105"
            >
                {/* Gradient and Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bark/60"></div>
            </div>

            {/* Custom Overlay Content */}
            {children && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {children}
                </div>
            )}

            {/* Left Arrow */}
            <div className="absolute top-[50%] -translate-y-1/2 left-4 md:left-8 z-10">
                <button
                    onClick={prevSlide}
                    className="p-3 rounded-full bg-bone/10 backdrop-blur-sm text-bone hover:bg-matcha hover:text-forest transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-0"
                    aria-label="Anterior"
                >
                    <ChevronLeftIcon className="h-8 w-8" />
                </button>
            </div>

            {/* Right Arrow */}
            <div className="absolute top-[50%] -translate-y-1/2 right-4 md:right-8 z-10">
                <button
                    onClick={nextSlide}
                    className="p-3 rounded-full bg-bone/10 backdrop-blur-sm text-bone hover:bg-matcha hover:text-forest transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100 transform translate-x-full group-hover:translate-x-0"
                    aria-label="Siguiente"
                >
                    <ChevronRightIcon className="h-8 w-8" />
                </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-10">
                {images.map((_, slideIndex) => (
                    <button
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`transition-all duration-500 rounded-full shadow-sm ${currentIndex === slideIndex ? 'w-8 h-2 bg-bone' : 'w-2 h-2 bg-bone/50 hover:bg-bone hover:w-4'}`}
                        aria-label={`Ir a imagen ${slideIndex + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default ImageSlider;
