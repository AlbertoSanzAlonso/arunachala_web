import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Article } from 'types/blog';
import { getTranslated } from 'utils/translate';

interface FloatingNavigationProps {
    prevArticle: Article | null;
    nextArticle: Article | null;
    currentPage: number;
    language: string;
}

const FloatingNavigation: React.FC<FloatingNavigationProps> = ({ 
    prevArticle, 
    nextArticle, 
    currentPage, 
    language
}) => {
    const [hovered, setHovered] = React.useState<'prev' | 'next' | null>(null);

    return (
        <div className="hidden lg:block">
            <AnimatePresence>
                {prevArticle && (
                    <div 
                        className="fixed left-8 top-1/2 -translate-y-1/2 z-50 flex items-center gap-4"
                        onMouseEnter={() => setHovered('prev')}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Link
                                to={`/blog/${prevArticle.slug}?p=${currentPage}`}
                                className="bg-white/90 backdrop-blur-md p-5 rounded-full shadow-2xl border border-forest/20 text-forest hover:bg-forest hover:text-white transition-all group shrink-0 block"
                            >
                                <ChevronLeftIcon className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>

                        <AnimatePresence>
                            {hovered === 'prev' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-forest/10 w-64 pointer-events-none"
                                >
                                    <p className="text-[10px] font-headers uppercase tracking-widest text-matcha mb-1">Anterior</p>
                                    <h4 className="text-forest font-headers text-sm mb-1 line-clamp-1">{getTranslated(prevArticle, 'title', language)}</h4>
                                    <p className="text-bark/60 text-xs line-clamp-2 italic">{getTranslated(prevArticle, 'excerpt', language)}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {nextArticle && (
                    <div 
                        className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex items-center flex-row-reverse gap-4"
                        onMouseEnter={() => setHovered('next')}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <Link
                                to={`/blog/${nextArticle.slug}?p=${currentPage}`}
                                className="bg-white/90 backdrop-blur-md p-5 rounded-full shadow-2xl border border-forest/20 text-forest hover:bg-forest hover:text-white transition-all group shrink-0 block"
                            >
                                <ChevronRightIcon className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>

                        <AnimatePresence>
                            {hovered === 'next' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-forest/10 w-64 text-right pointer-events-none"
                                >
                                    <p className="text-[10px] font-headers uppercase tracking-widest text-matcha mb-1">Siguiente</p>
                                    <h4 className="text-forest font-headers text-sm mb-1 line-clamp-1">{getTranslated(nextArticle, 'title', language)}</h4>
                                    <p className="text-bark/60 text-xs line-clamp-2 italic">{getTranslated(nextArticle, 'excerpt', language)}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingNavigation;
