import React, { useState, useEffect } from 'react';
import omSymbol from '../assets/images/om_symbol.png';

interface ClassType {
    name: string;
    description: string;
    intensity: string;
    color: string;
    age_range: string | null;
}

interface ScheduleItem {
    day: string;
    time: string;
    duration: string;
    note?: string;
    classInfo: ClassType;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

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
    rangeStart: number, // Hour (e.g. 9)
    rangeEnd: number, // Hour (e.g. 13)
    scheduleItems: ScheduleItem[]
}) => {
    const totalMinutes = (rangeEnd - rangeStart) * 60;

    const getItemsForDay = (day: string) => {
        return scheduleItems.filter(item => {
            const hour = parseInt(item.time.split(':')[0]);
            return item.day === day && hour >= rangeStart && hour < rangeEnd + 2; // +buffer
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
        <div className="flex border-b-2 border-forest/10 last:border-b-0">
            {/* Sidebar Label */}
            <div className="w-12 md:w-16 bg-forest/10 flex items-center justify-center border-r border-forest/20 text-forest font-headers tracking-widest [writing-mode:vertical-lr] rotate-180 py-4 font-bold text-sm md:text-base">
                {label}
            </div>

            {/* Grid Content */}
            <div className="flex-1 relative">
                {/* Background Grid - Defines Height */}
                <div className="grid grid-cols-5 z-0">
                    {DAYS.map(day => (
                        <div key={`bg-${day}`} className="border-r border-forest/5 last:border-r-0 flex flex-col">
                            {Array.from({ length: rows }).map((_, i) => (
                                <div key={i} className="h-36 border-b border-forest/5 last:border-b-0 flex items-center justify-center">
                                    <img
                                        src={omSymbol}
                                        alt=""
                                        className="w-24 h-24 object-contain opacity-[0.08]"
                                        style={{ filter: 'invert(28%) sepia(12%) saturate(2334%) hue-rotate(100deg) brightness(92%) contrast(87%)' }}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Events Layer - Overlay */}
                <div className="absolute inset-0 grid grid-cols-5 z-10 pointer-events-none">
                    {DAYS.map(day => (
                        <div key={day} className="relative h-full">
                            {getItemsForDay(day).map((item, index) => {
                                const classInfo = item.classInfo;
                                if (!classInfo) {
                                    console.error('Schedule item without classInfo:', item);
                                    return null;
                                }
                                const style = getPositionStyle(item.time, item.duration);

                                return (
                                    <div
                                        key={`${day}-${index}`}
                                        className={`absolute left-1 right-1 rounded-lg border-l-4 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer pointer-events-auto flex flex-col justify-center px-1 md:px-2 py-1 ${classInfo.color || 'bg-gray-100'}`}
                                        style={style}
                                    >
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className="font-bold text-xs md:text-sm leading-none">{item.time}</span>
                                            {(item.note || classInfo.age_range) && (
                                                <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wide opacity-80 bg-white/40 px-1 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-[50%]">
                                                    {item.note || classInfo.age_range}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-medium text-xs md:text-sm leading-tight text-opacity-90 line-clamp-2">{classInfo.name}</span>

                                        {/* Tooltip */}
                                        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 md:w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-bark text-bone p-3 rounded-lg shadow-xl border border-bone/10 text-center pointer-events-none">
                                            <h5 className="font-headers text-base md:text-lg text-matcha mb-1">{classInfo.name}</h5>
                                            <p className="text-xs mb-2 opacity-90">{classInfo.description}</p>
                                            <span className="text-xs font-mono">{item.duration} • {classInfo.intensity}</span>
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

const YogaSchedule: React.FC = () => {
    const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(DAYS[0]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/schedules');
                if (response.ok) {
                    const data = await response.json();

                    // Convert backend ClassSchedule to frontend ScheduleItem
                    const mapped: ScheduleItem[] = data.map((item: any) => {
                        const start = item.start_time;
                        const end = item.end_time;

                        // Calculate duration
                        const [h1, m1] = start.split(':').map(Number);
                        const [h2, m2] = end.split(':').map(Number);
                        const durationMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);

                        // Fallback in case yoga_class is null (legacy data)
                        const yc = item.yoga_class || {
                            name: item.class_name || 'Clase',
                            description: '',
                            color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
                            intensity: 'Media',
                            age_range: null
                        };

                        return {
                            day: item.day_of_week,
                            time: start,
                            duration: `${durationMinutes} min`,
                            classInfo: {
                                name: yc.name,
                                description: yc.description,
                                color: yc.color,
                                intensity: yc.intensity,
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
    }, []);

    // Helper for mobile list
    const getItemsForDay = (day: string) => {
        return scheduleItems.filter(item => item.day === day).sort((a, b) => a.time.localeCompare(b.time));
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto py-12 px-4 text-center">
                <div className="animate-pulse text-forest font-headers text-2xl">Cargando horarios...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-4">
            <h3 className="text-3xl font-headers text-forest text-center mb-12">Horarios Semanales</h3>

            {/* Desktop View (Split Time Grid) */}
            <div className="hidden lg:block bg-bone/30 rounded-xl shadow-inner border border-forest/10">

                {/* Header Row */}
                <div className="flex border-b-2 border-forest/20 bg-forest/5 rounded-t-xl overflow-hidden">
                    {/* Spacer to match sidebar width */}
                    <div className="w-12 md:w-16 border-r border-transparent"></div>
                    {/* Day Columns */}
                    <div className="flex-1 grid grid-cols-5">
                        {DAYS.map(day => (
                            <div key={day} className="text-center py-4 border-r border-forest/5 last:border-r-0">
                                <h4 className="text-xl font-headers text-bark">{day}</h4>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Morning Block (9:00 - 13:30) - 2 rows visual */}
                <TimeBlock
                    label="MAÑANA"
                    rows={2}
                    rangeStart={9}
                    rangeEnd={13.5}
                    scheduleItems={scheduleItems}
                />

                {/* Afternoon Block (16:00 - 21:00) - 3 rows visual */}
                <TimeBlock
                    label="TARDE"
                    rows={3}
                    rangeStart={16}
                    rangeEnd={21}
                    scheduleItems={scheduleItems}
                />
            </div>

            {/* Mobile/Tablet View (Tabs) */}
            <div className="lg:hidden">
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${activeDay === day
                                ? 'bg-forest text-bone font-bold shadow-lg'
                                : 'bg-bone text-bark border border-bark/10 hover:bg-forest/10'
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-4 animate-fade-in">
                    {getItemsForDay(activeDay).map((item, index) => {
                        const classInfo = item.classInfo;
                        if (!classInfo) return null;
                        return (
                            <div
                                key={index}
                                className={`p-6 rounded-xl border-l-4 shadow-sm ${classInfo.color || 'bg-gray-100'} flex flex-col gap-2`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-2xl">{item.time}</span>
                                    <span className="text-xs font-mono opacity-70 border border-current px-2 py-1 rounded-full">{item.duration}</span>
                                </div>
                                <h4 className="text-xl font-headers">{classInfo.name}</h4>
                                <p className="text-sm opacity-90 leading-relaxed mt-2">{classInfo.description}</p>
                                <div className="mt-2 text-xs font-bold uppercase tracking-widest opacity-70">
                                    Intensidad: {classInfo.intensity}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default YogaSchedule;
