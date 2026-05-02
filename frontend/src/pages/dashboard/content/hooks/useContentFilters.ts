
import { useState, useEffect, useMemo } from 'react';
import { Content, TabType } from '../types';

export const useContentFilters = (contents: Content[]) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentTab, setCurrentTab] = useState<TabType>('all');
    const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc');
    const [filterType, setFilterType] = useState<'all' | 'week' | 'month' | 'year'>('all');
    const [filterValue, setFilterValue] = useState('');
    const [filterAuthor, setFilterAuthor] = useState<'all' | 'human' | 'ai'>('all');

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, currentTab, filterType, filterValue, filterAuthor]);

    const filteredContents = useMemo(() => {
        return contents
            .filter(item => {
                const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesTab = currentTab === 'all' || 
                    (currentTab === 'meditation' && item.type === 'meditation') ||
                    (currentTab === 'announcement' && item.type === 'announcement') ||
                    (currentTab === 'yoga_article' && item.category === 'yoga') ||
                    (currentTab === 'therapy_article' && item.category === 'therapy');
                
                let matchesDate = true;
                if (filterType !== 'all' && filterValue) {
                    const itemDate = new Date(item.created_at);
                    if (filterType === 'year') {
                        matchesDate = itemDate.getFullYear().toString() === filterValue;
                    } else if (filterType === 'month') {
                        const [year, month] = filterValue.split('-');
                        matchesDate = itemDate.getFullYear().toString() === year && (itemDate.getMonth() + 1).toString().padStart(2, '0') === month;
                    } else if (filterType === 'week') {
                        const [year, weekStr] = filterValue.split('-W');
                        const weekNum = parseInt(weekStr);
                        const firstDayOfYear = new Date(parseInt(year), 0, 1);
                        const days = (weekNum - 1) * 7;
                        const weekStartDate = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + days));
                        const weekEndDate = new Date(weekStartDate);
                        weekEndDate.setDate(weekEndDate.getDate() + 7);
                        matchesDate = itemDate >= weekStartDate && itemDate <= weekEndDate;
                    }
                }

                const isAI = item.author?.first_name?.trim() === 'ArunachalaBot' || Number(item.author_id) === 4;
                const matchesAuthor = filterAuthor === 'all' || 
                    (filterAuthor === 'human' && !isAI) ||
                    (filterAuthor === 'ai' && isAI);

                return matchesSearch && matchesTab && matchesDate && matchesAuthor;
            })
            .sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return dateSort === 'asc' ? dateA - dateB : dateB - dateA;
            });
    }, [contents, searchTerm, currentTab, filterType, filterValue, filterAuthor, dateSort]);

    const searchSuggestions = useMemo(() => {
        return Array.from(new Set(contents.map(c => c.title)))
            .filter(title => title.toLowerCase().includes(searchTerm.toLowerCase()) && title.toLowerCase() !== searchTerm.toLowerCase())
            .slice(0, 5);
    }, [contents, searchTerm]);

    return {
        searchTerm, setSearchTerm,
        showSuggestions, setShowSuggestions,
        currentPage, setCurrentPage,
        currentTab, setCurrentTab,
        dateSort, setDateSort,
        filterType, setFilterType,
        filterValue, setFilterValue,
        filterAuthor, setFilterAuthor,
        filteredContents,
        searchSuggestions
    };
};
