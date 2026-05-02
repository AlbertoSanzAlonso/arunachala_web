
import React from 'react';
import { MagnifyingGlassIcon, ClockIcon, SparklesIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ContentFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    searchSuggestions: string[];
    filterType: 'all' | 'week' | 'month' | 'year';
    setFilterType: (type: 'all' | 'week' | 'month' | 'year') => void;
    filterValue: string;
    setFilterValue: (value: string) => void;
    filterAuthor: 'all' | 'human' | 'ai';
    setFilterAuthor: (author: 'all' | 'human' | 'ai') => void;
    dateSort: 'asc' | 'desc';
    setDateSort: (sort: 'asc' | 'desc') => void;
    selectedIdsCount: number;
    onBulkDelete: () => void;
}

export const ContentFilters: React.FC<ContentFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    showSuggestions,
    setShowSuggestions,
    searchSuggestions,
    filterType,
    setFilterType,
    filterValue,
    setFilterValue,
    filterAuthor,
    setFilterAuthor,
    dateSort,
    setDateSort,
    selectedIdsCount,
    onBulkDelete
}) => {
    return (
        <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-1 gap-4 w-full sm:w-auto flex-wrap">
                {/* Search + Autocomplete */}
                <div className="relative flex-grow sm:max-w-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-forest sm:text-sm sm:leading-6"
                        placeholder="Buscar por título..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setShowSuggestions(false);
                                (e.target as HTMLInputElement).blur();
                            }
                        }}
                    />
                    {showSuggestions && searchSuggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {searchSuggestions.map((suggestion, idx) => (
                                <div
                                    key={idx}
                                    className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-forest/10"
                                    onClick={() => {
                                        setSearchTerm(suggestion);
                                        setShowSuggestions(false);
                                    }}
                                >
                                    <span className="block truncate">{suggestion}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date Period Filter */}
                <div className="flex gap-2 items-center">
                    <div className="relative w-32">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-forest sm:text-sm sm:leading-6"
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value as any);
                                setFilterValue('');
                            }}
                        >
                            <option value="all">Todo</option>
                            <option value="week">Semana</option>
                            <option value="month">Mes</option>
                            <option value="year">Año</option>
                        </select>
                    </div>

                    {filterType !== 'all' && (
                        <div className="w-40">
                            {filterType === 'week' && (
                                <input
                                    type="week"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-forest sm:text-sm sm:leading-6"
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                />
                            )}
                            {filterType === 'month' && (
                                <input
                                    type="month"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-forest sm:text-sm sm:leading-6"
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                />
                            )}
                            {filterType === 'year' && (
                                <input
                                    type="number"
                                    placeholder="2024"
                                    min="2000"
                                    max="2100"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-forest sm:text-sm sm:leading-6"
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Author Filter */}
                <div className="relative w-32 self-center">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SparklesIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-forest sm:text-sm sm:leading-6"
                        value={filterAuthor}
                        onChange={(e) => setFilterAuthor(e.target.value as any)}
                    >
                        <option value="all">Todos</option>
                        <option value="human">Humanos</option>
                        <option value="ai">IA (Bot)</option>
                    </select>
                </div>

                {/* Sort Order Toggle */}
                <button
                    onClick={() => setDateSort(dateSort === 'asc' ? 'desc' : 'asc')}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    title={dateSort === 'asc' ? "Más antiguos primero" : "Más recientes primero"}
                >
                    {dateSort === 'asc' ? (
                        <>
                            <ChevronUpIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span>Antiguos</span>
                        </>
                    ) : (
                        <>
                            <ChevronDownIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span>Recientes</span>
                        </>
                    )}
                </button>
            </div>

            {selectedIdsCount > 0 && (
                <button
                    onClick={onBulkDelete}
                    className="flex items-center justify-center rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
                >
                    <TrashIcon className="h-5 w-5 mr-1" />
                    Eliminar seleccionados ({selectedIdsCount})
                </button>
            )}
        </div>
    );
};
