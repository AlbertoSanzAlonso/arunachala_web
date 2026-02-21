import React, { useState, useEffect, useCallback } from 'react';
import { PhotoIcon, ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';
import getCroppedImg from '../../utils/cropImage';
import { API_BASE_URL } from '../../config';
import { getImageUrl } from '../../utils/imageUtils';
import PageLoader from '../../components/PageLoader';
import ConfirmModal from '../../components/ConfirmModal';

interface CustomizableImage {
    key: string;
    label: string;
    description: string;
    recommendedSize: string;
}

const CUSTOMIZABLE_IMAGES: CustomizableImage[] = [
    {
        key: 'logo_url',
        label: 'Logo del Centro',
        description: 'El logo principal que aparece en la cabecera y el pie de página.',
        recommendedSize: '500x500px (Transparente recomendado)'
    },
    {
        key: 'chatbot_avatar_url',
        label: 'Avatar del Chatbot',
        description: 'La imagen que representa al asistente virtual en la ventana de chat.',
        recommendedSize: '200x200px'
    },
    {
        key: 'about_hero_image',
        label: 'Foto de Quienes Somos',
        description: 'Esta imagen aparece en la parte superior de la página "Quienes Somos".',
        recommendedSize: '800x800px (Cuadrada)'
    },
    {
        key: 'yoga_hero_image',
        label: 'Foto Principal de Yoga',
        description: 'Esta imagen es el fondo de la sección principal de la página de Yoga.',
        recommendedSize: '1920x1080px'
    },
    {
        key: 'therapies_hero_image',
        label: 'Foto Principal de Terapias',
        description: 'Esta imagen es el fondo de la sección principal de la página de Terapias y Masajes.',
        recommendedSize: '1920x1080px'
    },
    {
        key: 'our_space_main_image',
        label: 'Foto Principal de Nuestro Espacio',
        description: 'La imagen principal que se muestra en la sección "Nuestro Espacio".',
        recommendedSize: '1000x800px'
    }
];

export default function SiteCustomization() {
    const [configs, setConfigs] = useState<Record<string, string | null>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingKey, setUploadingKey] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

    // Image CROP State
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [aspect, setAspect] = useState(1);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/site-config`);
            if (response.ok) {
                const data = await response.json();
                const configMap: Record<string, string | null> = {};
                data.forEach((item: any) => {
                    configMap[item.key] = item.value;
                });
                setConfigs(configMap);
            }
        } catch (error) {
            console.error("Error fetching site config:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onCropComplete = useCallback((_area: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleFileSelect = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setActiveKey(key);
            // Dynamic aspect ratio based on item key
            if (key.includes('hero')) setAspect(16 / 9);
            else setAspect(1);

            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        e.target.value = '';
    };

    const handleCropSave = async () => {
        if (!imageToCrop || !croppedAreaPixels || !activeKey) return;

        setUploadingKey(activeKey);
        setCropModalOpen(false);
        setMessage(null);

        try {
            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            if (!croppedBlob) throw new Error("Could not crop image");

            const token = sessionStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('file', croppedBlob, 'site_config.webp');

            const response = await fetch(`${API_BASE_URL}/api/site-config/upload/${activeKey}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setConfigs(prev => ({ ...prev, [activeKey]: data.url }));
                setMessage({ type: 'success', text: 'Imagen personalizada actualizada correctamente' });
            } else {
                setMessage({ type: 'error', text: 'Error al subir la imagen procesada' });
            }
        } catch (error) {
            console.error("Error cropping/uploading:", error);
            setMessage({ type: 'error', text: 'Error al procesar la imagen' });
        } finally {
            setUploadingKey(null);
            setImageToCrop(null);
            setActiveKey(null);
        }
    };

    const handleDeleteClick = (key: string) => {
        setKeyToDelete(key);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!keyToDelete) return;

        setMessage(null);
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/site-config/${keyToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setConfigs(prev => ({ ...prev, [keyToDelete]: null }));
                setMessage({ type: 'success', text: 'Imagen personalizada eliminada. Se usará la imagen por defecto.' });
            } else {
                setMessage({ type: 'error', text: 'Error al eliminar la imagen' });
            }
        } catch (error) {
            console.error("Error deleting image:", error);
            setMessage({ type: 'error', text: 'Error de conexión al eliminar la imagen' });
        } finally {
            setKeyToDelete(null);
        }
    };

    if (isLoading) return <PageLoader />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {uploadingKey && <PageLoader />}
            <div className="sm:flex sm:items-center mb-8">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900 font-headers">Personalizar Sitio Web</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Gestiona las imágenes principales de las diferentes secciones de la web.
                    </p>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-md flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {CUSTOMIZABLE_IMAGES.map((item) => (
                    <div key={item.key} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group/card">
                        <div className="aspect-video bg-gray-100 relative group overflow-hidden">
                            {configs[item.key] ? (
                                <>
                                    <img
                                        src={getImageUrl(configs[item.key])}
                                        alt={item.label}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDeleteClick(item.key);
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-700"
                                        title="Eliminar personalización"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4">
                                    <PhotoIcon className="h-12 w-12 mb-2" />
                                    <p className="text-xs text-center italic">Sin imagen personalizada (se usará la predeterminada)</p>
                                </div>
                            )}

                            {uploadingKey === item.key && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                                    <ArrowPathIcon className="h-8 w-8 text-forest animate-spin" />
                                </div>
                            )}

                            <label className="absolute inset-0 cursor-pointer group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(item.key, e)}
                                    disabled={!!uploadingKey}
                                />
                                <span className="sr-only">Cambiar imagen</span>
                                <div className="bg-white/90 px-4 py-2 rounded-full text-sm font-semibold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                    {configs[item.key] ? 'Cambiar Imagen' : 'Subir Imagen'}
                                </div>
                            </label>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-lg font-medium text-bark mb-1 font-headers">{item.label}</h3>
                            <p className="text-sm text-gray-500 mb-4 flex-1">{item.description}</p>
                            <div className="pt-4 border-t border-gray-100">
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tamaño recomendado:</span>
                                <p className="text-sm font-semibold text-bark">{item.recommendedSize}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmModal
                open={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setKeyToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Eliminar imagen personalizada"
                message="¿Estás seguro de que quieres eliminar esta imagen personalizada? Se volverá a mostrar la imagen original por defecto en el sitio web."
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDangerous={true}
            />

            {/* CROP MODAL */}
            <Transition.Root show={cropModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={setCropModalOpen}>
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={React.Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all w-full max-w-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <Dialog.Title as="h3" className="text-xl font-headers text-bark">
                                            Ajustar Imagen
                                        </Dialog.Title>
                                        <button onClick={() => setCropModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="relative h-96 w-full bg-gray-100 rounded-xl overflow-hidden mb-6">
                                        {imageToCrop && (
                                            <Cropper
                                                image={imageToCrop}
                                                crop={crop}
                                                zoom={zoom}
                                                aspect={aspect}
                                                onCropChange={setCrop}
                                                onCropComplete={onCropComplete}
                                                onZoomChange={setZoom}
                                            />
                                        )}
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Zoom</label>
                                        <input
                                            type="range"
                                            value={zoom}
                                            min={1}
                                            max={3}
                                            step={0.1}
                                            aria-labelledby="Zoom"
                                            onChange={(e) => setZoom(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-forest"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setCropModalOpen(false)}
                                            className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCropSave}
                                            className="px-8 py-2.5 rounded-xl bg-forest text-white text-sm font-bold hover:bg-matcha transition-all shadow-lg"
                                        >
                                            Guardar y Aplicar
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}
