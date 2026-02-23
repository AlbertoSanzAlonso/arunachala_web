import React, { useState, useEffect, Fragment, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, CalendarIcon, CheckIcon, XMarkIcon, TagIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getTranslated } from '../utils/translate';
import { Article } from '../types/blog';
import { API_BASE_URL } from '../config';

interface BlogSearchProps {
    articles: Article[];
    onFilterChange: (filters: FilterState) => void;
    initialCategory?: string;
    filters: FilterState;
}

export interface FilterState {
    query: string;
    category: string;
    year: string;
    month: string;
    tags: string[];
}

const BlogSearch: React.FC<BlogSearchProps> = ({ articles, onFilterChange, initialCategory = 'all', filters }) => {
    const { t, i18n } = useTranslation();
    const [allTags, setAllTags] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        // Fetch official tags for the selected category (yoga or therapy)
        const categoryParam = filters.category !== 'all' ? `&category=${filters.category}` : '';
        fetch(`${API_BASE_URL}/api/tags?in_use=true${categoryParam}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => setAllTags(data))
            .catch(err => console.error("Failed to fetch tags for search", err));
    }, [i18n.language, filters.category]);

    // Extract available years
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(articles.map(a => new Date(a.created_at).getFullYear().toString()))).sort((a, b) => b.localeCompare(a));
        return ['all', ...uniqueYears];
    }, [articles]);

    // Extract available months for the SELECTED Year
    const months = useMemo(() => {
        if (filters.year === 'all') return [];

        const uniqueMonths = new Set<string>();
        articles.filter(a => {
            const d = new Date(a.created_at);
            return !isNaN(d.getTime()) && d.getFullYear().toString() === filters.year;
        }).forEach(a => {
            const d = new Date(a.created_at);
            uniqueMonths.add(d.getMonth().toString());
        });

        return Array.from(uniqueMonths).sort((a, b) => parseInt(a) - parseInt(b));
    }, [articles, filters.year]);

    // Reset month if year changes
    useEffect(() => {
        if (filters.year === 'all' && filters.month !== 'all') {
            onFilterChange({ ...filters, month: 'all' });
        }
    }, [filters.year, filters.month, filters, onFilterChange]);

    const formatMonthLabel = (monthIndex: string) => {
        if (monthIndex === 'all') return t('blog.search.all_months', 'Todos los meses');
        const date = new Date(2000, parseInt(monthIndex), 1);
        const label = date.toLocaleDateString(i18n.language, { month: 'long' });
        return label.charAt(0).toUpperCase() + label.slice(1);
    };

    // Extract available tags (translated)
    const availableTags = useMemo(() => {
        const currentLang = i18n.language.split('-')[0];

        const translatedNames = allTags.map(tag => {
            let translationValue = tag.translations && tag.translations[currentLang];
            if (typeof translationValue === 'object' && translationValue !== null && translationValue.name) {
                return translationValue.name;
            } else if (typeof translationValue === 'string') {
                return translationValue;
            }
            if (currentLang !== 'es') {
                return null;
            }
            return tag.name;
        }).filter(Boolean);

        return Array.from(new Set(translatedNames)).sort();
    }, [allTags, i18n.language]);

    // Filtered suggestions for autocomplete
    const filteredSuggestions = filters.query === ''
        ? []
        : articles.filter((article) => {
            const title = (getTranslated(article, 'title', i18n.language) || '').toLowerCase();
            return title.includes(filters.query.toLowerCase());
        }).slice(0, 5);

    const categories = [
        { id: 'all', name: t('blog.all', 'Todos') },
        { id: 'yoga', name: t('blog.categories.yoga', 'Yoga') },
        { id: 'therapy', name: t('blog.categories.therapy', 'Terapias') },
    ];

    const toggleTag = (tag: string) => {
        if (filters.tags.includes(tag)) {
            onFilterChange({ ...filters, tags: filters.tags.filter(t => t !== tag) });
        } else {
            onFilterChange({ ...filters, tags: [...filters.tags, tag] });
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto mb-16">
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50 p-6 md:p-8">

                {/* Top Row: Search & Category Tabs */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8">

                    {/* Search Input */}
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

                    {/* Category Tabs */}
                    <div className="flex bg-gray-100/50 p-1.5 rounded-xl w-full md:w-auto shrink-0">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => onFilterChange({ ...filters, category: cat.id })}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-headers uppercase tracking-wider transition-all duration-300 ${filters.category === cat.id
                                    ? 'bg-white text-forest shadow-sm ring-1 ring-black/5'
                                    : 'text-bark/50 hover:text-bark/80 hover:bg-white/50'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                </div>

                {/* Filters Row: Years -> Months & Tags */}
                <div className="flex flex-col lg:flex-row gap-6 pt-6 border-t border-bark/5">

                    {/* Date Filters Group */}
                    <div className="flex gap-4 md:w-auto shrink-0 flex-wrap">

                        {/* Year Filter */}
                        <div className="w-32 md:w-40">
                            <label className="block text-xs font-headers uppercase tracking-wider text-bark/40 mb-3 ml-1">
                                {t('blog.search.year', 'Año')}
                            </label>
                            <Listbox value={filters.year} onChange={(val) => onFilterChange({ ...filters, year: val })}>
                                <div className="relative">
                                    <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white border border-bark/10 py-3 pl-4 pr-10 text-left hover:border-forest/30 transition-colors focus:outline-none focus:ring-2 focus:ring-forest/20">
                                        <span className="block truncate text-bark/70">
                                            {filters.year === 'all' ? t('blog.search.all_years', 'Todos') : filters.year}
                                        </span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <CalendarIcon className="h-5 w-5 text-bark/30" />
                                        </span>
                                    </Listbox.Button>
                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveTo="opacity-0">
                                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-40">
                                            {years.map((year, idx) => (
                                                <Listbox.Option
                                                    key={idx}
                                                    className={({ active }) => `relative cursor-pointer select-none py-2 pl-4 pr-4 ${active ? 'bg-forest/5 text-forest' : 'text-bark/70'}`}
                                                    value={year}
                                                >
                                                    {({ selected }) => (
                                                        <div className="flex items-center justify-between">
                                                            <span className={`block truncate ${selected ? 'font-medium text-forest' : 'font-normal'}`}>
                                                                {year === 'all' ? t('blog.search.all_years', 'Todos') : year}
                                                            </span>
                                                            {selected && <CheckIcon className="h-4 w-4 text-forest" />}
                                                        </div>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </Listbox>
                        </div>

                        {/* Month Filter (Conditioned on Year selected) */}
                        {filters.year !== 'all' && (
                            <div className="w-32 md:w-40 animate-in fade-in slide-in-from-left-4 duration-300">
                                <label className="block text-xs font-headers uppercase tracking-wider text-bark/40 mb-3 ml-1">
                                    {t('blog.search.month', 'Mes')}
                                </label>
                                <Listbox value={filters.month} onChange={(val) => onFilterChange({ ...filters, month: val })}>
                                    <div className="relative">
                                        <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white border border-bark/10 py-3 pl-4 pr-10 text-left hover:border-forest/30 transition-colors focus:outline-none focus:ring-2 focus:ring-forest/20">
                                            <span className="block truncate text-bark/70">
                                                {formatMonthLabel(filters.month)}
                                            </span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <CalendarIcon className="h-5 w-5 text-bark/30" />
                                            </span>
                                        </Listbox.Button>
                                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveTo="opacity-0">
                                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-40">
                                                <Listbox.Option
                                                    className={({ active }) => `relative cursor-pointer select-none py-2 pl-4 pr-4 ${active ? 'bg-forest/5 text-forest' : 'text-bark/70'}`}
                                                    value="all"
                                                >
                                                    {({ selected }) => (
                                                        <div className="flex items-center justify-between">
                                                            <span className={`block truncate ${selected ? 'font-medium text-forest' : 'font-normal'}`}>
                                                                {t('blog.search.all_months', 'Todos')}
                                                            </span>
                                                            {selected ? <CheckIcon className="h-4 w-4 text-forest" /> : null}
                                                        </div>
                                                    )}
                                                </Listbox.Option>

                                                {months.map((monthIndex) => (
                                                    <Listbox.Option
                                                        key={monthIndex}
                                                        className={({ active }) => `relative cursor-pointer select-none py-2 pl-4 pr-4 ${active ? 'bg-forest/5 text-forest' : 'text-bark/70'}`}
                                                        value={monthIndex}
                                                    >
                                                        {({ selected }) => (
                                                            <div className="flex items-center justify-between">
                                                                <span className={`block truncate ${selected ? 'font-medium text-forest' : 'font-normal'}`}>
                                                                    {formatMonthLabel(monthIndex)}
                                                                </span>
                                                                {selected && <CheckIcon className="h-4 w-4 text-forest" />}
                                                            </div>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </Listbox>
                            </div>
                        )}

                    </div>

                    {/* Tags Cloud */}
                    <div className="flex-grow pt-4 md:pt-0 md:pl-6 md:border-l border-bark/5">
                        <label className="block text-xs font-headers uppercase tracking-wider text-bark/40 mb-3 ml-1 flex items-center gap-2">
                            <TagIcon className="w-3 h-3" />
                            {t('blog.search.tags_filter', 'Filtrar por etiquetas')}
                        </label>
                        <div className="max-h-[120px] overflow-y-auto custom-scrollbar-thin pr-2">
                            <div className="flex flex-wrap gap-2">
                                {availableTags.length === 0 ? (
                                    <span className="text-sm text-bark/30 italic px-2">{t('blog.no_tags', 'No hay etiquetas disponibles')}</span>
                                ) : (
                                    availableTags.map((tag) => {
                                        const isActive = filters.tags.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 border ${isActive
                                                    ? 'bg-forest text-white border-forest shadow-md'
                                                    : 'bg-white text-bark/60 border-bark/10 hover:border-forest/30 hover:text-forest'
                                                    }`}
                                            >
                                                #{tag}
                                            </button>
                                        );
                                    })
                                )}
                                {filters.tags.length > 0 && (
                                    <button
                                        onClick={() => onFilterChange({ ...filters, tags: [] })}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium text-bark/40 hover:text-red-500 transition-colors ml-2"
                                    >
                                        {t('blog.clear_tags', 'Limpiar')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BlogSearch;
