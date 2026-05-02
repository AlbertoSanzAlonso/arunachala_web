import React from 'react';
import { useTranslation } from 'react-i18next';
import { FilterState } from './index';

interface CategoryTabsProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ filters, onFilterChange }) => {
    const { t } = useTranslation();

    const categories = [
        { id: 'all', name: t('blog.all', 'Todos') },
        { id: 'yoga', name: t('blog.categories.yoga', 'Yoga') },
        { id: 'therapy', name: t('blog.categories.therapy', 'Terapias') },
    ];

    return (
        <div className="flex bg-gray-100/50 p-1.5 rounded-xl w-full md:w-auto shrink-0">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onFilterChange({ ...filters, category: cat.id, tags: [] })}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-headers uppercase tracking-wider transition-all duration-300 ${filters.category === cat.id
                        ? 'bg-white text-forest shadow-sm ring-1 ring-black/5'
                        : 'text-bark/50 hover:text-bark/80 hover:bg-white/50'
                        }`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
};

export default CategoryTabs;
