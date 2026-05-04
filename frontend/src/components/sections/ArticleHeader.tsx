import React from 'react';
import { motion } from 'framer-motion';
import { ShareIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import BackButton from 'components/ui/BackButton';

import { Article } from 'types/blog';
import { getTranslated } from 'utils/translate';

interface ArticleHeaderProps {
    category: string;
    title: string;
    currentPage: number;
    onShare: () => void;
    prevArticle?: Article | null;
    navigate?: (path: string) => void;
    language?: string;
}

const ArticleHeader: React.FC<ArticleHeaderProps> = ({ 
    category, 
    title, 
    currentPage, 
    onShare,
    prevArticle,
    navigate,
    language
}) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="mb-4">
                <BackButton to={`/blog?p=${currentPage}`} label={t('blog.back_to_blog')} />
            </div>

            {/* Previous Article Button for Mobile */}
            {prevArticle && navigate && language && (
                <div className="lg:hidden mb-6">
                    <button
                        onClick={() => navigate(`/blog/${prevArticle.slug}?p=${currentPage}`)}
                        className="flex items-center gap-2 text-matcha font-headers text-xs uppercase tracking-widest hover:underline"
                    >
                        <span>← {t('meditations.prev', 'Anterior')}:</span>
                        <span className="truncate max-w-[200px] normal-case font-body italic opacity-70">
                            {getTranslated(prevArticle, 'title', language)}
                        </span>
                    </button>
                </div>
            )}

            <div className="mb-6 flex items-center justify-between">
                <span className="inline-block bg-forest text-white px-4 py-2 rounded-full text-sm font-headers tracking-wider">
                    {t(`blog.categories.${category}`, category)}
                </span>
                
                <button
                    onClick={onShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-forest/20 text-forest hover:bg-forest hover:text-white transition-all text-sm font-medium"
                >
                    <ShareIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('common.share')}</span>
                </button>
            </div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-headers text-forest mb-12 leading-tight"
            >
                {title}
            </motion.h1>
        </>
    );
};

export default ArticleHeader;
