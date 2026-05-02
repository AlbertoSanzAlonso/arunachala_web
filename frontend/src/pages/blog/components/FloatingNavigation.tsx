import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Article } from 'types/blog';
import { getTranslated } from 'utils/translate';

interface FloatingNavigationProps {
    prevArticle: Article | null;
    nextArticle: Article | null;
    currentPage: number;
    navigate: (path: string) => void;
    language: string;
}

const FloatingNavigation: React.FC<FloatingNavigationProps> = ({ 
    prevArticle, 
    nextArticle, 
    currentPage, 
    navigate,
    language
}) => {
    return (
        <div className="hidden lg:block">
            <AnimatePresence>
                {prevArticle && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => navigate(`/blog/${prevArticle.slug}?p=${currentPage}`)}
                        className="fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-md p-5 rounded-full shadow-2xl border border-forest/20 text-forest hover:bg-forest hover:text-white transition-all group"
                        title={getTranslated(prevArticle, 'title', language)}
                    >
                        <ChevronLeftIcon className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                    </motion.button>
                )}
                {nextArticle && (
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={() => navigate(`/blog/${nextArticle.slug}?p=${currentPage}`)}
                        className="fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-md p-5 rounded-full shadow-2xl border border-forest/20 text-forest hover:bg-forest hover:text-white transition-all group"
                        title={getTranslated(nextArticle, 'title', language)}
                    >
                        <ChevronRightIcon className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingNavigation;
