
import React, { useState, useEffect, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface Meditation {
    id: number;
    title: string;
    translations?: {
        [key: string]: {
            title?: string;
        }
    };
}

interface MeditationSearchProps {
    meditations: Meditation[];
    onSearchChange: (query: string) => void;
}

const MeditationSearch: React.FC<MeditationSearchProps> = ({ meditations, onSearchChange }) => {
    const { t, i18n } = useTranslation();
    const [query, setQuery] = useState('');

    useEffect(() => {
        onSearchChange(query);
    }, [query, onSearchChange]);

    const filteredSuggestions = query === ''
        ? []
        : meditations.filter((meditation) => {
            const currentLang = i18n.language.split('-')[0];
            const title = (meditation.translations?.[currentLang]?.title || meditation.title).toLowerCase();
            return title.includes(query.toLowerCase());
        }).slice(0, 5);

    return (
        <div className="w-full max-w-5xl mx-auto mb-16">
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50 p-6 md:p-8">
                <div className="relative z-30">
                    <Combobox value={query} onChange={setQuery}>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bark/40" />
                            <Combobox.Input
                                className="w-full pl-12 pr-10 py-4 bg-white border border-bark/10 rounded-2xl text-bark focus:ring-2 focus:ring-forest/20 focus:border-forest/30 transition-all outline-none shadow-sm text-lg placeholder:text-bark/30"
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder={t('meditations.search_placeholder', 'Buscar meditaciones...')}
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
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveTo="opacity-0"
                            afterLeave={() => setQuery(query)}
                        >
                            <Combobox.Options className="absolute mt-2 w-full max-h-60 overflow-auto rounded-xl bg-white p-2 text-base shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                                {filteredSuggestions.length === 0 && query !== '' ? (
                                    <div className="relative cursor-default select-none py-3 px-4 text-center text-bark/40 italic">
                                        {t('meditations.error_search', 'No se encontraron resultados.')}
                                    </div>
                                ) : (
                                    filteredSuggestions.map((meditation) => {
                                        const currentLang = i18n.language.split('-')[0];
                                        const displayTitle = meditation.translations?.[currentLang]?.title || meditation.title;
                                        return (
                                            <Combobox.Option
                                                key={meditation.id}
                                                className={({ active }) => `relative cursor-pointer select-none py-3 pl-4 pr-4 rounded-lg transition-colors ${active ? 'bg-forest/5 text-forest' : 'text-bark/80'}`}
                                                value={displayTitle}
                                            >
                                                {({ selected }) => (
                                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                        {displayTitle}
                                                    </span>
                                                )}
                                            </Combobox.Option>
                                        );
                                    })
                                )}
                            </Combobox.Options>
                        </Transition>
                    </Combobox>
                </div>
            </div>
        </div>
    );
};

export default MeditationSearch;
