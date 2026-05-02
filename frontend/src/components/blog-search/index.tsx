import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Article } from 'types/blog';
import { API_BASE_URL } from 'config';

// Subcomponents
import SearchBar from './SearchBar';
import CategoryTabs from './CategoryTabs';
import DateFilters from './DateFilters';
import TagCloud from './TagCloud';

export interface FilterState {
    query: string;
    category: string;
    year: string;
    month: string;
    tags: string[];
}

interface BlogSearchProps {
    articles: Article[];
    onFilterChange: (filters: FilterState) => void;
    initialCategory?: string;
    filters: FilterState;
}

const BlogSearch: React.FC<BlogSearchProps> = ({ articles, onFilterChange, filters }) => {
    const { t, i18n } = useTranslation();
    const [allTags, setAllTags] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const categoryParam = filters.category !== 'all' ? `&category=${filters.category}` : '';
        fetch(`${API_BASE_URL}/api/tags?in_use=true${categoryParam}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => setAllTags(data))
            .catch(err => console.error("Failed to fetch tags for search", err));
    }, [i18n.language, filters.category]);

    const years = useMemo(() => {
        if (!articles || !Array.isArray(articles)) return ['all'];
        const uniqueYears = Array.from(new Set(articles.map(a => {
            if (!a.created_at) return null;
            const d = new Date(a.created_at);
            return isNaN(d.getTime()) ? null : d.getFullYear().toString();
        }).filter(Boolean) as string[])).sort((a, b) => b.localeCompare(a));
        return ['all', ...uniqueYears];
    }, [articles]);

    const months = useMemo(() => {
        if (!articles || !Array.isArray(articles) || filters.year === 'all') return [];
        const uniqueMonths = new Set<string>();
        articles.filter(a => {
            if (!a.created_at) return false;
            const d = new Date(a.created_at);
            return !isNaN(d.getTime()) && d.getFullYear().toString() === filters.year;
        }).forEach(a => {
            const d = new Date(a.created_at);
            uniqueMonths.add(d.getMonth().toString());
        });
        return Array.from(uniqueMonths).sort((a, b) => parseInt(a) - parseInt(b));
    }, [articles, filters.year]);

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

    const availableTags = useMemo(() => {
        const currentLang = i18n.language.split('-')[0];
        return allTags.map(tag => {
            let label = tag.name;
            let translationValue = tag.translations && tag.translations[currentLang];
            if (typeof translationValue === 'object' && translationValue !== null && translationValue.name) {
                label = translationValue.name;
            } else if (typeof translationValue === 'string') {
                label = translationValue;
            }
            return { name: tag.name, label };
        }).sort((a, b) => a.label.localeCompare(b.label));
    }, [allTags, i18n.language]);

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50 p-6 md:p-8">
                
                {/* Top Row: Search & Category Tabs */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8">
                    <SearchBar 
                        filters={filters} 
                        onFilterChange={onFilterChange} 
                        articles={articles} 
                        showSuggestions={showSuggestions} 
                        setShowSuggestions={setShowSuggestions} 
                    />
                    <CategoryTabs filters={filters} onFilterChange={onFilterChange} />
                </div>

                {/* Filters Row */}
                <div className="flex flex-col lg:flex-row gap-6 pt-6 border-t border-bark/5">
                    <DateFilters 
                        filters={filters} 
                        onFilterChange={onFilterChange} 
                        years={years} 
                        months={months} 
                        formatMonthLabel={formatMonthLabel} 
                    />
                    <TagCloud 
                        filters={filters} 
                        onFilterChange={onFilterChange} 
                        availableTags={availableTags} 
                    />
                </div>
            </div>
        </div>
    );
};

export default BlogSearch;
