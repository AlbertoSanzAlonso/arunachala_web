import React from 'react';
import { Article } from 'types/blog';
import { getTranslated } from 'utils/translate';
import { useTranslation } from 'react-i18next';

interface BottomNavigationProps {
    prevArticle: Article | null;
    nextArticle: Article | null;
    currentPage: number;
    navigate: (path: string) => void;
    language: string;
    isTop?: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
    prevArticle, 
    nextArticle, 
    currentPage, 
    navigate,
    language,
    isTop = false
}) => {
    const { t } = useTranslation();

    if (!prevArticle && !nextArticle) return null;

    return (
        <nav className={`grid grid-cols-1 ${nextArticle && prevArticle ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-4 ${isTop ? 'mb-8' : 'mt-16 pt-12 border-t border-bark/5'}`}>
            <div className="text-left">
                {prevArticle && (
                    <button
                        onClick={() => navigate(`/blog/${prevArticle.slug}?p=${currentPage}`)}
                        className="group flex flex-col items-start gap-2 p-6 bg-white rounded-3xl border border-bark/5 hover:border-matcha/30 hover:shadow-lg transition-all w-full h-full text-left"
                    >
                        <span className="text-[10px] font-headers uppercase tracking-widest text-bark/40 group-hover:text-matcha transition-colors">
                            ← {t('meditations.prev', 'Anterior')}
                        </span>
                        <span className="text-forest font-headers text-lg line-clamp-2">
                            {getTranslated(prevArticle, 'title', language)}
                        </span>
                    </button>
                )}
            </div>
            <div className="text-right flex justify-end">
                {nextArticle && (
                    <button
                        onClick={() => navigate(`/blog/${nextArticle.slug}?p=${currentPage}`)}
                        className="group flex flex-col items-end gap-2 p-6 bg-white rounded-3xl border border-bark/5 hover:border-matcha/30 hover:shadow-lg transition-all w-full h-full text-right"
                    >
                        <span className="text-[10px] font-headers uppercase tracking-widest text-bark/40 group-hover:text-matcha transition-colors">
                            {t('meditations.next', 'Siguiente')} →
                        </span>
                        <span className="text-forest font-headers text-lg line-clamp-2">
                            {getTranslated(nextArticle, 'title', language)}
                        </span>
                    </button>
                )}
            </div>
        </nav>
    );
};

export default BottomNavigation;
