import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, CloudArrowUpIcon, LockClosedIcon } from '@heroicons/react/24/outline'; // Added Lock icon
import omSymbol from '../../assets/images/om_symbol.png';
import { API_BASE_URL } from '../../config';

interface ClassType {
    id: number;
    name: string;
    description: string;
    color: string;
    age_range: string | null;
}

interface ScheduleItem {
    id: number;
    day: string;
    time: string;
    duration: number; // in minutes
    classInfo: ClassType;
    isCourse?: boolean;
}

const API_URL = API_BASE_URL;
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function VisualScheduleEditor({ onBack }: { onBack: () => void }) {
    const [items, _setItems] = useState<ScheduleItem[]>([]);
    const [history, setHistory] = useState<ScheduleItem[][]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Refs for safe state access in async/global events
    const itemsRef = useRef<ScheduleItem[]>([]);
    const lastInteractionState = useRef<ScheduleItem[] | null>(null);

    // Sync helper to update state AND ref simultaneously
    const setItems = (newVal: ScheduleItem[] | ((prev: ScheduleItem[]) => ScheduleItem[])) => {
        if (typeof newVal === 'function') {
            _setItems(prev => {
                const updated = newVal(prev);
                itemsRef.current = updated;
                return updated;
            });
        } else {
            itemsRef.current = newVal;
            _setItems(newVal);
        }
    };

    // Global interaction state
    const [interaction, setInteraction] = useState<{
        id: number;
        startY: number;
        originalValue: string | number;
        extraData: any;
        type: 'drag' | 'resize';
        block: any;
        rect: DOMRect;
    } | null>(null);

    const blocks = [
        { label: 'MAÑANA', start: 9, end: 13, rows: 2 },
        { label: 'TARDE', start: 15.5, end: 21.5, rows: 3 }
    ];

    useEffect(() => {
        fetchSchedules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/schedules`);
            if (response.ok) {
                const data = await response.json();
                const mapped = data.map((item: any) => {
                    const [h1, m1] = item.start_time.split(':').map(Number);
                    const [h2, m2] = item.end_time.split(':').map(Number);
                    const duration = (h2 * 60 + m2) - (h1 * 60 + m1);

                    return {
                        id: item.id,
                        day: item.day_of_week,
                        time: item.start_time,
                        duration,
                        isCourse: item.id < 0 || item.is_course, // Check for negative ID or flag
                        classInfo: item.yoga_class || {
                            name: item.class_name || 'Clase',
                            color: item.id < 0 ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-gray-100',
                            age_range: item.id < 0 ? "CURSO" : null
                        }
                    };
                });
                setItems(mapped);
                setHistory([mapped]); // Initial state for undon fresh load
            }
        } catch (error) {
            console.error('Error fetching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Global Interaction Handlers
    useEffect(() => {
        const handleMove = (clientY: number) => {
            if (!interaction) return;

            const { id, startY, originalValue, type, block, rect } = interaction;
            const totalMinutes = (block.end - block.start) * 60;
            const pixelsPerMinute = rect.height / totalMinutes;
            const deltaY = clientY - startY;
            const minuteDelta = deltaY / pixelsPerMinute;
            const snappedDelta = Math.round(minuteDelta / 15) * 15;

            if (type === 'drag') {
                const [h, m] = (originalValue as string).split(':').map(Number);
                let newTotalMinutes = (h * 60 + m) + snappedDelta;

                // Clamp within block
                const minStart = block.start * 60;
                const maxStart = block.end * 60 - (interaction.extraData as number);
                newTotalMinutes = Math.max(minStart, Math.min(maxStart, newTotalMinutes));

                const newH = Math.floor(newTotalMinutes / 60);
                const newM = newTotalMinutes % 60;
                const newTime = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;

                setItems(prev => prev.map(item =>
                    item.id === id ? { ...item, time: newTime } : item
                ));
            } else if (type === 'resize') {
                const startMin = interaction.extraData as number;
                const maxDuration = block.end * 60 - startMin;
                const newDuration = Math.max(15, Math.min(maxDuration, (originalValue as number) + snappedDelta));

                setItems(prev => prev.map(item =>
                    item.id === id ? { ...item, duration: newDuration } : item
                ));
            }
        };

        const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
        const handleTouchMove = (e: TouchEvent) => {
            if (interaction) {
                // Prevent scrolling while dragging
                if (e.cancelable) e.preventDefault();
                handleMove(e.touches[0].clientY);
            }
        };

        const handleEnd = () => {
            if (interaction && lastInteractionState.current) {
                const finalState = itemsRef.current;
                const hasChanged = JSON.stringify(finalState) !== JSON.stringify(lastInteractionState.current);

                if (hasChanged) {
                    // Update history with the state BEFORE the move
                    const snapshot = lastInteractionState.current;
                    setHistory(prev => [...prev, snapshot]);
                }
            }
            setInteraction(null);
            lastInteractionState.current = null;
        };

        if (interaction) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [interaction]);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: number, time: string, duration: number, block: any, rect: DOMRect) => {
        // Prevent interaction for courses (negative IDs)
        if (id < 0) return;

        // For mouse events or if explicitly triggered
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        lastInteractionState.current = JSON.parse(JSON.stringify(itemsRef.current));
        setInteraction({ id, startY: clientY, originalValue: time, extraData: duration, type: 'drag', block, rect });
        // Don't prevent default here immediately on touch to allow click events if needed, but for drag we might want to
        if (!('touches' in e)) e.preventDefault();
    };

    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, id: number, time: string, duration: number, block: any, rect: DOMRect) => {
        if (id < 0) return;

        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        lastInteractionState.current = JSON.parse(JSON.stringify(itemsRef.current));
        const [h, m] = time.split(':').map(Number);
        const startMinutes = h * 60 + m;
        setInteraction({ id, startY: clientY, originalValue: duration, extraData: startMinutes, type: 'resize', block, rect });
        e.stopPropagation();
        if (!('touches' in e)) e.preventDefault();
    };

    const handleUndo = () => {
        if (history.length === 0) return;

        setHistory(prev => {
            const newHistory = [...prev];
            const lastState = newHistory.pop();
            if (lastState) {
                setItems(lastState);
            }
            return newHistory;
        });
        setMsg(null);
    };

    const isOverlapping = (itemA: ScheduleItem, itemB: ScheduleItem) => {
        if (itemA.id === itemB.id || itemA.day !== itemB.day) return false;
        const [hA, mA] = itemA.time.split(':').map(Number);
        const startA = hA * 60 + mA;
        const endA = startA + itemA.duration;
        const [hB, mB] = itemB.time.split(':').map(Number);
        const startB = hB * 60 + mB;
        const endB = startB + itemB.duration;
        return startA < endB && endA > startB;
    };

    const validateOverlaps = () => {
        const currentItems = itemsRef.current;
        for (let i = 0; i < currentItems.length; i++) {
            for (let j = i + 1; j < currentItems.length; j++) {
                if (isOverlapping(currentItems[i], currentItems[j])) {
                    return `Conflicto: '${currentItems[i].classInfo.name}' se solapa con '${currentItems[j].classInfo.name}' el ${currentItems[i].day}`;
                }
            }
        }
        return null;
    };

    const saveChanges = async () => {
        const overlapMsg = validateOverlaps();
        if (overlapMsg) {
            setMsg({ type: 'error', text: overlapMsg });
            return;
        }

        setIsSaving(true);
        setMsg(null);
        const token = sessionStorage.getItem('access_token');
        const currentItems = itemsRef.current;

        try {
            // Filter only editable items (positive IDs)
            const editableItems = currentItems.filter(item => item.id > 0);

            for (const item of editableItems) {
                const [h, m] = item.time.split(':').map(Number);
                const endTotal = h * 60 + m + item.duration;
                const endH = Math.floor(endTotal / 60) % 24;
                const endM = endTotal % 60;
                const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

                const response = await fetch(`${API_URL}/api/schedules/${item.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        start_time: item.time,
                        end_time: endTime
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || `Error guardando '${item.classInfo.name}'`);
                }
            }
            setHistory([]); // Reset history after save
            setMsg({ type: 'success', text: 'Horarios actualizados correctamente' });
            setTimeout(() => setMsg(null), 3000);
        } catch (error: any) {
            setMsg({ type: 'error', text: error.message || 'Error al guardar los cambios' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-center py-20">Cargando editor visual...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-24 z-30 transition-all">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">Editor Visual</h2>
                        <p className="hidden md:block text-sm text-gray-500">Arrastra las clases para ajustar la hora</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 lg:gap-3 flex-wrap justify-end">
                    {msg && (
                        <div className="text-xs font-medium w-full lg:w-auto text-right order-last lg:order-first mt-1 lg:mt-0">
                            <span className={`${msg.type === 'success' ? 'text-green-600' : 'text-red-600'} animate-fade-in`}>
                                {msg.text}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={handleUndo}
                        disabled={history.length === 0 || isSaving}
                        className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-md font-semibold border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                    >
                        Deshacer
                    </button>
                    <button
                        onClick={saveChanges}
                        disabled={history.length === 0 || isSaving}
                        className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-sm"
                    >
                        <CloudArrowUpIcon className="h-5 w-5" />
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden overflow-x-auto">
                <div className="min-w-[800px]"> {/* Force minimum width for desktop-like editing on mobile */}
                    <div className="flex bg-gray-50 border-b border-gray-200">
                        <div className="w-16 border-r border-gray-200 flex-none bg-gray-50 sticky left-0 z-20"></div> {/* Sticky left column */}
                        <div className="flex-1 grid grid-cols-5">
                            {DAYS.map(day => (
                                <div key={day} className="py-3 text-center border-r border-gray-100 last:border-r-0">
                                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">{day.slice(0, 3)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {blocks.map(block => (
                        <VisualTimeBlock
                            key={block.label}
                            block={block}
                            items={items}
                            onDragStart={handleDragStart}
                            onResizeStart={handleResizeStart}
                            isInteracting={!!interaction}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

interface VisualTimeBlockProps {
    block: { label: string, start: number, end: number, rows: number };
    items: ScheduleItem[];
    onDragStart: (e: React.MouseEvent | React.TouchEvent, id: number, time: string, duration: number, block: any, rect: DOMRect) => void;
    onResizeStart: (e: React.MouseEvent | React.TouchEvent, id: number, time: string, duration: number, block: any, rect: DOMRect) => void;
    isInteracting: boolean;
}

function VisualTimeBlock({ block, items, onDragStart, onResizeStart, isInteracting }: VisualTimeBlockProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const touchTimer = useRef<NodeJS.Timeout | null>(null);
    const totalMinutes = (block.end - block.start) * 60;

    const getItemsForDay = (day: string) => {
        return items.filter((item: any) => {
            const [h, m] = item.time.split(':').map(Number);
            const totalMin = h * 60 + m;
            return item.day === day && totalMin >= block.start * 60 && totalMin < block.end * 60;
        });
    };

    const getPositionStyle = (time: string, duration: number) => {
        const [h, m] = time.split(':').map(Number);
        const startMin = (h - block.start) * 60 + m;
        return {
            top: `${(startMin / totalMinutes) * 100}%`,
            height: `${(duration / totalMinutes) * 100}%`
        };
    };

    const handleTouchStart = (e: React.TouchEvent, item: any) => {
        if (item.id < 0) return; // Ignore course touches

        const clientY = e.touches[0].clientY;

        // Clear any existing timer
        if (touchTimer.current) clearTimeout(touchTimer.current);

        touchTimer.current = setTimeout(() => {
            const rect = containerRef.current!.getBoundingClientRect();
            // Construct a compatible event-like object for handleDragStart
            const fakeEvent = {
                touches: [{ clientY }],
                preventDefault: () => { }
            } as unknown as React.TouchEvent;

            onDragStart(fakeEvent, item.id, item.time, item.duration, block, rect);
            if (navigator.vibrate) navigator.vibrate(50);
            touchTimer.current = null;
        }, 600); // 600ms for long press
    };

    const cancelTouch = () => {
        if (touchTimer.current) {
            clearTimeout(touchTimer.current);
            touchTimer.current = null;
        }
    };

    return (
        <div className="flex relative border-b-4 border-gray-200 last:border-b-0">
            <div className="w-16 bg-gray-50 flex items-center justify-center border-r border-gray-200 text-gray-400 font-bold text-xs [writing-mode:vertical-lr] rotate-180 py-4 select-none sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                {block.label}
            </div>

            <div className="flex-1 relative" ref={containerRef}>
                <div className="grid grid-cols-5 relative z-0 pointer-events-none">
                    {DAYS.map(day => (
                        <div key={day} className="border-r border-gray-100 last:border-r-0 flex flex-col">
                            {Array.from({ length: block.rows }).map((_, i) => (
                                <div key={i} className="h-36 border-b border-gray-100 last:border-b-0 flex items-center justify-center">
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

                <div className="absolute inset-0 z-10 grid grid-cols-5">
                    {DAYS.map(day => (
                        <div key={day} className="relative h-full">
                            {getItemsForDay(day).map((item: any) => {
                                const conflict = items.some((other: any) => {
                                    if (item.id === other.id || item.day !== other.day) return false;
                                    const [hA, mA] = item.time.split(':').map(Number);
                                    const startA = hA * 60 + mA;
                                    const endA = startA + item.duration;
                                    const [hB, mB] = other.time.split(':').map(Number);
                                    const startB = hB * 60 + mB;
                                    const endB = startB + other.duration;
                                    return startA < endB && endA > startB;
                                });

                                const isLocked = item.id < 0;

                                return (
                                    <div
                                        key={item.id}
                                        onMouseDown={(e) => onDragStart(e, item.id, item.time, item.duration, block, containerRef.current!.getBoundingClientRect())}
                                        onTouchStart={(e) => handleTouchStart(e, item)}
                                        onTouchMove={cancelTouch}
                                        onTouchEnd={cancelTouch}
                                        className={`absolute left-1 right-1 rounded-lg border-l-4 shadow-sm flex flex-col justify-center px-2 py-1 select-none hover:shadow-md z-20 group transition-all 
                                            ${!isLocked ? 'cursor-move' : 'cursor-default opacity-90'}
                                            ${isInteracting && !isLocked ? 'duration-0 scale-105 shadow-xl z-50 ring-2 ring-primary-400' : 'duration-500 ease-in-out'}
                                            ${conflict
                                                ? 'bg-red-50 border-red-500 ring-2 ring-red-500 ring-inset opacity-90'
                                                : (item.classInfo.color || 'bg-gray-100')
                                            }`}
                                        style={getPositionStyle(item.time, item.duration)}
                                    >
                                        {conflict && (
                                            <div className="absolute inset-0 bg-red-600/10 rounded-lg pointer-events-none animate-pulse" />
                                        )}
                                        <div className="flex justify-between items-center mb-0.5 pointer-events-none">
                                            <div className="flex items-center gap-1">
                                                {isLocked && <LockClosedIcon className="h-3 w-3 text-current opacity-50" />}
                                                <span className={`font-bold text-[10px] lg:text-xs leading-none ${conflict ? 'text-red-700' : ''}`}>{item.time}</span>
                                            </div>
                                            <div className="flex gap-1 items-center">
                                                {item.classInfo.age_range && (
                                                    <span className="text-[7px] lg:text-[8px] font-black uppercase bg-black/10 px-1 rounded truncate max-w-[40px]">
                                                        {item.classInfo.age_range}
                                                    </span>
                                                )}
                                                <span className={`text-[8px] opacity-70 border border-current px-1 rounded-full ${conflict ? 'border-red-300 text-red-600' : ''}`}>{item.duration} min</span>
                                            </div>
                                        </div>
                                        <span className={`font-medium text-[10px] lg:text-sm leading-tight line-clamp-2 pointer-events-none ${conflict ? 'text-red-900' : ''}`}>{item.classInfo.name}</span>

                                        {!isLocked && (
                                            <div
                                                onMouseDown={(e) => onResizeStart(e, item.id, item.time, item.duration, block, containerRef.current!.getBoundingClientRect())}
                                                onTouchStart={(e) => { e.stopPropagation(); }}
                                                className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors"
                                            >
                                                <div className={`w-8 h-0.5 rounded-full ${conflict ? 'bg-red-400' : 'bg-black/20'}`} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
