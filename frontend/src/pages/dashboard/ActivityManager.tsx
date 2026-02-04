import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';
import getCroppedImg from '../../utils/cropImage';
import { API_BASE_URL } from '../../config';

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
}

const API_URL = API_BASE_URL;

export default function ActivityManager() {
    const [items, setItems] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Activity | null>(null);

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('taller');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Cropper States
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

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
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthError = () => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user_role');
        window.location.href = '/login';
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
                alert("Error al recortar la imagen");
            }
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setImageSrc(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            } else if (response.status === 401 || response.status === 403) {
                handleAuthError();
            } else {
                const error = await response.json();
                alert(error.detail || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving activity:', error);
            alert('Error al guardar');
        }
    };

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

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
            } else if (response.status === 401 || response.status === 403) {
                handleAuthError();
            } else {
                alert('Error al eliminar');
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
            alert('Error al eliminar');
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setTitle(item.title);
        setDescription(item.description || '');
        setType(item.type);
        setStartDate(item.start_date ? item.start_date.substring(0, 16) : '');
        setEndDate(item.end_date ? item.end_date.substring(0, 16) : '');
        setLocation(item.location || '');
        setPrice(item.price || '');

        setPreviewUrl(item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`) : null);
        setSelectedFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setTitle('');
        setDescription('');
        setType('taller');
        setStartDate('');
        setEndDate('');
        setLocation('');
        setPrice('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setImageSrc(null);
        setIsCropping(false);
    };

    const formatShortDate = (dateStr: string | null) => {
        if (!dateStr) return 'No especificada';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
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
                    <p className="mt-2 text-sm text-gray-700">Administra cursos temporales, talleres y eventos especiales.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 flex sm:flex-row gap-3 sm:flex-none">
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Añadir Actividad
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">Cargando...</div>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <div key={item.id} className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
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
                                        <span className="text-xs font-headers uppercase mt-2">{item.type}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 p-6">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${item.type === 'curso' ? 'bg-blue-100 text-blue-700' :
                                    item.type === 'taller' ? 'bg-purple-100 text-purple-700' :
                                        'bg-forest/10 text-forest'
                                    }`}>
                                    {item.type}
                                </span>
                                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                                <div className="mt-4 space-y-2 text-sm text-gray-500">
                                    <p className="flex items-center gap-2"><span className="font-medium text-gray-700">Inicio:</span> {formatShortDate(item.start_date)}</p>
                                    <p className="flex items-center gap-2 line-clamp-1"><span className="font-medium text-gray-700">Lugar:</span> {item.location || 'Centro Arunachala'}</p>
                                    <p className="flex items-center gap-2"><span className="font-medium text-gray-700">Precio:</span> {item.price || 'Consultar'}</p>
                                </div>
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
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">{editingItem ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500"><TrashIcon className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-6 overflow-y-auto max-h-[85vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Título *</label>
                                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                    <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo *</label>
                                    <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm">
                                        <option value="taller">Taller</option>
                                        <option value="curso">Curso</option>
                                        <option value="evento">Evento</option>
                                        <option value="retiro">Retiro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Precio</label>
                                    <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm" placeholder="Ej: 30€ o Gratuito" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha/Hora Inicio</label>
                                    <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha/Hora Fin</label>
                                    <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 p-3 border sm:text-sm" placeholder="Opcional. Por defecto Centro Arunachala" />
                                </div>

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
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700">Cancelar</button>
                                <button type="submit" className="rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700">Guardar Actividad</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
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
        </div>
    );
}
