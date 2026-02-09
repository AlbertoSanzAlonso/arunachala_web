import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';
import getCroppedImg from '../../utils/cropImage';
import { API_BASE_URL } from '../../config';
import lotusImage from '../../assets/images/lotus_flower.png';
import PageLoader from '../../components/PageLoader';

interface TreatmentType {
    id: number;
    name: string;
    excerpt: string | null;
    description: string | null;
    benefits: string | null;
    duration_min: number | null;
    price: string | null;
    image_url: string | null;
    is_active: boolean;
}

const API_URL = API_BASE_URL;

export default function TreatmentsManager() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize tab from URL
    const initialTab = (searchParams.get('tab') as 'massages' | 'therapies') || 'massages';
    const [activeTab, setActiveTab] = useState<'massages' | 'therapies'>(initialTab);

    // Sync URL when tab changes
    useEffect(() => {
        setSearchParams(prev => {
            prev.set('tab', activeTab);
            return prev;
        }, { replace: true });
    }, [activeTab, setSearchParams]);

    const [items, setItems] = useState<TreatmentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<TreatmentType | null>(null);

    // Form States
    const [name, setName] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [description, setDescription] = useState('');
    const [benefits, setBenefits] = useState('');
    const [durationMin, setDurationMin] = useState('');
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const endpoint = activeTab === 'massages' ? 'massages' : 'therapies';
            const response = await fetch(`${API_URL}/api/treatments/${endpoint}`);
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
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
        // Reset input value if needed, effectively cancelling upload
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const token = sessionStorage.getItem('access_token');
        const endpoint = activeTab === 'massages' ? 'massages' : 'therapies';

        try {
            const url = editingItem
                ? `${API_URL}/api/treatments/${endpoint}/${editingItem.id}`
                : `${API_URL}/api/treatments/${endpoint}`;

            const method = editingItem ? 'PUT' : 'POST';

            const formData = new FormData();
            formData.append('name', name);
            if (excerpt) formData.append('excerpt', excerpt);
            if (description) formData.append('description', description);
            if (benefits) formData.append('benefits', benefits);

            // Handle duration: send 0 if empty to signal clearing
            if (durationMin && durationMin.trim() !== '') {
                formData.append('duration_min', durationMin);
            } else {
                formData.append('duration_min', '0');
            }
            if (price) {
                // Ensure price has € symbol
                const finalPrice = price.includes('€') ? price : `${price}€`;
                formData.append('price', finalPrice);
            }
            // If editing and cleared, send empty? The backend expects int or None.
            // If we send nothing, and it's PUT, it might keep old value if DB logic checks for None.
            // However, FormData entries are strings. We need to handle clearing.
            // Our backend logic: `if duration_min is not None: db_massage.duration_min = duration_min`
            // If we don't send it, it won't update.
            // To clear it, we might need to send a special value or handle optional better.
            // For now, let's assume empty string means don't update or set to null?
            // The backend Pydantic model `duration_min: Optional[int] = Form(None)`.

            if (selectedFile) {
                // If it's a blob from cropper, we need to correct the filename
                if (selectedFile instanceof Blob && !(selectedFile instanceof File)) {
                    formData.append('image', selectedFile, 'image.webp');
                } else {
                    formData.append('image', selectedFile);
                }
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type header for FormData, browser does it automatically
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
            console.error('Error saving item:', error);
            alert('Error al guardar');
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
        const endpoint = activeTab === 'massages' ? 'massages' : 'therapies';

        try {
            const response = await fetch(`${API_URL}/api/treatments/${endpoint}/${itemToDelete}`, {
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
            console.error('Error deleting item:', error);
            alert('Error al eliminar');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (item: TreatmentType) => {
        setEditingItem(item);
        setName(item.name);
        setExcerpt(item.excerpt || '');
        setDescription(item.description || '');
        setBenefits(item.benefits || '');
        setPrice(item.price || '');

        // Handle duration
        if (item.duration_min !== null && item.duration_min !== undefined) {
            setDurationMin(item.duration_min.toString());
        } else {
            setDurationMin('');
        }

        setPreviewUrl(item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`) : null);
        setSelectedFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setName('');
        setExcerpt('');
        setDescription('');
        setBenefits('');
        setDurationMin('');
        setPrice('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setImageSrc(null);
        setIsCropping(false);
    };

    return (
        <div>
            {isSaving && <PageLoader />}

            {/* Cropper Modal */}
            {isCropping && imageSrc && (
                <div className="fixed inset-0 z-[70] bg-black bg-opacity-80 flex flex-col items-center justify-center p-4">
                    <div className="relative w-full max-w-2xl h-[400px] bg-gray-900 rounded-lg overflow-hidden">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={4 / 3} // Aspect ratio for cards roughly
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div className="mt-4 flex gap-4">
                        <div className="flex flex-col gap-2 w-64">
                            <label className="text-white text-sm">Zoom</label>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={handleCropCancel}
                            className="px-6 py-2 bg-white text-gray-800 rounded-md font-bold hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCropSave}
                            className="px-6 py-2 bg-primary-600 text-white rounded-md font-bold hover:bg-primary-500"
                        >
                            Recortar y Guardar
                        </button>
                    </div>
                </div>
            )}

            <div className="sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">
                        Gestión de Tratamientos
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Administra los tipos de masajes y terapias disponibles.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 flex flex-col sm:flex-row gap-3 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Crear Nuevo
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('massages')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === 'massages'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        Masajes
                    </button>
                    <button
                        onClick={() => setActiveTab('therapies')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === 'therapies'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        Terapias
                    </button>
                </nav>
            </div>

            {isLoading ? (
                <div className="text-center py-12">Cargando...</div>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <div key={item.id} className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-32 w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src={lotusImage}
                                        alt="Placeholder"
                                        className="h-16 opacity-30"
                                    />
                                )}
                            </div>
                            <div className="flex-1 p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                </div>
                                <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                                    {item.excerpt}
                                </p>
                                {item.duration_min ? (
                                    <p className="mt-2 text-xs font-medium text-gray-500">
                                        Duración: {item.duration_min} min
                                    </p>
                                ) : (
                                    <p className="mt-2 text-xs font-medium text-gray-400 italic">
                                        Duración variable / No especificada
                                    </p>
                                )}
                                {item.price && (
                                    <p className="mt-1 text-sm font-bold text-primary-600 font-sans">
                                        Precio: {item.price.includes('€') ? item.price : `${item.price}€`}
                                    </p>
                                )}
                            </div>
                            <div className="flex border-t border-gray-200 divide-x divide-gray-200">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <PencilIcon className="h-4 w-4" /> Editar
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(item.id)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                                >
                                    <TrashIcon className="h-4 w-4" /> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingItem ? 'Editar' : 'Nuevo'} {activeTab === 'massages' ? 'Masaje' : 'Terapia'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-6 overflow-y-auto max-h-[80vh]">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                        placeholder="Ej: Masaje Relajante"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Extracto (Para miniatura)</label>
                                    <textarea
                                        rows={2}
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                        placeholder="Breve descripción que aparecerá en la tarjeta..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Descripción Completa</label>
                                    <textarea
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                        placeholder="Descripción detallada que se verá al abrir..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Beneficios</label>
                                    <textarea
                                        rows={3}
                                        value={benefits}
                                        onChange={(e) => setBenefits(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                        placeholder="Beneficio 1, Beneficio 2..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duración (min) - <span className="text-gray-400 font-normal">Opcional</span></label>
                                    <input
                                        type="number"
                                        value={durationMin}
                                        onChange={(e) => setDurationMin(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                        placeholder="Opcional. Ej: 60"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Precio (Opcional)</label>
                                    <div className="relative rounded-md shadow-sm mt-1">
                                        <input
                                            type="number"
                                            value={price.replace('€', '').trim()}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 pr-12 focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                            placeholder="50"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-gray-500 sm:text-sm">€</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Imagen</label>
                                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                                        <div className="text-center">
                                            {previewUrl ? (
                                                <div className="relative mb-4">
                                                    <img src={previewUrl} alt="Preview" className="mx-auto h-48 object-cover rounded-lg" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedFile(null);
                                                            setPreviewUrl(null);
                                                        }}
                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 -mt-2 -mr-2 shadow-sm hover:bg-red-600"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                            )}

                                            <div className="mt-4 flex flex-col items-center gap-2 text-sm leading-6 text-gray-600">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="relative cursor-pointer rounded-md bg-primary-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2"
                                                >
                                                    <span>Sube una imagen</span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                    />
                                                </label>
                                                <p>o arrastra y suelta</p>
                                            </div>
                                            <p className="text-xs leading-5 text-gray-600">PNG, JPG, WEBP hasta 5MB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-white pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 shadow-sm disabled:opacity-50"
                                >
                                    {isSaving ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear')}
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
                                ¿Estás seguro de que quieres eliminar este elemento?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setItemToDelete(null);
                                    }}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteConfirm}
                                    disabled={isSaving}
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isSaving ? 'Eliminando...' : 'Eliminar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
