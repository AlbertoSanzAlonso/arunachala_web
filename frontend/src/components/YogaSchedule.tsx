import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import omSymbol from '../assets/images/om_symbol.png';
import { API_BASE_URL } from '../config';
import { getTranslated } from '../utils/translate';

const YogaSchedule: React.FC = () => {
    const { t, i18n } = useTranslation();
    const DAYS = React.useMemo(() => [
        t('common.days.monday'),
        t('common.days.tuesday'),
        t('common.days.wednesday'),
        t('common.days.thursday'),
        t('common.days.friday')
    ], [t]);

    const [rawItems, setRawItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeDay, setActiveDay] = useState("");

    // Map days from Spanish (DB default) to translated
    const getTranslatedDay = (day: string) => {
        const dayMap: any = {
            "Lunes": t('common.days.monday'),
            "Martes": t('common.days.tuesday'),
            "Miércoles": t('common.days.wednesday'),
            "Jueves": t('common.days.thursday'),
            "Viernes": t('common.days.friday'),
            "Sábado": t('common.days.saturday'),
            "Domingo": t('common.days.sunday')
        };
        return dayMap[day] || day;
    };

    useEffect(() => {
        if (!activeDay && DAYS[0]) setActiveDay(DAYS[0]);
    }, [DAYS, activeDay]);

    useEffect(() => {
        const fetchAllScheduleData = async () => {
            try {
                const [schedulesRes, activitiesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/schedules`),
                    fetch(`${API_BASE_URL}/api/activities`)
                ]);

                let combinedItems: any[] = [];

                if (schedulesRes.ok) {
                    const schedulesData = await schedulesRes.json();
                    combinedItems = [...schedulesData];
                }

                if (activitiesRes.ok) {
                    const activitiesData = await activitiesRes.json();
                    // Filter for active 'curso' types
                    const courses = activitiesData.filter((a: any) => a.type === 'curso' && a.is_active);

                    courses.forEach((course: any) => {
                        if (course.activity_data && course.activity_data.schedule) {
                            course.activity_data.schedule.forEach((session: any) => {
                                // Calculate end time based on duration
                                let duration = session.duration || 60;
                                const [h, m] = session.time.split(':').map(Number);
                                const totalMin = h * 60 + m + duration;
                                const endH = Math.floor(totalMin / 60) % 24;
                                const endM = totalMin % 60;
                                const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

                                combinedItems.push({
                                    id: `course-${course.id}-${session.day}-${session.time}`, // Virtual ID
                                    start_time: session.time,
                                    end_time: endTime,
                                    day_of_week: session.day,
                                    class_name: course.title,
                                    yoga_class: {
                                        name: course.title,
                                        description: course.description,
                                        translations: course.translations,
                                        color: 'bg-indigo-50 border-indigo-200 text-indigo-900', // Distinct style for courses
                                        age_range: 'CURSO'
                                    },
                                    note: 'Curso / Taller'
                                });
                            });
                        }
                    });
                }

                setRawItems(combinedItems);
            } catch (error) {
                console.error('Error fetching schedule data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllScheduleData();
        const interval = setInterval(fetchAllScheduleData, 30000);
        return () => clearInterval(interval);
    }, []);

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

        const getItemsForDay = (day: string) => {
            return rawItems.filter(item => {
                const [h, m] = item.start_time.split(':').map(Number);
                const totalMin = h * 60 + m;
                return getTranslatedDay(item.day_of_week) === day && totalMin >= rangeStart * 60 && totalMin < rangeEnd * 60;
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
                                    const yc = item.yoga_class || { name: item.class_name, description: '', translations: {} };
                                    const className = getTranslated(yc, 'name', i18n.language);
                                    const classDesc = getTranslated(yc, 'description', i18n.language);
                                    const style = getPositionStyle(item.start_time, item.end_time);
                                    const [h1, m1] = item.start_time.split(':').map(Number);
                                    const [h2, m2] = item.end_time.split(':').map(Number);
                                    const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);

                                    return (
                                        <div
                                            key={`${day}-${index}`}
                                            className={`absolute left-1 right-1 rounded-lg border-l-4 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer pointer-events-auto flex flex-col justify-center px-1 md:px-2 py-1 ${yc.color || 'bg-gray-100'}`}
                                            style={style}
                                        >
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className="font-bold text-[10px] md:text-xs leading-none opacity-80">{item.start_time}</span>
                                                    {yc.age_range && (
                                                        <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-tight bg-white/30 text-current px-1.5 py-0.5 rounded border border-current/10 flex-none ml-1">
                                                            {yc.age_range}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-bold text-[11px] md:text-sm leading-tight line-clamp-2 min-w-0">{className}</span>
                                                {item.note && <span className="text-[8px] md:text-[9px] italic opacity-70 line-clamp-1">{item.note}</span>}
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

    const getItemsForDayMobile = (day: string) => {
        return rawItems.filter(item => getTranslatedDay(item.day_of_week) === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
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
                />

                <TimeBlock
                    label={t('common.times.afternoon')}
                    rows={3}
                    rangeStart={15.5}
                    rangeEnd={21.5}
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
                    {getItemsForDayMobile(activeDay).map((item: any, index: number) => {
                        const yc = item.yoga_class || { name: item.class_name, description: '', translations: {} };
                        const [h1, m1] = item.start_time.split(':').map(Number);
                        const [h2, m2] = item.end_time.split(':').map(Number);
                        const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);
                        return (
                            <div key={index} className={`p-6 rounded-xl border-l-4 shadow-sm ${yc.color || 'bg-gray-100'} flex flex-col gap-2`}>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-2xl">{item.start_time}</span>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs font-mono opacity-70 border border-current px-2 py-1 rounded-full">{durationMin} min</span>
                                        {yc.age_range && <span className="text-[10px] uppercase font-black tracking-widest bg-black/10 px-2 py-0.5 rounded">{yc.age_range}</span>}
                                    </div>
                                </div>
                                <h4 className="text-xl font-headers font-bold uppercase">{getTranslated(yc, 'name', i18n.language)}</h4>
                                {item.note && <p className="text-sm italic opacity-80 -mt-1">{item.note}</p>}
                                <p className="text-sm opacity-90 leading-relaxed mt-1">{getTranslated(yc, 'description', i18n.language)}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default YogaSchedule;
