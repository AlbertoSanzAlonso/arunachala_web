import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import omSymbol from '../assets/images/om_symbol.png';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';

interface ClassType {
    name: string;
    description: string;
    color: string;
    age_range: string | null;
    translations?: any;
}

interface ScheduleItem {
    day: string;
    time: string;
    duration: string;
    note?: string;
    classInfo: ClassType;
}

const YogaSchedule: React.FC = () => {
    const { t, i18n } = useTranslation();
    const DAYS = React.useMemo(() => [
        t('common.days.monday'),
        t('common.days.tuesday'),
        t('common.days.wednesday'),
        t('common.days.thursday'),
        t('common.days.friday')
    ], [t]);

    const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeDay, setActiveDay] = useState("");

    useEffect(() => {
        if (!activeDay && DAYS[0]) setActiveDay(DAYS[0]);
    }, [DAYS, activeDay]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/schedules`);
                if (response.ok) {
                    const data = await response.json();

                    const mapped: ScheduleItem[] = data.map((item: any) => {
                        const start = item.start_time;
                        const end = item.end_time;
                        const [h1, m1] = start.split(':').map(Number);
                        const [h2, m2] = end.split(':').map(Number);
                        const durationMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);

                        const yc = item.yoga_class || {
                            name: item.class_name || 'Clase',
                            description: '',
                            translations: {}
                        };

                        // Map days from Spanish (DB default) to translated
                        const dayMap: any = {
                            "Lunes": t('common.days.monday'),
                            "Martes": t('common.days.tuesday'),
                            "Miércoles": t('common.days.wednesday'),
                            "Jueves": t('common.days.thursday'),
                            "Viernes": t('common.days.friday')
                        };

                        return {
                            day: dayMap[item.day_of_week] || item.day_of_week,
                            time: start,
                            duration: `${durationMinutes} min`,
                            note: item.note,
                            classInfo: {
                                name: getTranslated(yc, 'name', i18n.language),
                                description: getTranslated(yc, 'description', i18n.language),
                                color: yc.color,
                                age_range: yc.age_range
                            }
                        };
                    });
                    setScheduleItems(mapped);
                }
            } catch (error) {
                console.error('Error fetching schedules:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedules();
    }, [i18n.language, t]);

    // Helper to render a block of classes
    const TimeBlock = ({
        label,
        rows,
        rangeStart,
        rangeEnd,
        scheduleItems
    }: {
        label: string,
        rows: number,
        rangeStart: number,
        rangeEnd: number,
        scheduleItems: ScheduleItem[]
    }) => {
        const totalMinutes = (rangeEnd - rangeStart) * 60;

        const getItemsForDay = (day: string) => {
            return scheduleItems.filter(item => {
                const [h, m] = item.time.split(':').map(Number);
                const totalMin = h * 60 + m;
                return item.day === day && totalMin >= rangeStart * 60 && totalMin < rangeEnd * 60;
            });
        };

        const getPositionStyle = (time: string, duration: string) => {
            const [h, m] = time.split(':').map(Number);
            const startMin = (h - rangeStart) * 60 + m;
            const durationMin = parseInt(duration);

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
                        {DAYS.map(day => (
                            <div key={`bg-${day}`} className="border-r border-forest/5 last:border-r-0 flex flex-col">
                                {Array.from({ length: rows }).map((_, i) => (
                                    <div key={i} className="h-36 border-b border-forest/5 last:border-b-0 flex items-center justify-center">
                                        <img src={omSymbol} alt="" className="w-24 h-24 object-contain opacity-[0.08]" style={{ filter: 'invert(28%) sepia(12%) saturate(2334%) hue-rotate(100deg) brightness(92%) contrast(87%)' }} />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 grid grid-cols-5 z-10 pointer-events-none">
                        {DAYS.map(day => (
                            <div key={day} className="relative h-full">
                                {getItemsForDay(day).map((item, index) => {
                                    const classInfo = item.classInfo;
                                    const style = getPositionStyle(item.time, item.duration);
                                    return (
                                        <div
                                            key={`${day}-${index}`}
                                            className={`absolute left-1 right-1 rounded-lg border-l-4 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer pointer-events-auto flex flex-col justify-center px-1 md:px-2 py-1 ${classInfo.color || 'bg-gray-100'}`}
                                            style={style}
                                        >
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className="font-bold text-[10px] md:text-xs leading-none opacity-80">{item.time}</span>
                                                    {classInfo.age_range && (
                                                        <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-tight bg-white/30 text-current px-1.5 py-0.5 rounded border border-current/10 flex-none ml-1">
                                                            {classInfo.age_range}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-bold text-[11px] md:text-sm leading-tight line-clamp-2 min-w-0">{classInfo.name}</span>
                                                {item.note && <span className="text-[8px] md:text-[9px] italic opacity-70 line-clamp-1">{item.note}</span>}
                                            </div>
                                            <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 md:w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-bark text-bone p-3 rounded-lg shadow-xl border border-bone/10 text-center pointer-events-none">
                                                <h5 className="font-headers text-base md:text-lg text-matcha mb-1">{classInfo.name}</h5>
                                                <p className="text-xs mb-2 opacity-90">{classInfo.description}</p>
                                                <span className="text-xs font-mono">{item.duration}</span>
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

    const getItemsForDayMobile = (day: string) => {
        return scheduleItems.filter(item => item.day === day).sort((a, b) => a.time.localeCompare(b.time));
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto py-12 px-4 text-center">
                <div className="animate-pulse text-forest font-headers text-2xl">{t('yoga.sections.schedule')}...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-4">
            <h3 className="text-3xl font-headers text-forest text-center mb-12 uppercase">{t('yoga.sections.schedule')}</h3>

            <div className="hidden lg:block bg-bone/30 rounded-xl shadow-inner border border-forest/10">
                <div className="flex border-b-2 border-forest/20 bg-forest/5 rounded-t-xl overflow-hidden">
                    <div className="w-12 md:w-16 border-r border-transparent"></div>
                    <div className="flex-1 grid grid-cols-5">
                        {DAYS.map(day => (
                            <div key={day} className="text-center py-4 border-r border-forest/5 last:border-r-0">
                                <h4 className="text-xl font-headers text-bark uppercase">{day}</h4>
                            </div>
                        ))}
                    </div>
                </div>

                <TimeBlock
                    label={t('common.times.morning')}
                    rows={2}
                    rangeStart={9}
                    rangeEnd={13}
                    scheduleItems={scheduleItems}
                />

                <TimeBlock
                    label={t('common.times.afternoon')}
                    rows={3}
                    rangeStart={15.5}
                    rangeEnd={21.5}
                    scheduleItems={scheduleItems}
                />
            </div>

            <div className="lg:hidden">
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors uppercase text-sm tracking-wider ${activeDay === day
                                ? 'bg-forest text-bone font-bold shadow-lg'
                                : 'bg-bone text-bark border border-bark/10 hover:bg-forest/10'
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-4 animate-fade-in">
                    {getItemsForDayMobile(activeDay).map((item, index) => {
                        const classInfo = item.classInfo;
                        return (
                            <div key={index} className={`p-6 rounded-xl border-l-4 shadow-sm ${classInfo.color || 'bg-gray-100'} flex flex-col gap-2`}>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-2xl">{item.time}</span>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs font-mono opacity-70 border border-current px-2 py-1 rounded-full">{item.duration}</span>
                                        {classInfo.age_range && <span className="text-[10px] uppercase font-black tracking-widest bg-black/10 px-2 py-0.5 rounded">{classInfo.age_range}</span>}
                                    </div>
                                </div>
                                <h4 className="text-xl font-headers font-bold uppercase">{classInfo.name}</h4>
                                {item.note && <p className="text-sm italic opacity-80 -mt-1">{item.note}</p>}
                                <p className="text-sm opacity-90 leading-relaxed mt-1">{classInfo.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default YogaSchedule;
