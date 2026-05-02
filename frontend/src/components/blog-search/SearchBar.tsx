import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { getTranslated } from 'utils/translate';
import { Article } from 'types/blog';
import { FilterState } from '../BlogSearch';

interface SearchBarProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    articles: Article[];
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
    filters, 
    onFilterChange, 
    articles, 
    showSuggestions, 
    setShowSuggestions 
}) => {
    const { t, i18n } = useTranslation();

    const filteredSuggestions = filters.query === ''
        ? []
        : articles.filter((article) => {
            const title = (getTranslated(article, 'title', i18n.language) || '').toLowerCase();
            return title.includes(filters.query.toLowerCase());
        }).slice(0, 5);

    return (
        <div className="w-full md:flex-grow relative z-30">
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bark/40" />
                <input
                    type="text"
                    value={filters.query}
                    onChange={(e) => {
                        onFilterChange({ ...filters, query: e.target.value });
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setShowSuggestions(false);
                        }
                    }}
                    className="w-full pl-12 pr-10 py-4 bg-white border border-bark/10 rounded-2xl text-bark focus:ring-2 focus:ring-forest/20 focus:border-forest/30 transition-all outline-none shadow-sm text-lg placeholder:text-bark/30"
                    placeholder={t('blog.search.placeholder', 'Buscar artículos...')}
                    autoComplete="off"
                />
                {filters.query && (
                    <button
                        onClick={() => {
                            onFilterChange({ ...filters, query: '' });
                            setShowSuggestions(false);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-bark/30 hover:text-bark/60 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}

                <AnimatePresence>
                    {showSuggestions && (filters.query !== '' || filteredSuggestions.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute mt-2 w-full max-h-60 overflow-auto rounded-xl bg-white p-2 text-base shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm z-50"
                        >
                            {filteredSuggestions.length === 0 ? (
                                <div className="relative cursor-default select-none py-3 px-4 text-center text-bark/40 italic">
                                    {t('blog.search.no_results', 'No se encontraron resultados.')}
                                </div>
                            ) : (
                                filteredSuggestions.map((article) => {
                                    const displayTitle = getTranslated(article, 'title', i18n.language);
                                    return (
                                        <div
                                            key={article.id}
                                            className="relative cursor-pointer select-none py-3 pl-4 pr-4 rounded-lg transition-colors hover:bg-forest/5 hover:text-forest text-bark/80"
                                            onClick={() => {
                                                onFilterChange({ ...filters, query: displayTitle });
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            <span className="block truncate font-normal">
                                                {displayTitle}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SearchBar;
