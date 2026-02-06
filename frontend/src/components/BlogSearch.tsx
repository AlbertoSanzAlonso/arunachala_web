import React, { useState, useEffect, Fragment, useMemo } from 'react';
import { Combobox, Listbox, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, CalendarIcon, FunnelIcon, CheckIcon, XMarkIcon, TagIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { getTranslated } from '../utils/translate';
import { Article } from '../types/blog';

interface BlogSearchProps {
    articles: Article[];
    onFilterChange: (filters: FilterState) => void;
    initialCategory?: string;
}

export interface FilterState {
    query: string;
    category: string;
    year: string;
    month: string;
    tags: string[];
}

const BlogSearch: React.FC<BlogSearchProps> = ({ articles, onFilterChange, initialCategory = 'all' }) => {
    const { t, i18n } = useTranslation();

    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);

    // Date Filters: Year -> Month
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');

    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        if (initialCategory) setSelectedCategory(initialCategory);
    }, [initialCategory]);

    // Update parent when filters change
    useEffect(() => {
        onFilterChange({
            query: query,
            category: selectedCategory,
            year: selectedYear,
            month: selectedMonth,
            tags: selectedTags
        });
    }, [query, selectedCategory, selectedYear, selectedMonth, selectedTags, onFilterChange]);


    // Extract available years
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(articles.map(a => new Date(a.created_at).getFullYear().toString()))).sort((a, b) => b.localeCompare(a));
        return ['all', ...uniqueYears];
    }, [articles]);

    // Extract available months for the SELECTED Year
    const months = useMemo(() => {
        if (selectedYear === 'all') return [];

        const uniqueMonths = new Set<string>();
        articles.filter(a => {
            const d = new Date(a.created_at);
            return !isNaN(d.getTime()) && d.getFullYear().toString() === selectedYear;
        }).forEach(a => {
            const d = new Date(a.created_at);
            uniqueMonths.add(d.getMonth().toString());
        });

        // Numeric sort (0-11)
        return Array.from(uniqueMonths).sort((a, b) => parseInt(a) - parseInt(b));
    }, [articles, selectedYear]);

    // Reset month when year changes to 'all'
    useEffect(() => {
        if (selectedYear === 'all') setSelectedMonth('all');
    }, [selectedYear]);


    const formatMonthLabel = (monthIndex: string) => {
        if (monthIndex === 'all') return t('blog.search.all_months', 'Todos los meses');
        const date = new Date(2000, parseInt(monthIndex), 1); // 2000 is arbitrary leap year safe-ish
        const label = date.toLocaleDateString(i18n.language, { month: 'long' });
        return label.charAt(0).toUpperCase() + label.slice(1);
    };

    // Extract available tags (translated)
    const availableTags = useMemo(() => {
        const tagsSet = new Set<string>();
        articles.forEach(article => {
            let tTags = getTranslated(article, 'tags', i18n.language);
            if (typeof tTags === 'string') {
                try { tTags = JSON.parse(tTags); } catch (e) { }
            }
            const safeTags = (Array.isArray(tTags) && tTags.length > 0) ? tTags : article.tags;

            if (Array.isArray(safeTags)) {
                safeTags.forEach(tag => tagsSet.add(tag));
            }
        });
        return Array.from(tagsSet).sort();
    }, [articles, i18n.language]);

    // Filtered suggestions for autocomplete
    const filteredSuggestions = query === ''
        ? []
        : articles.filter((article) => {
            const title = getTranslated(article, 'title', i18n.language).toLowerCase();
            return title.includes(query.toLowerCase());
        }).slice(0, 5);

    const categories = [
        { id: 'all', name: t('blog.all', 'Todos') },
        { id: 'yoga', name: t('blog.categories.yoga', 'Yoga') },
        { id: 'therapy', name: t('blog.categories.therapy', 'Terapias') },
    ];

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto mb-16">
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50 p-6 md:p-8">

                {/* Top Row: Search & Category Tabs */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8">

                    {/* Search Input */}
                    <div className="w-full md:flex-grow relative z-30">
                        <Combobox value={query} onChange={setQuery}>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bark/40" />
                                <Combobox.Input
                                    className="w-full pl-12 pr-10 py-4 bg-white border border-bark/10 rounded-2xl text-bark focus:ring-2 focus:ring-forest/20 focus:border-forest/30 transition-all outline-none shadow-sm text-lg placeholder:text-bark/30"
                                    displayValue={(article: any) => query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder={t('blog.search.placeholder', 'Buscar artículos...')}
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-bark/30 hover:text-bark/60 transition-colors"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveTo="opacity-0" afterLeave={() => setQuery(query)}>
                                <Combobox.Options className="absolute mt-2 w-full max-h-60 overflow-auto rounded-xl bg-white p-2 text-base shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                                    {filteredSuggestions.length === 0 && query !== '' ? (
                                        <div className="relative cursor-default select-none py-3 px-4 text-center text-bark/40 italic">
                                            {t('blog.search.no_results', 'No se encontraron resultados.')}
                                        </div>
                                    ) : (
                                        filteredSuggestions.map((article) => (
                                            <Combobox.Option
                                                key={article.id}
                                                className={({ active }) => `relative cursor-pointer select-none py-3 pl-4 pr-4 rounded-lg transition-colors ${active ? 'bg-forest/5 text-forest' : 'text-bark/80'}`}
                                                value={getTranslated(article, 'title', i18n.language)}
                                                onClick={() => setQuery(getTranslated(article, 'title', i18n.language))}
                                            >
                                                {({ selected }) => (
                                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                        {getTranslated(article, 'title', i18n.language)}
                                                    </span>
                                                )}
                                            </Combobox.Option>
                                        ))
                                    )}
                                </Combobox.Options>
                            </Transition>
                        </Combobox>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex bg-gray-100/50 p-1.5 rounded-xl w-full md:w-auto shrink-0">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-headers uppercase tracking-wider transition-all duration-300 ${selectedCategory === cat.id
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
                            <Listbox value={selectedYear} onChange={setSelectedYear}>
                                <div className="relative">
                                    <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white border border-bark/10 py-3 pl-4 pr-10 text-left hover:border-forest/30 transition-colors focus:outline-none focus:ring-2 focus:ring-forest/20">
                                        <span className="block truncate text-bark/70">
                                            {selectedYear === 'all' ? t('blog.search.all_years', 'Todos') : selectedYear}
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
                        {selectedYear !== 'all' && (
                            <div className="w-32 md:w-40 animate-in fade-in slide-in-from-left-4 duration-300">
                                <label className="block text-xs font-headers uppercase tracking-wider text-bark/40 mb-3 ml-1">
                                    {t('blog.search.month', 'Mes')}
                                </label>
                                <Listbox value={selectedMonth} onChange={setSelectedMonth}>
                                    <div className="relative">
                                        <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white border border-bark/10 py-3 pl-4 pr-10 text-left hover:border-forest/30 transition-colors focus:outline-none focus:ring-2 focus:ring-forest/20">
                                            <span className="block truncate text-bark/70">
                                                {formatMonthLabel(selectedMonth)}
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
                        <div className="flex flex-wrap gap-2">
                            {/* ... same as before ... */}
                            {availableTags.length === 0 ? (
                                <span className="text-sm text-bark/30 italic px-2">{t('blog.no_tags', 'No hay etiquetas disponibles')}</span>
                            ) : (
                                availableTags.map((tag) => {
                                    const isActive = selectedTags.includes(tag);
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
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={() => setSelectedTags([])}
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
    );
};

export default BlogSearch;
