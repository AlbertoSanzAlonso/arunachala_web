import React from 'react';
import { motion } from 'framer-motion';
import { ShareIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import BackButton from 'components/ui/BackButton';

interface ArticleHeaderProps {
    category: string;
    title: string;
    currentPage: number;
    onShare: () => void;
}

const ArticleHeader: React.FC<ArticleHeaderProps> = ({ 
    category, 
    title, 
    currentPage, 
    onShare 
}) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="mb-4">
                <BackButton to={`/blog?p=${currentPage}`} label={t('blog.back_to_blog')} />
            </div>

            <div className="mb-6">
                <span className="inline-block bg-forest text-white px-4 py-2 rounded-full text-sm font-headers tracking-wider">
                    {t(`blog.categories.${category}`, category)}
                </span>
            </div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-headers text-forest mb-6 leading-tight"
            >
                {title}
            </motion.h1>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between py-6 border-y border-bark/5 mb-12"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-matcha/20 flex items-center justify-center text-forest font-headers">
                        A
                    </div>
                    <div>
                        <p className="text-sm font-headers text-forest uppercase tracking-wider">Arunachala Blog</p>
                    </div>
                </div>

                <button
                    onClick={onShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-forest/20 text-forest hover:bg-forest hover:text-white transition-all text-sm font-medium"
                >
                    <ShareIcon className="w-4 h-4" />
                    {t('common.share')}
                </button>
            </motion.div>
        </>
    );
};

export default ArticleHeader;
