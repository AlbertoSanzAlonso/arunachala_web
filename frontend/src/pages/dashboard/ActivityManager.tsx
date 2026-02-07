
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, SparklesIcon, CalendarIcon, ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';
import getCroppedImg from '../../utils/cropImage';
import { API_BASE_URL } from '../../config';
import ToastNotification, { Toast } from '../../components/ToastNotification';
import PageLoader from '../../components/PageLoader';

interface Activity {
    id: number;
    title: string;
    description: string | null;
    type: string;
    start_date: string | null;
    end_date: string | null;
    location: string | null;
    price: string | null;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
    activity_data?: any;
}

const API_URL = API_BASE_URL;

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ActivityManager() {
    const [items, setItems] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Activity | null>(null);
    const [activeTab, setActiveTab] = useState<'cursos' | 'eventos' | 'sugerencias'>('cursos');

    // Generic Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('curso'); // Managed by Tab
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Specific Data States
    const [courseSchedule, setCourseSchedule] = useState<{ day: string; time: string; duration: number }[]>([]);
    const [hasReminder, setHasReminder] = useState(false);
    const [pollOptions, setPollOptions] = useState<{ text: string }[]>([]);
    const [allowCustomSuggestions, setAllowCustomSuggestions] = useState(false);

    // Cropper States
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    // Toast & Loader State
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    useEffect(() => {
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update 'type' when tab changes
    useEffect(() => {
        if (activeTab === 'cursos') setType('curso');
        else if (activeTab === 'eventos') setType('taller'); // default to taller, can be evento/retiro
        else if (activeTab === 'sugerencias') setType('sugerencia');

        // Reset form when tab changes
        handleCloseModal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/activities?active_only=false`);
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            addToast('error', 'Error al cargar las actividades');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthError = () => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user_role');
        window.location.href = '/login';
    };

    const addToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // --- Image Handling ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || null);
                setIsCropping(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropSave = async () => {
        if (imageSrc && croppedAreaPixels) {
            try {
                const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
                if (croppedImageBlob) {
                    setSelectedFile(croppedImageBlob);
                    setPreviewUrl(URL.createObjectURL(croppedImageBlob));
                    setIsCropping(false);
                    setImageSrc(null);
                }
            } catch (e) {
                console.error(e);
                addToast('error', "Error al recortar la imagen");
            }
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setImageSrc(null);
    };

    // --- Form Submission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Cursos must have a schedule
        if (activeTab === 'cursos' && courseSchedule.length === 0) {
            addToast('warning', 'Por favor, añade al menos una sesión al horario semanal del curso antes de guardar.');
            return;
        }

        setIsSaving(true);
        const token = sessionStorage.getItem('access_token');

        try {
            const url = editingItem
                ? `${API_URL}/api/activities/${editingItem.id}`
                : `${API_URL}/api/activities`;

            const method = editingItem ? 'PUT' : 'POST';

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('type', type);
            if (startDate) formData.append('start_date', startDate);
            if (endDate) formData.append('end_date', endDate);
            if (location) formData.append('location', location);
            if (price) formData.append('price', price);

            // Construct activity_data based on type
            let activityDataObj: any = {};
            if (type === 'curso') {
                activityDataObj = { schedule: courseSchedule };
            } else if (['taller', 'evento', 'retiro'].includes(type)) {
                activityDataObj = { has_reminder: hasReminder };
            } else if (type === 'sugerencia') {
                activityDataObj = { options: pollOptions, allow_custom: allowCustomSuggestions };
            }
            formData.append('activity_data', JSON.stringify(activityDataObj));

            if (selectedFile) {
                if (selectedFile instanceof Blob && !(selectedFile instanceof File)) {
                    formData.append('image', selectedFile, 'activity.webp');
                } else {
                    formData.append('image', selectedFile);
                }
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                await fetchItems();
                handleCloseModal();
                addToast('success', editingItem ? 'Actividad actualizada correctamente' : 'Actividad creada correctamente');
            } else if (response.status === 401 || response.status === 403) {
                handleAuthError();
            } else {
                let errorMsg = 'Error al guardar';
                try {
                    const error = await response.json();
                    errorMsg = error.detail || errorMsg;
                } catch (e) {
                    console.error("Failed to parse error response", e);
                }
                addToast('error', errorMsg);
            }
        } catch (error) {
            console.error('Error saving activity:', error);
            addToast('error', 'Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        setIsSaving(true);
        const token = sessionStorage.getItem('access_token');
        try {
            const response = await fetch(`${API_URL}/api/activities/${itemToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await fetchItems();
                setShowDeleteConfirm(false);
                setItemToDelete(null);
                addToast('success', 'Actividad eliminada correctamente');
            } else if (response.status === 401 || response.status === 403) {
                handleAuthError();
            } else {
                addToast('error', 'Error al eliminar');
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
            addToast('error', 'Error al eliminar');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (item: Activity) => {
        setEditingItem(item);
        setTitle(item.title);
        setDescription(item.description || '');
        setType(item.type);
        setStartDate(item.start_date ? item.start_date.substring(0, 10) : '');
        setEndDate(item.end_date ? item.end_date.substring(0, 10) : '');
        setLocation(item.location || '');
        setPrice(item.price || '');
        setPreviewUrl(item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`) : null);
        setSelectedFile(null);

        // Load specific data
        const ad = item.activity_data || {};
        if (item.type === 'curso') {
            setCourseSchedule(ad.schedule || []);
        } else if (item.type === 'sugerencia') {
            setPollOptions(ad.options || []);
            setAllowCustomSuggestions(ad.allow_custom || false);
        } else {
            setHasReminder(ad.has_reminder || false);
        }

        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setTitle('');
        setDescription('');
        // Reset type based on active tab again to be safe
        if (activeTab === 'cursos') setType('curso');
        else if (activeTab === 'eventos') setType('taller');
        else if (activeTab === 'sugerencias') setType('sugerencia');

        setStartDate('');
        setEndDate('');
        setLocation('');
        setPrice('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setImageSrc(null);
        setIsCropping(false);
        setCourseSchedule([]);
        setHasReminder(false);
        setPollOptions([]);
        setAllowCustomSuggestions(false);
        setShowCloseConfirm(false);
    };

    const handleCloseAttempt = () => {
        // Check if there's any unsaved data
        const hasUnsavedData = title || description || courseSchedule.length > 0 || pollOptions.length > 0 || selectedFile;
        if (hasUnsavedData) {
            setShowCloseConfirm(true);
        } else {
            handleCloseModal();
        }
    };

    const formatShortDate = (dateStr: string | null) => {
        if (!dateStr) return 'No especificada';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    // --- Sub-components for Form Sections ---

    const CourseScheduleEditor = () => {
        const [newDay, setNewDay] = useState('Lunes');
        const [newTime, setNewTime] = useState('');
        const [newDuration, setNewDuration] = useState(60);
        const [editingIndex, setEditingIndex] = useState<number | null>(null);
        const timeInputRef = React.useRef<HTMLInputElement>(null);

        const addSession = () => {
            // Read time value directly from the input element to avoid state sync issues
            const timeValue = timeInputRef.current?.value || newTime;
            const trimmedTime = timeValue.trim();
            if (trimmedTime) {
                if (editingIndex !== null) {
                    // Update existing session
                    const updated = [...courseSchedule];
                    updated[editingIndex] = {
                        day: newDay,
                        time: trimmedTime,
                        duration: newDuration
                    };
                    setCourseSchedule(updated);
                    setEditingIndex(null);
                } else {
                    // Add new session
                    setCourseSchedule([...courseSchedule, {
                        day: newDay,
                        time: trimmedTime,
                        duration: newDuration
                    }]);
                }
                // Reset form
                setNewTime('');
                setNewDay('Lunes');
                setNewDuration(60);
            }
        };

        const removeSession = (idx: number) => {
            const n = [...courseSchedule];
            n.splice(idx, 1);
            setCourseSchedule(n);
            if (editingIndex === idx) {
                setEditingIndex(null);
                setNewTime('');
                setNewDay('Lunes');
                setNewDuration(60);
            }
        };

        const editSession = (idx: number) => {
            const session = courseSchedule[idx];
            setNewDay(session.day);
            setNewTime(session.time);
            setNewDuration(session.duration);
            setEditingIndex(idx);
            // Also set the input value directly to ensure it's synced
            if (timeInputRef.current) {
                timeInputRef.current.value = session.time;
            }
        };

        const cancelEdit = () => {
            setEditingIndex(null);
            setNewTime('');
            setNewDay('Lunes');
            setNewDuration(60);
        };

        return (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Horario Semanal del Curso</h4>
                <div className="space-y-2 mb-4">
                    {courseSchedule.map((s, idx) => (
                        <div key={idx} className={`flex justify-between items-center bg-white p-3 rounded border ${editingIndex === idx ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'} text-sm`}>
                            <span className="font-medium">{s.day} a las {s.time} ({s.duration} min)</span>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => editSession(idx)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar sesión">
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => removeSession(idx)} className="text-red-500 hover:text-red-700 p-1" title="Eliminar sesión">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {courseSchedule.length === 0 && <p className="text-xs text-gray-500 italic">No hay sesiones definidas.</p>}
                </div>
                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Día</label>
                        <select value={newDay} onChange={e => setNewDay(e.target.value)} className="block w-full text-sm rounded-md border-gray-300 px-3 py-2">
                            {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Hora</label>
                        <input
                            ref={timeInputRef}
                            type="time"
                            value={newTime}
                            onChange={e => setNewTime(e.target.value)}
                            className="block w-full text-sm rounded-md border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Duración (min)</label>
                        <input type="number" value={newDuration} onChange={e => setNewDuration(parseInt(e.target.value))} className="block w-full text-sm rounded-md border-gray-300 px-3 py-2" placeholder="60" />
                    </div>
                    {editingIndex !== null ? (
                        <>
                            <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400 font-medium">
                                Cancelar
                            </button>
                            <button type="button" onClick={addSession} className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-500 font-medium">
                                Actualizar
                            </button>
                        </>
                    ) : (
                        <button type="button" onClick={addSession} className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-500 flex items-center gap-2">
                            <PlusIcon className="h-4 w-4" />
                            Añadir
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const PollOptionsEditor = () => {
        const [newOption, setNewOption] = useState('');

        const addOption = () => {
            if (newOption.trim()) {
                setPollOptions([...pollOptions, { text: newOption.trim() }]);
                setNewOption('');
            }
        };

        const removeOption = (idx: number) => {
            const n = [...pollOptions];
            n.splice(idx, 1);
            setPollOptions(n);
        };

        return (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Opciones de Votación</h4>
                <div className="space-y-2 mb-4">
                    {pollOptions.map((o, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-sm">
                            <span>{o.text}</span>
                            <button type="button" onClick={() => removeOption(idx)} className="text-red-500 hover:text-red-700">
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {pollOptions.length === 0 && <p className="text-xs text-gray-500 italic">No hay opciones definidas.</p>}
                </div>
                <div className="flex gap-2">
                    <input type="text" value={newOption} onChange={e => setNewOption(e.target.value)} className="block w-full text-sm rounded-md border-gray-300" placeholder="Nueva opción..." />
                    <button type="button" onClick={addOption} className="px-3 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-500">
                        Añadir
                    </button>
                </div>
                <div className="mt-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={allowCustomSuggestions} onChange={e => setAllowCustomSuggestions(e.target.checked)} className="rounded text-primary-600 focus:ring-primary-500" />
                        Permitir que los usuarios añadan sus propias sugerencias
                    </label>
                </div>
            </div>
        );
    };

    // Filter items based on active Tab
    const filteredItems = items.filter(item => {
        if (activeTab === 'cursos') return item.type === 'curso';
        if (activeTab === 'eventos') return ['taller', 'evento', 'retiro'].includes(item.type);
        if (activeTab === 'sugerencias') return item.type === 'sugerencia';
        return false;
    });

    return (
        <div className="space-y-6">
            {isSaving && <PageLoader />}
            <ToastNotification toasts={toasts} onRemove={removeToast} />

            {/* Cropper Modal */}
            {isCropping && imageSrc && (
                <div className="fixed inset-0 z-[70] bg-black bg-opacity-80 flex flex-col items-center justify-center p-4">
                    <div className="relative w-full max-w-2xl h-[400px] bg-gray-900 rounded-lg overflow-hidden">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={16 / 9}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button onClick={handleCropCancel} className="px-6 py-2 bg-white text-gray-800 rounded-md font-bold hover:bg-gray-100">Cancelar</button>
                        <button onClick={handleCropSave} className="px-6 py-2 bg-primary-600 text-white rounded-md font-bold hover:bg-primary-500">Recortar y Guardar</button>
                    </div>
                </div>
            )}

            <div className="sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">Gestión de Actividades</h1>
                    <p className="mt-2 text-sm text-gray-700">Administra cursos, talleres, eventos y sugerencias.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 flex sm:flex-row gap-3 sm:flex-none">
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                    >
                        <PlusIcon className="h-5 w-5" />
                        {activeTab === 'sugerencias' ? 'Añadir Sugerencia' : activeTab === 'cursos' ? 'Añadir Curso' : 'Añadir Actividad'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('cursos')}
                        className={`${activeTab === 'cursos'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
                    >
                        <CalendarIcon className="h-5 w-5" />
                        Cursos
                    </button>
                    <button
                        onClick={() => setActiveTab('eventos')}
                        className={`${activeTab === 'eventos'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
                    >
                        <SparklesIcon className="h-5 w-5" />
                        Talleres y Eventos
                    </button>
                    <button
                        onClick={() => setActiveTab('sugerencias')}
                        className={`${activeTab === 'sugerencias'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
                    >
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                        Sugerencias
                    </button>
                </nav>
            </div>

            {isLoading ? (
                <div className="text-center py-12">Cargando...</div>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                            {/* Image Header */}
                            {item.type !== 'sugerencia' && (
                                <div className="h-40 w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center opacity-30">
                                            <SparklesIcon className="h-12 w-12 text-forest" />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex-1 p-6">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${item.type === 'curso' ? 'bg-blue-100 text-blue-700' :
                                    item.type === 'taller' ? 'bg-purple-100 text-purple-700' :
                                        item.type === 'sugerencia' ? 'bg-amber-100 text-amber-700' :
                                            'bg-forest/10 text-forest'
                                    }`}>
                                    {item.type}
                                </span>
                                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                                {item.type === 'sugerencia' && (
                                    <div className="mt-4 text-sm text-gray-500">
                                        <p className="font-medium">Opciones:</p>
                                        <ul className="list-disc pl-5 mt-1">
                                            {item.activity_data?.options?.map((o: any, idx: number) => (
                                                <li key={idx}>{o.text}</li>
                                            )) || <li className="italic">Sin opciones</li>}
                                        </ul>
                                    </div>
                                )}
                                {item.type !== 'sugerencia' && (
                                    <div className="mt-4 space-y-2 text-sm text-gray-500">
                                        <p className="flex items-center gap-2"><span className="font-medium text-gray-700">Inicio:</span> {formatShortDate(item.start_date)}</p>
                                        <p className="flex items-center gap-2 line-clamp-1"><span className="font-medium text-gray-700">Lugar:</span> {item.location || 'Centro Arunachala'}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex border-t border-gray-200 divide-x divide-gray-200">
                                <button onClick={() => handleEdit(item)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <PencilIcon className="h-4 w-4" /> Editar
                                </button>
                                <button onClick={() => handleDeleteClick(item.id)} className="flex-1 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center justify-center gap-2">
                                    <TrashIcon className="h-4 w-4" /> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 italic bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            No hay {activeTab} creadas.
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
                    style={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        position: 'fixed',
                        width: '100vw',
                        height: '100vh',
                        margin: 0,
                        padding: 0
                    }}
                    onClick={handleCloseAttempt}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">{editingItem ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
                            <button onClick={handleCloseAttempt} className="text-gray-400 hover:text-gray-500" title="Cerrar">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-6 overflow-y-auto max-h-[85vh]">
                            {/* Standard Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {activeTab === 'sugerencias' ? 'Pregunta / Título' : 'Título'} *
                                    </label>
                                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm" />
                                </div>

                                {activeTab !== 'sugerencias' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm" />
                                    </div>
                                )}

                                {activeTab === 'eventos' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tipo *</label>
                                        <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm">
                                            <option value="taller">Taller</option>
                                            <option value="evento">Evento</option>
                                            <option value="retiro">Retiro</option>
                                        </select>
                                    </div>
                                )}

                                {/* Specific Fields based on activeTab */}

                                {/* Dates for Courses/Events */}
                                {(activeTab === 'cursos' || activeTab === 'eventos') && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
                                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Precio</label>
                                            <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm" placeholder="Ej: 30€" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Lugar</label>
                                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm" placeholder="Opcional" />
                                        </div>
                                    </>
                                )}

                                {/* Course Schedule Editor */}
                                {activeTab === 'cursos' && (
                                    <div className="md:col-span-2">
                                        <CourseScheduleEditor />
                                    </div>
                                )}

                                {/* Suggestions Poll Editor */}
                                {activeTab === 'sugerencias' && (
                                    <div className="md:col-span-2">
                                        <PollOptionsEditor />
                                    </div>
                                )}

                                {/* Image Upload (Not for suggestions) */}
                                {activeTab !== 'sugerencias' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Imagen</label>
                                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-6">
                                            <div className="text-center">
                                                {previewUrl ? (
                                                    <div className="relative mb-4">
                                                        <img src={previewUrl} alt="Preview" className="mx-auto h-32 object-cover rounded-lg" />
                                                        <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm"><TrashIcon className="h-4 w-4" /></button>
                                                    </div>
                                                ) : (
                                                    <PhotoIcon className="mx-auto h-10 w-10 text-gray-300" />
                                                )}
                                                <label className="cursor-pointer bg-white rounded-md font-semibold text-primary-600 hover:text-primary-500 text-sm">
                                                    <span>Subir imagen</span>
                                                    <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Reminder Feature (Eventos) */}
                                {activeTab === 'eventos' && (
                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input type="checkbox" checked={hasReminder} onChange={e => setHasReminder(e.target.checked)} className="rounded text-primary-600 focus:ring-primary-500" />
                                            Activar botón de recordatorio (Google Calendar)
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseAttempt} className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700">Cancelar</button>
                                <button type="submit" className="rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        margin: 0,
                        padding: 0
                    }}
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-500 mb-6">¿Estás seguro de que quieres eliminar esta actividad?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-md">Cancelar</button>
                            <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {showCloseConfirm && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-[60]"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        margin: 0,
                        padding: 0
                    }}
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">¿Descartar cambios?</h3>
                        <p className="text-gray-500 mb-6">Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar sin guardar?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowCloseConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Continuar editando</button>
                            <button onClick={handleCloseModal} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Descartar cambios</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
