import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import omSymbol from '../assets/images/om_symbol.png';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';



interface YogaScheduleProps {
    onlyWeekly?: boolean;
    onlyWeekend?: boolean;
    hideTitle?: boolean;
}

const YogaSchedule: React.FC<YogaScheduleProps> = ({ onlyWeekly, onlyWeekend, hideTitle }) => {
    const { t, i18n } = useTranslation();

    const [rawItems, setRawItems] = useState<any[]>([]);
    const [weekendActivities, setWeekendActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeDayKey, setActiveDayKey] = useState("Monday");

    const DAYS_MAP = useMemo(() => [
        { key: 'Monday', label: t('common.days.monday') },
        { key: 'Tuesday', label: t('common.days.tuesday') },
        { key: 'Wednesday', label: t('common.days.wednesday') },
        { key: 'Thursday', label: t('common.days.thursday') },
        { key: 'Friday', label: t('common.days.friday') }
    ], [t]);

    // Mobile States
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);

    // Tarifas modal state
    const [showTarifasModal, setShowTarifasModal] = useState(false);
    const [tarifas, setTarifas] = useState<any[]>([]);
    const [loadingTarifas, setLoadingTarifas] = useState(false);

    const fetchTarifas = useCallback(async () => {
        setLoadingTarifas(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/promotions/tarifas`);
            if (res.ok) setTarifas(await res.json());
        } catch { /* silent */ } finally {
            setLoadingTarifas(false);
        }
    }, []);

    const handleOpenTarifas = () => {
        setShowTarifasModal(true);
        if (tarifas.length === 0) fetchTarifas();
    };

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/schedules`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setRawItems(data);
                    } else {
                        setRawItems([]);
                    }
                } else {
                    setRawItems([]);
                }
            } catch (error) {
                console.error('Error fetching schedules:', error);
                setRawItems([]);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchWeekendActivities = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/activities?active_only=true`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        const weekend = data.filter((a: any) => {
                            if (!a.start_date) return false;
                            const d = new Date(a.start_date);
                            const day = d.getDay();
                            return (day === 0 || day === 6) && ['taller', 'evento', 'retiro'].includes(a.type);
                        });
                        setWeekendActivities(weekend);
                    } else {
                        setWeekendActivities([]);
                    }
                } else {
                    setWeekendActivities([]);
                }
            } catch (e) {
                console.error("Error fetching activities for schedule annex:", e);
                setWeekendActivities([]);
            }
        };

        if (!onlyWeekend) fetchSchedules();
        if (!onlyWeekly) fetchWeekendActivities();

        const interval = setInterval(() => {
            if (!onlyWeekend) fetchSchedules();
            if (!onlyWeekly) fetchWeekendActivities();
        }, 30000);
        return () => clearInterval(interval);
    }, [onlyWeekly, onlyWeekend]);

    const normalizeDay = (day: string) => {
        if (!day) return "";
        const mapping: Record<string, string> = {
            'lunes': 'monday',
            'martes': 'tuesday',
            'miércoles': 'wednesday',
            'miercoles': 'wednesday',
            'jueves': 'thursday',
            'viernes': 'friday',
            'sábado': 'saturday',
            'sabado': 'saturday',
            'domingo': 'sunday'
        };
        const d = day.toLowerCase().trim();
        return mapping[d] || d;
    };

    const getItemsForDayMobile = (dayKey: string) => {
        const targetDay = normalizeDay(dayKey);
        return rawItems.filter(item => normalizeDay(item.day_of_week) === targetDay).sort((a, b) => a.start_time.localeCompare(b.start_time));
    };

    const TimeBlock = ({
        label,
        rows,
        rangeStart,
        rangeEnd,
    }: {
        label: string,
        rows: number,
        rangeStart: number,
        rangeEnd: number,
    }) => {
        const totalMinutes = (rangeEnd - rangeStart) * 60;

        const getItemsForDay = (dayKey: string) => {
            const targetDay = normalizeDay(dayKey);
            return rawItems.filter(item => {
                const [h, m] = item.start_time.split(':').map(Number);
                const totalMin = h * 60 + m;
                return normalizeDay(item.day_of_week) === targetDay && totalMin >= rangeStart * 60 && totalMin < rangeEnd * 60;
            });
        };

        const getPositionStyle = (startTime: string, endTime: string) => {
            const [h1, m1] = startTime.split(':').map(Number);
            const [h2, m2] = endTime.split(':').map(Number);
            const startMin = (h1 - rangeStart) * 60 + m1;
            const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);

            return {
                top: `${(startMin / totalMinutes) * 100}%`,
                height: `${(durationMin / totalMinutes) * 100}%`
            };
        };

        return (
            <div className="flex border-b-4 border-forest/10 last:border-b-0">
                <div className="w-12 md:w-16 bg-forest/10 flex items-center justify-center border-r border-forest/20 text-forest font-headers tracking-widest [writing-mode:vertical-lr] rotate-180 py-4 font-bold text-sm md:text-base">
                    {label}
                </div>
                <div className="flex-1 relative">
                    <div className="grid grid-cols-5 z-0">
                        {DAYS_MAP.map(d => (
                            <div key={`bg-${d.key}`} className="border-r border-forest/5 last:border-r-0 flex flex-col">
                                {Array.from({ length: rows }).map((_, i) => (
                                    <div key={i} className="h-28 border-b border-forest/5 last:border-b-0 flex items-center justify-center">
                                        <img src={omSymbol} alt="" className="w-24 h-24 object-contain opacity-[0.08]" style={{ filter: 'invert(28%) sepia(12%) saturate(2334%) hue-rotate(100deg) brightness(92%) contrast(87%)' }} />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 grid grid-cols-5 z-10 pointer-events-none">
                        {DAYS_MAP.map(d => (
                            <div key={d.key} className="relative h-full">
                                {getItemsForDay(d.key).map((item, index) => {
                                    const yc = item.yoga_class || { name: item.class_name, description: '', translations: {} };
                                    const className = getTranslated(yc, 'name', i18n.language);
                                    const classDesc = getTranslated(yc, 'description', i18n.language);
                                    const style = getPositionStyle(item.start_time, item.end_time);
                                    const [h1, m1] = item.start_time.split(':').map(Number);
                                    const [h2, m2] = item.end_time.split(':').map(Number);
                                    const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);

                                    return (
                                        <div
                                            key={`${d.key}-${index}`}
                                            className={`absolute left-1 right-1 rounded-lg border-l-4 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer pointer-events-auto flex flex-col justify-center px-1 md:px-2 py-1 ${yc.color || 'bg-gray-100'}`}
                                            style={style}
                                        >
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className="font-bold text-[10px] md:text-xs leading-none opacity-80">{item.start_time}</span>
                                                    {yc.age_range && (
                                                        <span className="text-[8px] md:text-[9px] font-bold tracking-tight bg-white/30 text-current px-1.5 py-0.5 rounded border border-current/10 flex-none ml-1">
                                                            {getTranslated(yc, 'age_range', i18n.language)}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-bold text-[11px] md:text-sm leading-tight line-clamp-2 min-w-0">{className}</span>
                                                {item.note && <span className="text-[8px] md:text-[9px] italic opacity-70 line-clamp-1">{getTranslated(item, 'note', i18n.language)}</span>}
                                            </div>
                                            <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 md:w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-bark text-bone p-3 rounded-lg shadow-xl border border-bone/10 text-center pointer-events-none">
                                                <h5 className="font-headers text-base md:text-lg text-matcha mb-1">{className}</h5>
                                                <p className="text-xs mb-2 opacity-90">{classDesc}</p>
                                                <span className="text-xs font-mono">{durationMin} min</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className={`w-full max-w-7xl mx-auto py-12 px-4 text-center ${onlyWeekend ? 'mt-20' : ''}`}>
                <div className="animate-pulse text-forest font-headers text-2xl">
                    {onlyWeekend ? t('yoga.sections.annex_title') : t('yoga.sections.schedule')}...
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full max-w-7xl mx-auto px-4 ${onlyWeekend ? 'py-0' : (onlyWeekly ? 'py-0' : 'py-12')}`}>
            {/* Tarifas Modal */}
            {showTarifasModal && (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowTarifasModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto custom-scrollbar"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white/90 backdrop-blur-sm px-8 py-5 border-b border-forest/10 flex items-center justify-between rounded-t-3xl">
                            <h3 className="text-2xl font-headers text-forest uppercase tracking-widest">{t('yoga.sections.rates', 'Tarifas')}</h3>
                            <button
                                onClick={() => setShowTarifasModal(false)}
                                className="p-2 rounded-full hover:bg-forest/10 text-forest transition-colors"
                                aria-label="Cerrar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            {loadingTarifas ? (
                                <div className="flex justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
                                </div>
                            ) : tarifas.length === 0 ? (
                                <p className="text-center text-bark/50 italic py-10">{t('yoga.sections.no_rates_yet', 'No hay tarifas publicadas todavía.')}</p>
                            ) : (
                                tarifas.map(tarifa => (
                                    <div key={tarifa.id} className="rounded-2xl border border-forest/10 overflow-hidden">
                                        {tarifa.image_url && (
                                            <img src={tarifa.image_url} alt={tarifa.title} className="w-full h-40 object-cover" />
                                        )}
                                        <div className="p-6">
                                            <h4 className="text-xl font-headers text-forest mb-2">{getTranslated(tarifa, 'title', i18n.language) || tarifa.title}</h4>
                                            {tarifa.description && (
                                                <p className="text-bark/70 text-sm leading-relaxed">{getTranslated(tarifa, 'description', i18n.language) || tarifa.description}</p>
                                            )}
                                            {tarifa.price && (
                                                <div className="mt-4 pt-4 border-t border-forest/5 flex items-center justify-between">
                                                    <span className="text-sm font-bold text-forest uppercase tracking-widest">{t('yoga.sections.price', 'Precio')}</span>
                                                    <span className="text-xl font-black text-matcha bg-matcha/10 px-3 py-1 rounded-lg">
                                                        {tarifa.price}{!String(tarifa.price).includes('€') && !String(tarifa.price).toLowerCase().includes('euro') ? ' €' : ''}
                                                    </span>
                                                </div>
                                            )}
                                            {tarifa.discount_percentage && (
                                                <span className="mt-3 inline-block px-3 py-1 bg-matcha text-white text-xs font-bold rounded-full">
                                                    -{tarifa.discount_percentage}% {t('yoga.sections.discount', 'descuento')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!onlyWeekend && !hideTitle && (
                <div className="flex items-center justify-center lg:justify-between mb-8 lg:mb-12 w-full">
                    <div className="flex-1 hidden lg:block" />
                    <h3 className="text-3xl font-headers text-forest text-center uppercase px-4 shrink-0">{t('yoga.sections.schedule')}</h3>
                    <div className="flex-1 justify-end hidden lg:flex">
                        <button
                            onClick={handleOpenTarifas}
                            className="flex items-center gap-2 px-5 py-2 bg-forest/10 hover:bg-forest text-forest hover:text-white font-bold text-sm rounded-full border border-forest/20 transition-all duration-200 tracking-wide"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            {t('yoga.sections.rates', 'Tarifas')}
                        </button>
                    </div>
                </div>
            )}

            {!onlyWeekend && (
                <>
                    <div className="hidden lg:block bg-bone/30 rounded-xl shadow-inner border border-forest/10">
                        <div className="flex border-b-2 border-forest/20 bg-forest/5 rounded-t-xl overflow-hidden">
                            <div className="w-12 md:w-16 border-r border-transparent"></div>
                            <div className="flex-1 grid grid-cols-5">
                                {DAYS_MAP.map(d => (
                                    <div key={d.key} className="text-center py-4 border-r border-forest/5 last:border-r-0">
                                        <h4 className="text-xl font-headers text-bark uppercase">{d.label}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <TimeBlock
                            label={t('common.times.morning')}
                            rows={2}
                            rangeStart={9}
                            rangeEnd={13}
                        />

                        <TimeBlock
                            label={t('common.times.afternoon')}
                            rows={3}
                            rangeStart={15.5}
                            rangeEnd={21.5}
                        />
                    </div>

                    <div className="lg:hidden">
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder={t('yoga.sections.search_class', 'Buscar clase o estilo...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-forest/20 rounded-full py-3 pl-12 pr-4 text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-matcha shadow-sm"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-forest/40 hover:text-forest transition-colors rounded-full hover:bg-forest/5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>

                        {!searchQuery && (
                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {DAYS_MAP.map(d => (
                                    <button
                                        key={d.key}
                                        onClick={() => setActiveDayKey(d.key)}
                                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm tracking-wide ${activeDayKey === d.key
                                            ? 'bg-forest text-bone font-bold shadow-lg'
                                            : 'bg-bone text-bark border border-bark/10 hover:bg-forest/10'
                                            }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col gap-6 animate-fade-in">
                            {(() => {
                                const renderCards = (items: any[], dayLabel?: string) => {
                                    if (items.length === 0) return null;
                                    return (
                                        <div key={dayLabel || 'active_day'} className="flex flex-col gap-4">
                                            {dayLabel && <h4 className="font-headers text-xl text-forest uppercase tracking-widest border-b border-forest/10 pb-2">{dayLabel}</h4>}
                                            {items.map((item: any, index: number) => {
                                                const yc = item.yoga_class || { name: item.class_name, description: '', translations: {} };
                                                const [h1, m1] = item.start_time.split(':').map(Number);
                                                const [h2, m2] = item.end_time.split(':').map(Number);
                                                const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);
                                                const isExpanded = expandedMobileItem === `${dayLabel || activeDayKey}-${item.start_time}-${index}`;

                                                return (
                                                    <div
                                                        key={index}
                                                        onClick={() => setExpandedMobileItem(isExpanded ? null : `${dayLabel || activeDayKey}-${item.start_time}-${index}`)}
                                                        className={`p-6 rounded-xl border-l-4 shadow-sm ${yc.color || 'bg-gray-100'} flex flex-col gap-2 transition-all duration-300 cursor-pointer hover:shadow-md`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-2xl">{item.start_time}</span>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="text-xs font-mono opacity-70 border border-current px-2 py-1 rounded-full">{durationMin} min</span>
                                                                {yc.age_range && <span className="text-[10px] font-black tracking-widest bg-black/10 px-2 py-0.5 rounded">{getTranslated(yc, 'age_range', i18n.language)}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h4 className="text-xl font-headers font-bold uppercase">{getTranslated(yc, 'name', i18n.language)}</h4>
                                                                {item.note && <p className="text-sm italic opacity-80 -mt-1">{getTranslated(item, 'note', i18n.language)}</p>}
                                                            </div>
                                                            <div className="bg-white/30 rounded-full p-1 border border-black/5 opacity-60 ml-3 shrink-0">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                            <div className="pt-3 border-t border-black/5">
                                                                <p className="text-sm opacity-90 leading-relaxed">{getTranslated(yc, 'description', i18n.language)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                };

                                if (!searchQuery) {
                                    const items = getItemsForDayMobile(activeDayKey);
                                    if (items.length === 0) return <p className="text-center text-bark/50 italic py-8">{t('yoga.sections.no_classes', 'No hay clases')}</p>;
                                    return renderCards(items);
                                } else {
                                    const query = searchQuery.toLowerCase();
                                    const results = DAYS_MAP.map(d => {
                                        const dayItems = getItemsForDayMobile(d.key).filter((item: any) => {
                                            const yc = item.yoga_class || { name: item.class_name, description: '', translations: {} };
                                            const name = getTranslated(yc, 'name', i18n.language).toLowerCase();
                                            const desc = getTranslated(yc, 'description', i18n.language).toLowerCase();
                                            return name.includes(query) || desc.includes(query);
                                        });
                                        return { day: d.label, items: dayItems };
                                    }).filter(res => res.items.length > 0);

                                    if (results.length === 0) {
                                        return (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 bg-forest/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-forest/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                </div>
                                                <p className="text-bark/50 italic">{t('yoga.sections.no_search_results', 'No hay resultados que coincidan')}</p>
                                            </div>
                                        );
                                    }
                                    return results.map(res => renderCards(res.items, res.day));
                                }
                            })()}
                        </div>

                        <div className="mt-12 flex justify-center animate-fade-in">
                            <button
                                onClick={handleOpenTarifas}
                                className="flex items-center gap-2 px-10 py-4 bg-forest hover:bg-forest/90 text-white font-bold text-lg rounded-full shadow-lg border border-forest/20 transition-all duration-300 tracking-widest uppercase active:scale-95 hover:shadow-xl"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                {t('yoga.sections.view_rates', 'Ver Tarifas')}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Annex Section */}
            {!onlyWeekly && weekendActivities.length > 0 && (
                <div className={`${onlyWeekend ? '' : 'mt-20 pt-12 border-t border-forest/10'} animate-fade-in`}>
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="w-12 h-1.5 bg-matcha/40 mb-6 rounded-full"></div>
                        <h4 className="text-2xl md:text-3xl font-headers text-forest uppercase tracking-widest">{t('yoga.sections.annex_title')}</h4>
                        <p className="text-bark/60 text-sm md:text-base italic mt-2 max-w-lg">{t('yoga.sections.annex_subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {weekendActivities.map((activity, idx) => (
                            <Link
                                key={idx}
                                to={`/actividades?activity=${activity.id}`}
                                className="group bg-white border border-forest/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                            >
                                <div className="p-6 md:p-8 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="px-3 py-1 bg-matcha/10 text-matcha text-[10px] font-bold tracking-widest rounded-full border border-matcha/20">
                                            {t(`activities.types.${activity.type}`)}
                                        </span>
                                        <div className="flex items-center gap-2 text-forest font-bold text-sm bg-forest/5 px-3 py-1 rounded-lg">
                                            <span>🗓️</span>
                                            {new Date(activity.start_date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                    <h5 className="text-xl md:text-2xl font-headers text-forest mb-3 group-hover:text-matcha transition-colors uppercase leading-tight">
                                        {getTranslated(activity, 'title', i18n.language)}
                                    </h5>
                                    <p className="text-sm md:text-base text-bark/70 line-clamp-3 leading-relaxed mb-6 flex-grow">
                                        {getTranslated(activity, 'description', i18n.language)}
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-forest/5 flex items-center justify-between">
                                        <span className="text-matcha font-black text-[10px] uppercase tracking-widest">
                                            {t('common.read_more')}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-forest/5 flex items-center justify-center group-hover:bg-matcha group-hover:text-white transition-all duration-300">
                                            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default YogaSchedule;
