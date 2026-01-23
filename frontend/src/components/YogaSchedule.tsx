import React, { useState } from 'react';
import omSymbol from '../assets/images/om_symbol.png';

interface ClassType {
    id: string;
    name: string;
    description: string;
    intensity: 'Suave' | 'Media' | 'Alta';
    color: string;
}

interface ScheduleItem {
    day: string;
    time: string;
    classId: string;
    duration: string;
    note?: string;
}

const CLASSES: Record<string, ClassType> = {
    integral_vinyasa: {
        id: 'integral_vinyasa',
        name: 'Yoga Integral Vinyasa',
        description: 'Una práctica fluida y holística que integra el movimiento consciente (Vinyasa) con la respiración y la meditación, buscando la armonía total del ser.',
        intensity: 'Media',
        color: 'bg-forest/20 border-forest text-forest'
    },
    aereo: {
        id: 'aereo',
        name: 'Yoga Aéreo',
        description: 'Desafía la gravedad utilizando un columpio de tela. Mejora la flexibilidad, descomprime la columna y experimenta la libertad de movimiento en suspensión.',
        intensity: 'Media',
        color: 'bg-sky-100 border-sky-300 text-sky-800'
    },
    kids: {
        id: 'kids',
        name: 'Yoga Niñ@s',
        description: 'Un espacio lúdico donde los niños aprenden a respirar, concentrarse y relajarse a través del juego, cuentos y posturas adaptadas a su edad.',
        intensity: 'Suave',
        color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },
    crianza: {
        id: 'crianza',
        name: 'Yoga Crianza',
        description: 'Espacio compartido para madres/padres y bebés. Fortalece el vínculo afectivo a través del contacto, el juego y la relajación conjunta.',
        intensity: 'Suave',
        color: 'bg-rose-100 border-rose-300 text-rose-800'
    },
    hatha: {
        id: 'hatha',
        name: 'Hatha Yoga',
        description: 'Una práctica clásica centrada en la alineación física y el equilibrio energético. Ideal para todos los niveles.',
        intensity: 'Media',
        color: 'bg-emerald-100 border-emerald-300 text-emerald-800'
    }
};

const SCHEDULE: ScheduleItem[] = [
    { day: 'Lunes', time: '16:30', classId: 'crianza', duration: '60 min', note: 'Desde gateo' },

    { day: 'Miércoles', time: '09:30', classId: 'hatha', duration: '90 min', note: 'Prueba' },
    { day: 'Miércoles', time: '18:45', classId: 'integral_vinyasa', duration: '90 min' },

    { day: 'Jueves', time: '18:15', classId: 'aereo', duration: '75 min' },
    { day: 'Jueves', time: '19:30', classId: 'integral_vinyasa', duration: '90 min' },

    { day: 'Viernes', time: '17:30', classId: 'kids', duration: '60 min', note: '4-7 años' },
    { day: 'Viernes', time: '18:40', classId: 'kids', duration: '60 min', note: '8-12 años' }
];

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
                                const classInfo = CLASSES[item.classId] || CLASSES['hatha']; // Fallback
                                const style = getPositionStyle(item.time, item.duration);

                                return (
                                    <div
                                        key={`${day}-${index}`}
                                        className={`absolute left-1 right-1 rounded-lg border-l-4 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer pointer-events-auto flex flex-col justify-center px-1 md:px-2 py-1 ${classInfo.color}`}
                                        style={style}
                                    >
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className="font-bold text-xs md:text-sm leading-none">{item.time}</span>
                                            {item.note && (
                                                <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wide opacity-80 bg-white/40 px-1 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-[50%]">
                                                    {item.note}
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
    // For mobile tabs
    const [activeDay, setActiveDay] = useState(DAYS[0]);

    // Helper for mobile list
    const getItemsForDay = (day: string) => {
        return SCHEDULE.filter(item => item.day === day).sort((a, b) => a.time.localeCompare(b.time));
    };

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
                    scheduleItems={SCHEDULE}
                />

                {/* Afternoon Block (16:00 - 21:00) - 3 rows visual */}
                <TimeBlock
                    label="TARDE"
                    rows={3}
                    rangeStart={16}
                    rangeEnd={21}
                    scheduleItems={SCHEDULE}
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
                        const classInfo = CLASSES[item.classId];
                        return (
                            <div
                                key={index}
                                className={`p-6 rounded-xl border-l-4 shadow-sm ${classInfo.color} flex flex-col gap-2`}
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
