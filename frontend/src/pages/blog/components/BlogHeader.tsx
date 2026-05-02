// BlogHeader component for the modularized BlogPage
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import BlogSearch, { FilterState } from 'components/BlogSearch';
import { Article } from 'types/blog';
import BackButton from 'components/ui/BackButton';

interface BlogHeaderProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    articles: Article[];
}

const BlogHeader: React.FC<BlogHeaderProps> = ({
    filters,
    onFilterChange,
    articles
}) => {
    const { t } = useTranslation();

    return (
        <section className="relative w-full bg-bone pt-32 pb-16 flex items-center justify-center overflow-hidden">
            {/* Subtle decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-forest/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-matcha/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

            {/* Back Button */}
            <div className="absolute top-8 left-0 z-20 w-full md:w-auto">
                <BackButton className="text-forest hover:text-matcha transition-colors" label={t('common.back_home')} />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto w-full py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-8xl font-headers text-forest mb-6 tracking-wide uppercase drop-shadow-sm">
                        {t('blog.title', 'Blog y Novedades')}
                    </h1>
                    <p className="text-lg md:text-2xl text-bark/70 mb-12 max-w-2xl font-light leading-relaxed mx-auto">
                        {t('blog.subtitle', 'Explora artículos sobre yoga, bienestar y el camino hacia una vida consciente.')}
                    </p>
                </motion.div>

                {/* Search & Filters Container */}
                <div className="w-full max-w-5xl">
                    <BlogSearch 
                        articles={articles}
                        filters={filters}
                        onFilterChange={onFilterChange}
                    />
                </div>
            </div>
        </section>
    );
};

export default BlogHeader;
