import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import VisualScheduleEditor from './VisualScheduleEditor';
import { API_BASE_URL } from '../../config';

interface YogaClassBrief {
    id: number;
    name: string;
    color: string | null;
}

interface Schedule {
    id: number;
    class_id: number | null;
    class_name: string | null;
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
    yoga_class?: YogaClassBrief | null;
}


const API_URL = API_BASE_URL;

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ScheduleManager() {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [yogaClasses, setYogaClasses] = useState<YogaClassBrief[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showVisualEditor, setShowVisualEditor] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        class_id: '',
        day_of_week: 'Lunes',
        start_time: '',
        duration: '60',
        is_active: true
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [schedRes, classRes] = await Promise.all([
                fetch(`${API_URL}/api/schedules`),
                fetch(`${API_URL}/api/yoga-classes`)
            ]);

            if (schedRes.ok && classRes.ok) {
                const schedData = await schedRes.json();
                const classData = await classRes.json();
                setSchedules(schedData);
                setYogaClasses(classData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSchedules = async () => {
        try {
            const response = await fetch(`${API_URL}/api/schedules`);
            if (response.ok) {
                const data = await response.json();
                setSchedules(data);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const token = sessionStorage.getItem('access_token');

        // Calculate end_time based on start_time and duration
        let calculatedEndTime = '';
        if (formData.start_time && formData.duration) {
            const [h, m] = formData.start_time.split(':').map(Number);
            const totalMinutes = h * 60 + m + parseInt(formData.duration);
            const endH = Math.floor(totalMinutes / 60) % 24;
            const endM = totalMinutes % 60;
            calculatedEndTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
        }

        const submitData = {
            class_id: formData.class_id ? parseInt(formData.class_id) : null,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: calculatedEndTime,
            is_active: formData.is_active
        };

        try {
            const url = editingSchedule
                ? `${API_URL}/api/schedules/${editingSchedule.id}`
                : `${API_URL}/api/schedules`;

            const method = editingSchedule ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            });

            if (response.ok) {
                await fetchSchedules();
                handleCloseModal();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Error al guardar el horario');
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            setError('Error de conexión al servidor');
        }
    };

    const handleDeleteClick = (id: number) => {
        setScheduleToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!scheduleToDelete) return;

        const token = sessionStorage.getItem('access_token');

        try {
            const response = await fetch(`${API_URL}/api/schedules/${scheduleToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await fetchSchedules();
                setShowDeleteConfirm(false);
                setScheduleToDelete(null);
            } else {
                alert('Error al eliminar el horario');
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
            alert('Error al eliminar el horario');
        }
    };

    const handleEdit = (schedule: Schedule) => {
        setEditingSchedule(schedule);

        // Calculate duration in minutes
        let duration = '60';
        if (schedule.start_time && schedule.end_time) {
            const [h1, m1] = schedule.start_time.split(':').map(Number);
            const [h2, m2] = schedule.end_time.split(':').map(Number);
            duration = ((h2 * 60 + m2) - (h1 * 60 + m1)).toString();
        }

        setFormData({
            class_id: schedule.class_id?.toString() || '',
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time,
            duration: duration,
            is_active: schedule.is_active
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSchedule(null);
        setError(null);
        setFormData({
            class_id: '',
            day_of_week: 'Lunes',
            start_time: '',
            duration: '60',
            is_active: true
        });
    };

    const groupedSchedules = schedules.reduce((acc: Record<string, Schedule[]>, schedule: Schedule) => {
        if (!acc[schedule.day_of_week]) {
            acc[schedule.day_of_week] = [];
        }
        acc[schedule.day_of_week].push(schedule);
        return acc;
    }, {} as Record<string, Schedule[]>);

    if (isLoading) {
        return <div className="text-center py-12">Cargando datos...</div>;
    }

    if (showVisualEditor) {
        return <VisualScheduleEditor onBack={() => {
            setShowVisualEditor(false);
            fetchInitialData();
        }} />;
    }

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">Gestión de Horarios</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Administra las clases semanales asignando los tipos de clase definidos en el menú.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex sm:gap-3 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => setShowVisualEditor(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-primary-700 shadow-sm ring-1 ring-inset ring-primary-300 hover:bg-primary-50 transition-all"
                    >
                        <CalendarIcon className="h-5 w-5" />
                        Editar Horarios (Visual)
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/classes')}
                        className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        <PlusIcon className="h-5 w-5 text-gray-400" />
                        Crear Nueva Clase
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Añadir al Horario
                    </button>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6">
                {daysOfWeek.map(day => {
                    const daySchedules = groupedSchedules[day] || [];
                    if (daySchedules.length === 0) return null;

                    return (
                        <div key={day} className="bg-white shadow sm:rounded-lg border border-gray-200">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">{day}</h3>
                            </div>
                            <ul className="divide-y divide-gray-200">
                                {daySchedules.map((schedule) => (
                                    <li key={schedule.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {schedule.yoga_class?.name || schedule.class_name || 'Clase sin nombre'}
                                                    </p>
                                                    {schedule.yoga_class?.color && (
                                                        <div className={`w-3 h-3 rounded-full ${schedule.yoga_class.color.split(' ')[0]}`} />
                                                    )}
                                                </div>
                                                <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="opacity-70 text-lg leading-none">🕒</span>
                                                        {schedule.start_time} - {schedule.end_time}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(schedule)}
                                                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                                    title="Editar"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(schedule.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingSchedule ? 'Editar Horario' : 'Añadir al Horario'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Clase</label>
                                <select
                                    required
                                    value={formData.class_id}
                                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                >
                                    <option value="">Selecciona una clase del menú...</option>
                                    {yogaClasses.map(yc => (
                                        <option key={yc.id} value={yc.id}>
                                            {yc.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-2 text-xs text-gray-500 italic">
                                    Si no encuentras la clase, créala primero en el "Menú de Clases".
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Día de la Semana</label>
                                <select
                                    value={formData.day_of_week}
                                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                >
                                    {daysOfWeek.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hora Inicio</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="time"
                                            required
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border [color-scheme:light] pr-10"
                                            style={{ WebkitAppearance: 'none' }}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ClockIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <style dangerouslySetInnerHTML={{
                                        __html: `
                                        input::-webkit-calendar-picker-indicator {
                                            display: none !important;
                                            -webkit-appearance: none;
                                        }
                                    `}} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duración (min)</label>
                                    <input
                                        type="number"
                                        required
                                        min="5"
                                        step="5"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                        placeholder="Ej: 60"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 shadow-sm"
                                >
                                    {editingSchedule ? 'Actualizar' : 'Añadir'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Confirmar Eliminación
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                ¿Estás seguro de que quieres eliminar este horario? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setScheduleToDelete(null);
                                    }}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteConfirm}
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
