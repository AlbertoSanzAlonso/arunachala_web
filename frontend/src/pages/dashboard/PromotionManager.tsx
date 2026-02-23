import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, TicketIcon, EyeIcon } from '@heroicons/react/24/outline';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';
import getCroppedImg from '../../utils/cropImage';
import { API_BASE_URL } from '../../config';
import { getImageUrl } from '../../utils/imageUtils';
import PageLoader from '../../components/PageLoader';

interface Promotion {
    id: number;
    title: string;
    description: string | null;
    discount_code: string | null;
    discount_percentage: number | null;
    image_url: string | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    translations: any | null;
}

export default function PromotionManager() {
    const [items, setItems] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Promotion | null>(null);

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isActive, setIsActive] = useState(true);
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
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/promotions/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching promotions:', error);
        } finally {
            setIsLoading(false);
        }
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
            setIsSaving(true);
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
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const token = sessionStorage.getItem('access_token');

        try {
            // If we have a file, upload it first to get the URL
            let finalImageUrl = editingItem?.image_url || null;
            if (selectedFile) {
                const formData = new FormData();
                if (selectedFile instanceof Blob && !(selectedFile instanceof File)) {
                    formData.append('file', selectedFile, 'promo.webp');
                } else {
                    formData.append('file', selectedFile);
                }

                const uploadRes = await fetch(`${API_BASE_URL}/api/upload/image?folder=general`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    finalImageUrl = uploadData.url;
                }
            }

            const promoData = {
                title,
                description,
                discount_code: discountCode || null,
                discount_percentage: discountPercentage ? parseInt(discountPercentage) : null,
                image_url: finalImageUrl,
                start_date: startDate ? new Date(startDate).toISOString() : null,
                end_date: endDate ? new Date(endDate).toISOString() : null,
                is_active: isActive
            };

            const url = editingItem
                ? `${API_BASE_URL}/api/promotions/${editingItem.id}`
                : `${API_BASE_URL}/api/promotions/`;

            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(promoData)
            });

            if (response.ok) {
                await fetchItems();
                handleCloseModal();
            } else {
                const error = await response.json();
                alert(error.detail || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving promotion:', error);
            alert('Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (item: Promotion) => {
        setEditingItem(item);
        setTitle(item.title);
        setDescription(item.description || '');
        setDiscountCode(item.discount_code || '');
        setDiscountPercentage(item.discount_percentage?.toString() || '');
        setStartDate(item.start_date ? new Date(item.start_date).toISOString().slice(0, 16) : '');
        setEndDate(item.end_date ? new Date(item.end_date).toISOString().slice(0, 16) : '');
        setIsActive(item.is_active);
        setPreviewUrl(getImageUrl(item.image_url));
        setShowModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        setIsSaving(true);
        const token = sessionStorage.getItem('access_token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/promotions/${itemToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                await fetchItems();
                setShowDeleteConfirm(false);
                setItemToDelete(null);
            }
        } catch (error) {
            console.error('Error deleting promotion:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setTitle('');
        setDescription('');
        setDiscountCode('');
        setDiscountPercentage('');
        setStartDate('');
        setEndDate('');
        setIsActive(true);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    return (
        <div className="space-y-6">
            {isSaving && <PageLoader />}

            {/* Cropper Modal */}
            {isCropping && imageSrc && (
                <div className="fixed inset-0 z-[70] bg-black/80 flex flex-col items-center justify-center p-4">
                    <div className="relative w-full max-w-2xl h-[400px] bg-gray-900 rounded-2xl overflow-hidden">
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
                    <div className="mt-4 w-full max-w-md px-8">
                        <label className="text-white text-xs mb-2 block">Zoom</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button onClick={() => setIsCropping(false)} className="px-6 py-2 bg-white text-gray-800 rounded-xl font-bold">Cancelar</button>
                        <button onClick={handleCropSave} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Guardar</button>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Promociones</h1>
                    <p className="text-sm text-gray-500">Gestiona las ofertas y códigos de descuento para la web.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 transition-all"
                >
                    <PlusIcon className="h-5 w-5" />
                    Nueva Promoción
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="h-40 bg-gray-50 relative">
                                {item.image_url ? (
                                    <img src={getImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><TicketIcon className="h-12 w-12" /></div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                                        {item.is_active ? 'Activa' : 'Borrador'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1">
                                <h3 className="font-bold text-gray-900">{item.title}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    {item.discount_code && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-mono font-bold tracking-wider">{item.discount_code}</span>}
                                    {item.discount_percentage && <span className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-bold">-{item.discount_percentage}%</span>}
                                </div>
                            </div>
                            <div className="flex border-t border-gray-100 bg-gray-50/50">
                                <button onClick={() => handleEdit(item)} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-white flex items-center justify-center gap-2 transition-colors"><PencilIcon className="h-4 w-4" /> Editar</button>
                                <button onClick={() => { setItemToDelete(item.id); setShowDeleteConfirm(true); }} className="flex-1 py-3 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"><TrashIcon className="h-4 w-4" /> Eliminar</button>
                                <a
                                    href="/promociones"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 text-sm font-bold text-blue-500 hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <EyeIcon className="h-4 w-4" /> Ver
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">{editingItem ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"> &times; </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Título *</label>
                                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 p-3 border" placeholder="Ej: Oferta de Invierno" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 p-3 border" placeholder="Detalles de la promoción..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Código (Opcional)</label>
                                    <input type="text" value={discountCode} onChange={e => setDiscountCode(e.target.value.toUpperCase())} className="w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 p-3 border font-mono" placeholder="YOGA20" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Descuento % (Opcional)</label>
                                    <input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} className="w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 p-3 border" placeholder="20" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Inicio <span className="text-gray-400 font-normal text-xs">(Opcional)</span></label>
                                    <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 p-3 border" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-bold text-gray-700">Fecha Fin</label>
                                        <button type="button" onClick={() => setEndDate('')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Indefinida (Borrar)</button>
                                    </div>
                                    <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 p-3 border" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Estado de la promoción</p>
                                    <p className="text-xs text-gray-500">{isActive ? 'Visible en la web si está en fecha' : 'Borrador oculto'}</p>
                                </div>
                                <button type="button" onClick={() => setIsActive(!isActive)} className={`w-12 h-6 rounded-full transition-all relative ${isActive ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 text-center">Imagen Promocional</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 hover:border-indigo-300 transition-colors group relative overflow-hidden flex flex-col items-center">
                                    {previewUrl ? (
                                        <div className="relative w-full">
                                            <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded-2xl" />
                                            <button type="button" onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600"><TrashIcon className="h-4 w-4" /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <PhotoIcon className="h-12 w-12 text-gray-300 group-hover:text-indigo-300 transition-colors mb-2" />
                                            <p className="text-sm text-gray-500">Haz clic para subir o arrastra una imagen</p>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={handleCloseModal} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-100 transition-all active:scale-95"> {isSaving ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'} </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto"><TrashIcon className="h-10 w-10 text-red-500" /></div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">¿Eliminar promoción?</h3>
                            <p className="text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-2xl bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors">Cancelar</button>
                            <button onClick={handleDeleteConfirm} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-100 transition-all active:scale-95">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
