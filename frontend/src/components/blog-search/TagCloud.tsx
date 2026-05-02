import React from 'react';
import { TagIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { FilterState } from '../BlogSearch';

interface TagCloudProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    availableTags: { name: string; label: string }[];
}

const TagCloud: React.FC<TagCloudProps> = ({ filters, onFilterChange, availableTags }) => {
    const { t } = useTranslation();

    const toggleTag = (tagName: string) => {
        if (filters.tags.includes(tagName)) {
            onFilterChange({ ...filters, tags: filters.tags.filter(t => t !== tagName) });
        } else {
            onFilterChange({ ...filters, tags: [...filters.tags, tagName] });
        }
    };

    return (
        <div className="flex-grow pt-4 md:pt-0 md:pl-6 md:border-l border-bark/5">
            <label className="flex items-center gap-2 text-xs font-headers uppercase tracking-wider text-bark/40 mb-3 ml-1">
                <TagIcon className="w-3 h-3" />
                {t('blog.search.tags_filter', 'Filtrar por etiquetas')}
            </label>
            <div className="max-h-[120px] overflow-y-auto custom-scrollbar-thin pr-2">
                <div className="flex flex-wrap gap-2">
                    {availableTags.length === 0 ? (
                        <span className="text-sm text-bark/30 italic px-2">{t('blog.no_tags', 'No hay etiquetas disponibles')}</span>
                    ) : (
                        availableTags.map((tag) => {
                            const isActive = filters.tags.includes(tag.name);
                            return (
                                <button
                                    key={tag.name}
                                    onClick={() => toggleTag(tag.name)}
                                    className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 border ${isActive
                                        ? 'bg-forest text-white border-forest shadow-md'
                                        : 'bg-white text-bark/60 border-bark/10 hover:border-forest/30 hover:text-forest'
                                        }`}
                                >
                                    #{tag.label}
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
    );
};

export default TagCloud;
