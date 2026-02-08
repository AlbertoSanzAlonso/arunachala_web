
import React, { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { API_BASE_URL } from '../config';

interface TagSelectorProps {
    value: string[];
    onChange: (tags: string[]) => void;
    category?: string;
}


export const TagSelector: React.FC<TagSelectorProps> = ({ value, onChange, category }) => {
    const [query, setQuery] = useState('');
    const [allTags, setAllTags] = useState<any[]>([]);

    useEffect(() => {
        // Fetch existing tags for this category. FORCE in_use=true to hide orphans.
        const catParam = category ? `&category=${category}` : '';
        fetch(`${API_BASE_URL}/api/tags?in_use=true${catParam}`)
            .then(res => {
                if (res.ok) return res.json();
                return [];
            })
            .then(data => setAllTags(data))
            .catch(err => console.error("Failed to load tags", err));
    }, [category]); // Refetch when category changes

    const filteredTags =
        query === ''
            ? allTags
            : allTags.filter((tag) => {
                return tag.name.toLowerCase().includes(query.toLowerCase());
            });

    const addTag = async (tagName: string) => {
        const normalized = tagName.trim();
        if (!normalized) return;

        // Capitalize first letter standard
        const formatted = normalized.charAt(0).toUpperCase() + normalized.slice(1);

        // Check exact match in values
        if (!value.some(t => t.toLowerCase() === formatted.toLowerCase())) {
            onChange([...value, formatted]);
        }

        // Clear input immediately
        setQuery('');

        // Create in Backend (if not already existing in allTags)
        // This makes the tag available globally immediately
        if (!allTags.some(t => t.name.toLowerCase() === formatted.toLowerCase())) {
            try {
                const token = sessionStorage.getItem('access_token');
                const res = await fetch(`${API_BASE_URL}/api/tags`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name: formatted, category: category })
                });

                if (res.ok) {
                    const newTag = await res.json();
                    setAllTags(prev => [...prev, newTag]);
                }
            } catch (err) {
                console.error("Failed to create tag in backend", err);
            }
        }
    };

    const removeTag = async (tagToRemove: string) => {
        const newValue = value.filter(t => t !== tagToRemove);
        onChange(newValue);

        // Find the tag in allTags to get its ID
        const tagObj = allTags.find(t => t.name.toLowerCase() === tagToRemove.toLowerCase());

        if (tagObj) {
            try {
                const token = sessionStorage.getItem('access_token');
                const res = await fetch(`${API_BASE_URL}/api/tags/${tagObj.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'deleted') {
                        // If the backend deleted it (because it was an orphan), remove from local available list
                        setAllTags(prev => prev.filter(t => t.id !== tagObj.id));
                    }
                }
            } catch (err) {
                console.error("Failed to cleanup tag", err);
            }
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-2 mb-2">
                {value.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2 py-1 text-xs font-medium text-forest ring-1 ring-inset ring-forest/20">
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-forest/20 flex items-center justify-center"
                        >
                            <span className="sr-only">Remove</span>
                            <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                        </button>
                    </span>
                ))}
            </div>

            <Combobox value={null} onChange={(selectedTag: any) => {
                if (typeof selectedTag === 'string') {
                    addTag(selectedTag);
                } else if (selectedTag?.name) {
                    addTag(selectedTag.name);
                }
            }}>
                <div className="relative mt-1">
                    <Combobox.Input
                        className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-4 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest sm:text-sm"
                        onChange={(event) => setQuery(event.target.value)}
                        value={query}
                        placeholder="Escribe para buscar o añadir..."
                        autoComplete="off"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag(query);
                            }
                        }}
                    />

                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {query.length > 0 && !filteredTags.some(t => t.name.toLowerCase() === query.toLowerCase()) && (
                            <Combobox.Option
                                value={{ id: 0, name: query }}
                                className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-forest text-white' : 'text-gray-900'}`
                                }
                            >
                                Crear "{query}"
                            </Combobox.Option>
                        )}

                        {filteredTags.map((tag) => (
                            <Combobox.Option
                                key={tag.id}
                                value={tag}
                                className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-forest text-white' : 'text-gray-900'}`
                                }
                            >
                                {({ active, selected }) => (
                                    <>
                                        <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                            {tag.name}
                                        </span>
                                    </>
                                )}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                </div>
            </Combobox>

            {/* Available Tags Cloud */}
            <div className="mt-3 border-t border-gray-100 pt-2">
                <p className="text-xs text-gray-500 mb-2">Disponibles en el sistema:</p>
                <div className="flex flex-wrap gap-1.5">
                    {allTags.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">No hay etiquetas guardadas aún. Crea una arriba.</span>
                    ) : (
                        allTags.map(tag => {
                            const isSelected = value.some(v => v.toLowerCase() === tag.name.toLowerCase());
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => !isSelected && addTag(tag.name)}
                                    disabled={isSelected}
                                    className={`px-2 py-1 text-xs rounded-md border transition-all ${isSelected
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default line-through decoration-gray-400/50'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-forest hover:text-forest shadow-sm hover:shadow'
                                        }`}
                                >
                                    {tag.name}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
