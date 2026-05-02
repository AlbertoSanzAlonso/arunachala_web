import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CalendarIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { FilterState } from './index';

interface DateFiltersProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    years: string[];
    months: string[];
    formatMonthLabel: (monthIndex: string) => string;
}

const DateFilters: React.FC<DateFiltersProps> = ({ 
    filters, 
    onFilterChange, 
    years, 
    months, 
    formatMonthLabel 
}) => {
    const { t } = useTranslation();

    return (
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

            {/* Month Filter */}
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
    );
};

export default DateFilters;
