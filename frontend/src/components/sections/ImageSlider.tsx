import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageSliderProps {
    images: string[];
    interval?: number;
    children?: React.ReactNode;
}

const variants = {
    enter: {
        opacity: 0
    },
    center: {
        zIndex: 1,
        opacity: 1
    },
    exit: {
        zIndex: 0,
        opacity: 0
    }
};

const ImageSlider: React.FC<ImageSliderProps> = ({ images, interval = 5000, children }) => {
    const [[page, direction], setPage] = useState([0, 0]);

    const currentIndex = Math.abs(page % images.length);

    useEffect(() => {
        const slideInterval = setInterval(() => {
            paginate(1);
        }, interval);
        return () => clearInterval(slideInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, interval]);

    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    };

    const goToSlide = (slideIndex: number) => {
        const dir = slideIndex > currentIndex ? 1 : -1;
        setPage([slideIndex, dir]);
    };

    return (
        <div className="relative w-full h-[500px] md:h-[600px] group overflow-hidden rounded-2xl bg-forest/5">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={page}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        opacity: { duration: 1.0, ease: "easeInOut" }
                    }}
                    className="absolute inset-0 w-full h-full"
                >
                    <div
                        style={{ backgroundImage: `url(${images[currentIndex]})` }}
                        className="w-full h-full bg-center bg-cover"
                    >
                        {/* Gradient and Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bark/60"></div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Custom Overlay Content */}
            {children && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {children}
                </div>
            )}

            {/* Left Arrow */}
            <div className="absolute top-[50%] -translate-y-1/2 left-4 md:left-8 z-30">
                <button
                    onClick={() => paginate(-1)}
                    className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-matcha hover:text-white transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-0"
                    aria-label="Anterior"
                >
                    <ChevronLeftIcon className="h-8 w-8" />
                </button>
            </div>

            {/* Right Arrow */}
            <div className="absolute top-[50%] -translate-y-1/2 right-4 md:right-8 z-30">
                <button
                    onClick={() => paginate(1)}
                    className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-matcha hover:text-white transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100 transform translate-x-full group-hover:translate-x-0"
                    aria-label="Siguiente"
                >
                    <ChevronRightIcon className="h-8 w-8" />
                </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30">
                {images.map((_, slideIndex) => (
                    <button
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`transition-all duration-500 rounded-full shadow-sm ${currentIndex === slideIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white hover:w-4'}`}
                        aria-label={`Ir a imagen ${slideIndex + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default ImageSlider;
