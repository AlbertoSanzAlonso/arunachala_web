import React, { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, SparklesIcon, CalendarIcon, ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
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
    vote_results?: Record<string, number>;
    user_comments?: { text: string; option: string; date: string }[];
}

const API_URL = API_BASE_URL;
const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// --- Sub-components (Moved outside to keep focus and simplify) ---

const CourseScheduleEditor = ({ sessions, setSessions }: { sessions: any[], setSessions: (s: any[]) => void }) => {
    const [newDay, setNewDay] = useState('Lunes');
    const [newTime, setNewTime] = useState('');
    const [newDuration, setNewDuration] = useState(60);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const timeInputRef = useRef<HTMLInputElement>(null);

    const addSession = () => {
        const timeValue = timeInputRef.current?.value || newTime;
        const trimmedTime = timeValue.trim();
        if (trimmedTime) {
            const newSession = { day: newDay, time: trimmedTime, duration: newDuration };
            if (editingIndex !== null) {
                const n = [...sessions];
                n[editingIndex] = newSession;
                setSessions(n);
                setEditingIndex(null);
            } else {
                setSessions([...sessions, newSession]);
            }
            setNewTime('');
            setNewDuration(60);
        }
    };

    const removeSession = (idx: number) => {
        const n = [...sessions];
        n.splice(idx, 1);
        setSessions(n);
    };

    const editSession = (idx: number) => {
        const s = sessions[idx];
        setNewDay(s.day);
        setNewTime(s.time);
        setNewDuration(s.duration);
        setEditingIndex(idx);
        if (timeInputRef.current) timeInputRef.current.value = s.time;
    };

    return (
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">Horario Semanal del Curso</h4>
            <div className="space-y-2.5 mb-5">
                {sessions.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 text-sm shadow-sm group">
                        <span className="font-semibold text-gray-700">{s.day} - {s.time} <span className="text-gray-400 font-normal">({s.duration} min)</span></span>
                        <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => editSession(idx)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                                <PencilIcon className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => removeSession(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[120px]">
                    <label className="text-[10px] font-bold text-gray-400 mb-1 block uppercase">Día</label>
                    <select value={newDay} onChange={e => setNewDay(e.target.value)} className="block w-full rounded-xl border-gray-200 bg-white p-3 shadow-sm focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 transition-all font-medium text-sm">
                        {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[100px]">
                    <label className="text-[10px] font-bold text-gray-400 mb-1 block uppercase">Hora</label>
                    <input
                        ref={timeInputRef}
                        type="time"
                        value={newTime}
                        onChange={e => setNewTime(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSession(); } }}
                        className="block w-full rounded-xl border-gray-200 bg-white p-3 shadow-sm focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 transition-all font-medium text-sm"
                    />
                </div>
                <div className="flex-1 min-w-[100px]">
                    <label className="text-[10px] font-bold text-gray-400 mb-1 block uppercase">Minutos</label>
                    <input
                        type="number"
                        value={newDuration}
                        onChange={e => setNewDuration(parseInt(e.target.value))}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSession(); } }}
                        className="block w-full rounded-xl border-gray-200 bg-white p-3 shadow-sm focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 transition-all font-medium text-sm"
                    />
                </div>
                <button
                    type="button"
                    onClick={addSession}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl text-sm hover:bg-primary-700 font-bold shadow-lg shadow-primary-200 active:scale-95 transition-all"
                >
                    {editingIndex !== null ? 'OK' : 'Añadir'}
                </button>
            </div>
        </div>
    );
};

const AVAILABLE_ICONS = [
    '✨', '🧘', '🧘‍♂️', '🧘‍♀️', '🏔️', '🎓', '🌿', '🐣', '💆', '💆‍♂️', '💆‍♀️',
    '🎶', '📢', '🕉️', '🙏', '💡', '🌸', '🌺', '🍃', '🌙', '☀️', '⭐', '🔮',
    '🎨', '📚', '🍵', '🍶', '🕯️', '🦋', '🌈', '💫', '🌻', '🧠', '❤️', '🌊'
];

const PollOptionsEditor = ({ options, setOptions, allowCustom, setAllowCustom }: { options: any[], setOptions: (o: any[]) => void, allowCustom: boolean, setAllowCustom: (a: boolean) => void }) => {
    const [newOption, setNewOption] = useState('');
    const [showIconPicker, setShowIconPicker] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const optionRefs = useRef<(HTMLInputElement | null)[]>([]);

    const addOption = () => {
        if (newOption.trim()) {
            setOptions([...options, { text: newOption.trim(), icon: '✨' }]);
            setNewOption('');
            setTimeout(() => inputRef.current?.focus(), 20);
        }
    };

    const updateOption = (idx: number, text: string) => {
        const n = [...options];
        n[idx].text = text;
        setOptions(n);
    };

    const updateIcon = (idx: number, icon: string) => {
        const n = [...options];
        n[idx].icon = icon;
        setOptions(n);
        setShowIconPicker(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (idx < options.length - 1) {
                optionRefs.current[idx + 1]?.focus();
            } else {
                inputRef.current?.focus();
            }
        }
    };

    return (
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest flex justify-between items-center">
                <span>Opciones de Votación</span>
                <span className="text-[9px] font-normal lowercase tracking-normal">Pulsa enter para siguiente</span>
            </h4>
            <div className="space-y-2.5 mb-5">
                {options.map((o, idx) => (
                    <div key={idx} className="flex gap-2 items-center group">
                        {/* Icon Selector */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowIconPicker(showIconPicker === idx ? null : idx)}
                                className="w-12 h-12 flex items-center justify-center text-2xl bg-white border-2 border-gray-200 rounded-xl hover:border-primary-400 hover:shadow-md transition-all active:scale-95"
                                title="Cambiar icono"
                            >
                                {o.icon || '✨'}
                            </button>

                            {/* Icon Picker Dropdown */}
                            {showIconPicker === idx && (
                                <div className="absolute z-50 top-14 left-0 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-3 w-64">
                                    <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto">
                                        {AVAILABLE_ICONS.map((icon) => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => updateIcon(idx, icon)}
                                                className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-primary-50 transition-colors ${o.icon === icon ? 'bg-primary-100 ring-2 ring-primary-400' : 'bg-gray-50'}`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowIconPicker(null)}
                                        className="mt-2 w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative flex-grow">
                            <input
                                ref={el => optionRefs.current[idx] = el}
                                type="text"
                                value={o.text}
                                onChange={(e) => updateOption(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                className="block w-full text-sm rounded-xl border-gray-200 bg-white p-3 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium pr-10"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-gray-300 font-bold uppercase">#{idx + 1}</span>
                            </div>
                        </div>
                        <button type="button" onClick={() => {
                            const n = [...options];
                            n.splice(idx, 1);
                            setOptions(n);
                        }} className="text-gray-300 hover:text-red-500 transition-colors p-2 active:scale-90">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-3">
                <div className="relative flex-grow">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newOption}
                        onChange={e => setNewOption(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addOption();
                            }
                        }}
                        className="block w-full text-sm rounded-xl border-primary-100 bg-white p-4 shadow-sm focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 transition-all font-semibold"
                        placeholder="Añadir nueva opción..."
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        <PlusIcon className="h-5 w-5 text-primary-300" />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={addOption}
                    className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm hover:bg-primary-700 font-bold shadow-lg shadow-primary-200 active:scale-95 transition-all"
                    disabled={!newOption.trim()}
                >
                    Añadir
                </button>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100">
                <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer group">
                    <input type="checkbox" checked={allowCustom} onChange={e => setAllowCustom(e.target.checked)} className="w-5 h-5 rounded-md border-gray-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer" />
                    <span className="group-hover:text-primary-600 transition-colors font-medium">Permitir que los usuarios añadan sus propias sugerencias</span>
                </label>
            </div>
        </div>
    );
};

const formatShortDate = (dateStr: string | null) => {
    if (!dateStr) return 'No especificada';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function ActivityManager() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Activity | null>(null);
    const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
    const [selectedComment, setSelectedComment] = useState<{ text: string; option: string; date: string } | null>(null);
    const [showCommentModal, setShowCommentModal] = useState(false);

    // Initialize tab from URL
    const initialTab = (searchParams.get('tab') as 'cursos' | 'eventos' | 'sugerencias') || 'cursos';
    const [activeTab, setActiveTab] = useState<'cursos' | 'eventos' | 'sugerencias'>(initialTab);

    // Sync URL when tab changes
    useEffect(() => {
        setSearchParams(prev => {
            prev.set('tab', activeTab);
            return prev;
        }, { replace: true });
    }, [activeTab, setSearchParams]);

    // Generic Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('curso');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Specific Data States
    const [courseSchedule, setCourseSchedule] = useState<{ day: string; time: string; duration: number }[]>([]);
    const [hasReminder, setHasReminder] = useState(false);
    const [pollOptions, setPollOptions] = useState<{ text: string; icon?: string }[]>([]);
    const [allowCustomSuggestions, setAllowCustomSuggestions] = useState(false);
    const [activityColor, setActivityColor] = useState('bg-emerald-100 border-emerald-300 text-emerald-800');

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
    }, []);

    useEffect(() => {
        if (activeTab === 'cursos') setType('curso');
        else if (activeTab === 'eventos') setType('taller');
        else if (activeTab === 'sugerencias') setType('sugerencia');
        handleCloseModal();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'cursos' && courseSchedule.length === 0) {
            addToast('warning', 'Por favor, añade al menos una sesión al horario.');
            return;
        }

        setIsSaving(true);
        const token = sessionStorage.getItem('access_token');

        try {
            const url = editingItem ? `${API_URL}/api/activities/${editingItem.id}` : `${API_URL}/api/activities`;
            const method = editingItem ? 'PUT' : 'POST';

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('type', type);
            if (startDate) formData.append('start_date', startDate);
            if (endDate) formData.append('end_date', endDate);
            if (location) formData.append('location', location);
            if (price) formData.append('price', price);

            let activityDataObj: any = {};
            if (type === 'curso') activityDataObj = { schedule: courseSchedule, color: activityColor };
            else if (['taller', 'evento', 'retiro'].includes(type)) activityDataObj = { has_reminder: hasReminder };
            else if (type === 'sugerencia') activityDataObj = { options: pollOptions, allow_custom: allowCustomSuggestions };

            formData.append('activity_data', JSON.stringify(activityDataObj));

            if (selectedFile) {
                formData.append('image', selectedFile, 'activity.webp');
            }

            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                await fetchItems();
                handleCloseModal();
                addToast('success', 'Guardado correctamente');
            } else {
                addToast('error', 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving:', error);
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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                await fetchItems();
                setShowDeleteConfirm(false);
                addToast('success', 'Eliminado correctamente');
            } else {
                addToast('error', 'Error al eliminar');
            }
        } catch (error) {
            console.error('Error deleting:', error);
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

        const ad = item.activity_data || {};
        if (item.type === 'curso') {
            setCourseSchedule(ad.schedule || []);
            setActivityColor(ad.color || 'bg-emerald-100 border-emerald-300 text-emerald-800');
        }
        else if (item.type === 'sugerencia') {
            // Ensure all options have an icon (migration for old data)
            const options = (ad.options || []).map((opt: any) => ({
                text: opt.text,
                icon: opt.icon || '✨'
            }));
            setPollOptions(options);
            setAllowCustomSuggestions(ad.allow_custom || false);
        } else setHasReminder(ad.has_reminder || false);

        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setTitle('');
        setDescription('');
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
        setActivityColor('bg-emerald-100 border-emerald-300 text-emerald-800');
        setShowCloseConfirm(false);
    };

    const handleCloseAttempt = () => {
        if (title || description || courseSchedule.length > 0 || pollOptions.length > 0) setShowCloseConfirm(true);
        else handleCloseModal();
    };

    const filteredItems = items.filter(item => {
        const now = new Date();
        const isExpired = item.end_date && new Date(item.end_date) < now;
        if (isExpired) return false;

        if (activeTab === 'cursos') return item.type === 'curso';
        if (activeTab === 'eventos') return ['taller', 'evento', 'retiro'].includes(item.type);
        if (activeTab === 'sugerencias') return item.type === 'sugerencia';
        return false;
    });

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
            {isSaving && <PageLoader />}
            <ToastNotification toasts={toasts} onRemove={removeToast} />

            {/* Cropper Modal */}
            <Transition show={isCropping && !!imageSrc} as={Fragment}>
                <Dialog as="div" className="relative z-[70]" onClose={() => { }} static>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/80 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="relative w-full max-w-2xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center p-4">
                                    <div className="relative w-full h-[300px] sm:h-[400px] bg-gray-900 rounded-lg overflow-hidden">
                                        <Cropper
                                            image={imageSrc || ''}
                                            crop={crop}
                                            zoom={zoom}
                                            aspect={16 / 9}
                                            onCropChange={setCrop}
                                            onCropComplete={onCropComplete}
                                            onZoomChange={setZoom}
                                        />
                                    </div>
                                    <div className="mt-6 flex gap-4">
                                        <button onClick={handleCropCancel} className="px-6 py-2 bg-white rounded-md font-bold text-gray-900 hover:bg-gray-100 text-sm">Cancelar</button>
                                        <button onClick={handleCropSave} className="px-6 py-2 bg-primary-600 text-white rounded-md font-bold hover:bg-primary-500 text-sm">Guardar Recorte</button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Actividades</h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">Administra cursos, talleres y sugerencias.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-100 hover:bg-primary-500 transition-all active:scale-95">
                    <PlusIcon className="h-5 w-5" />
                    Nueva {activeTab === 'sugerencias' ? 'Sugerencia' : activeTab === 'cursos' ? 'Curso' : 'Actividad'}
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 bg-white/50 -mx-4 px-4 sm:mx-0 sm:px-0 sticky top-16 lg:top-24 z-30 backdrop-blur-md">
                <nav className="mobile-tabs-container hide-scrollbar -mb-px flex space-x-6 sm:space-x-8">
                    {['cursos', 'eventos', 'sugerencias'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold capitalize flex items-center gap-2 transition-all`}
                        >
                            {tab === 'cursos' && <CalendarIcon className="h-5 w-5 shrink-0" />}
                            {tab === 'eventos' && <SparklesIcon className="h-5 w-5 shrink-0" />}
                            {tab === 'sugerencias' && <ChatBubbleLeftRightIcon className="h-5 w-5 shrink-0" />}
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-gray-400">Cargando...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all group">
                            <div className="h-40 sm:h-48 bg-gray-50 relative overflow-hidden">
                                {item.image_url ? (
                                    <img src={item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex h-full items-center justify-center opacity-10"><SparklesIcon className="h-16 w-16" /></div>
                                )}
                                {/* Featured Badge */}
                                {['taller', 'evento', 'retiro'].includes(item.type) && item.activity_data?.has_reminder && (
                                    <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                                        <span>✨</span>
                                        <span>Destacado</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 p-5 sm:p-6">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 bg-primary-50 text-primary-700 tracking-wider transition-colors">{item.type}</span>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.title}</h3>
                                {item.description && <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>}

                                {item.type === 'sugerencia' && (
                                    <div className="mt-4 space-y-3">
                                        <div className="space-y-1.5 min-h-[60px]">
                                            {item.activity_data?.options?.slice(0, 3).map((o: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-[11px] text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100/50">
                                                    <span className="truncate pr-2">{o.icon} {o.text}</span>
                                                    <span className="font-bold text-primary-600 shrink-0">{item.vote_results?.[o.text] || 0}</span>
                                                </div>
                                            ))}
                                            {(item.activity_data?.options?.length || 0) > 3 && (
                                                <p className="text-[10px] text-gray-400 italic pl-1">Y {(item.activity_data.options.length - 3)} más...</p>
                                            )}
                                        </div>

                                        {item.user_comments && item.user_comments.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    setEditingItem(item);
                                                    setSelectedComment(item.user_comments?.[0] || null);
                                                    setShowCommentModal(true);
                                                }}
                                                className="w-full mt-2 py-2.5 px-3 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 hover:border-primary-400 hover:text-primary-600 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                                            >
                                                <ChatBubbleLeftRightIcon className="h-4 w-4 text-primary-500" />
                                                Ver {item.user_comments.length} ideas
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex border-t border-gray-100 bg-gray-50/30">
                                <button onClick={() => handleEdit(item)} className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-white hover:text-primary-600 transition-all flex items-center justify-center gap-2 leading-none"><PencilIcon className="h-4 w-4" /> Editar</button>
                                <div className="w-px bg-gray-100"></div>
                                <button onClick={() => handleDeleteClick(item.id)} className="flex-1 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 leading-none"><TrashIcon className="h-4 w-4" /> Borrar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Transition show={showModal} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={() => !isCropping && handleCloseAttempt()}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-600/80 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-4xl min-h-[500px] flex flex-col">
                                    <div className="flex justify-between items-center p-6 border-b">
                                        <Dialog.Title as="h2" className="text-xl font-bold">
                                            {editingItem ? 'Editar' : 'Nueva'} {
                                                activeTab === 'sugerencias' ? 'Sugerencia' :
                                                    activeTab === 'cursos' ? 'Curso' :
                                                        'Actividad'
                                            }
                                        </Dialog.Title>
                                        <button onClick={handleCloseAttempt} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            <XMarkIcon className="h-6 w-6 text-gray-400" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Título de la actividad</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={title}
                                                    onChange={e => setTitle(e.target.value)}
                                                    className="block w-full rounded-xl border-gray-200 bg-white p-3.5 shadow-sm focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 transition-all font-bold text-lg text-gray-900 placeholder:font-normal"
                                                    placeholder="Ej: Curso intensivo de Hatha Yoga"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                                                <textarea
                                                    rows={4}
                                                    value={description}
                                                    onChange={e => setDescription(e.target.value)}
                                                    className="block w-full rounded-xl border-gray-200 bg-white p-3.5 shadow-sm focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 transition-all font-medium text-gray-900"
                                                    placeholder="Describe los detalles de la actividad..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de inicio</label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={e => setStartDate(e.target.value)}
                                                    className="block w-full rounded-xl border-gray-200 bg-white p-3.5 shadow-sm focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 transition-all font-medium text-gray-900"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de fin (opcional)</label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={e => setEndDate(e.target.value)}
                                                    className="block w-full rounded-xl border-gray-200 bg-white p-3.5 shadow-sm focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 transition-all font-medium text-gray-900"
                                                />
                                            </div>

                                            {activeTab !== 'sugerencias' && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación</label>
                                                        <input
                                                            type="text"
                                                            value={location}
                                                            onChange={e => setLocation(e.target.value)}
                                                            className="block w-full rounded-xl border-gray-200 bg-white p-3.5 shadow-sm focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 transition-all font-medium text-gray-900"
                                                            placeholder="Ej: Sala 1, Planta Baja"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Precio / Inversión</label>
                                                        <input
                                                            type="text"
                                                            value={price}
                                                            onChange={e => setPrice(e.target.value)}
                                                            className="block w-full rounded-xl border-gray-200 bg-white p-3.5 shadow-sm focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 transition-all font-medium text-gray-900"
                                                            placeholder="Ej: 50€ o Gratuito"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {activeTab === 'cursos' && (
                                                <div className="md:col-span-2 space-y-6">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Color en el Horario</label>
                                                        <div className="flex flex-wrap gap-3">
                                                            {[
                                                                { name: 'Forest', class: 'bg-forest/20 border-forest text-forest' },
                                                                { name: 'Sky', class: 'bg-sky-100 border-sky-300 text-sky-800' },
                                                                { name: 'Yellow', class: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
                                                                { name: 'Rose', class: 'bg-rose-100 border-rose-300 text-rose-800' },
                                                                { name: 'Emerald', class: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
                                                                { name: 'Amber', class: 'bg-amber-100 border-amber-300 text-amber-800' },
                                                                { name: 'Violet', class: 'bg-violet-100 border-violet-300 text-violet-800' },
                                                            ].map((c) => (
                                                                <button
                                                                    key={c.class}
                                                                    type="button"
                                                                    onClick={() => setActivityColor(c.class)}
                                                                    className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${c.class} ${activityColor === c.class ? 'ring-4 ring-primary-500 scale-110 shadow-lg z-10' : 'opacity-60 hover:opacity-100 border-transparent'}`}
                                                                >
                                                                    {activityColor === c.class && <span className="text-xl">✓</span>}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <CourseScheduleEditor sessions={courseSchedule} setSessions={setCourseSchedule} />
                                                </div>
                                            )}

                                            {activeTab === 'sugerencias' && (
                                                <div className="md:col-span-2">
                                                    <PollOptionsEditor
                                                        options={pollOptions}
                                                        setOptions={setPollOptions}
                                                        allowCustom={allowCustomSuggestions}
                                                        setAllowCustom={setAllowCustomSuggestions}
                                                    />
                                                </div>
                                            )}

                                            {activeTab === 'eventos' && (
                                                <div className="md:col-span-2">
                                                    <div className="flex items-center gap-3 bg-primary-50/50 p-4 rounded-xl border border-primary-100">
                                                        <input
                                                            type="checkbox"
                                                            id="hasReminder"
                                                            checked={hasReminder}
                                                            onChange={e => setHasReminder(e.target.checked)}
                                                            className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
                                                        />
                                                        <label htmlFor="hasReminder" className="text-sm font-bold text-primary-900">Publicar como un recordatorio destacado</label>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Imagen destacada</label>
                                                <div onClick={() => document.getElementById('file-upload')?.click()} className="mt-2 flex justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-10 cursor-pointer hover:bg-primary-50/30 hover:border-primary-300 transition-all relative group">
                                                    {previewUrl ? (
                                                        <div className="relative">
                                                            <img src={previewUrl} className="h-44 w-full object-cover rounded-xl shadow-lg" />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                                <PhotoIcon className="h-10 w-10 text-white" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-300 group-hover:text-primary-400 transition-colors" />
                                                            <p className="mt-2 text-sm text-gray-500">Haz clic para subir una imagen</p>
                                                        </div>
                                                    )}
                                                    <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-6 border-t bg-white sticky bottom-0">
                                            <button
                                                type="button"
                                                onClick={handleCloseAttempt}
                                                disabled={isSaving}
                                                className="px-4 py-2 border rounded-md font-medium text-gray-700 disabled:opacity-50"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="px-6 py-2 bg-primary-600 text-white rounded-md font-bold hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Guardando...
                                                    </>
                                                ) : 'Guardar'}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition show={showCloseConfirm} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setShowCloseConfirm(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
                                    <Dialog.Title as="h3" className="text-lg font-bold">¿Cerrar sin guardar?</Dialog.Title>
                                    <p className="mt-2 text-sm text-gray-500">Perderás los cambios realizados en esta actividad.</p>
                                    <div className="mt-6 flex justify-center gap-3">
                                        <button onClick={() => setShowCloseConfirm(false)} className="px-4 py-2 border rounded-xl font-medium hover:bg-gray-50 transition-colors">No, seguir editando</button>
                                        <button onClick={handleCloseModal} className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">Sí, cerrar</button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition show={showDeleteConfirm} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setShowDeleteConfirm(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
                                    <Dialog.Title as="h3" className="text-lg font-bold text-red-600">¿Eliminar actividad?</Dialog.Title>
                                    <p className="mt-2 text-sm text-gray-500">Esta acción no se puede deshacer y eliminará todos los datos asociados.</p>
                                    <div className="mt-6 flex justify-center gap-3">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={isSaving}
                                            className="px-4 py-2 border rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleDeleteConfirm}
                                            disabled={isSaving}
                                            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Eliminando...
                                                </>
                                            ) : 'Eliminar'}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Comment Preview Modal */}
            <Transition show={showCommentModal && !!editingItem} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setShowCommentModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="bg-white rounded-3xl max-w-2xl w-full relative shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                                    <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary-100 rounded-xl">
                                                <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-600" />
                                            </div>
                                            <div>
                                                <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">Propuestas y Comentarios</Dialog.Title>
                                                <p className="text-xs text-gray-500 font-medium">{editingItem?.title}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowCommentModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                                        {editingItem?.user_comments && editingItem.user_comments.length > 0 ? (
                                            editingItem.user_comments.map((comment, idx) => (
                                                <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 relative group hover:border-primary-200 transition-all">
                                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-100 rounded-full group-hover:bg-primary-500 transition-colors" />
                                                    <p className="text-gray-800 text-sm leading-relaxed italic">
                                                        "{comment.text}"
                                                    </p>
                                                    <div className="flex justify-between items-center pt-4 border-t border-gray-50 text-[10px] uppercase tracking-widest font-black">
                                                        <span className={comment.option === 'custom' ? 'text-primary-600 bg-primary-50 px-2 py-1 rounded' : 'text-gray-400'}>
                                                            {comment.option === 'custom' ? '💡 Propuesta Personalizada' : (comment.option ? `Voto: ${comment.option}` : 'Sin voto')}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            {new Date(comment.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-20 text-gray-400">
                                                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                                <p className="italic font-medium">No hay comentarios ni propuestas personalizadas para esta actividad.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 border-t bg-gray-50/50 flex justify-end">
                                        <button
                                            onClick={() => setShowCommentModal(false)}
                                            className="px-8 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
