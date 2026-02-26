import React, { useState, useEffect, useCallback } from 'react';
import { PhotoIcon, ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, TrashIcon, XMarkIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition, Combobox } from '@headlessui/react';
import { MagnifyingGlassIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';
import getCroppedImg from '../../utils/cropImage';
import { API_BASE_URL } from '../../config';
import { getImageUrl } from '../../utils/imageUtils';
import PageLoader from '../../components/PageLoader';
import ConfirmModal from '../../components/ConfirmModal';
import MantraControl from '../../components/dashboard/MantraControl';
import { useTranslation } from 'react-i18next';

interface Meditation {
    id: number;
    title: string;
    media_url?: string;
    slug?: string;
    translations?: {
        [key: string]: {
            title?: string;
        };
    };
}

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
    const { i18n } = useTranslation();

    // Meditations for background music selection
    const [meditations, setMeditations] = useState<Meditation[]>([]);
    const [meditationQuery, setMeditationQuery] = useState('');

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
        fetchMeditations();
    }, []);

    const fetchMeditations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/content?type=meditation&status=published`);
            if (response.ok) {
                const data = await response.json();
                setMeditations(data || []);
            }
        } catch (error) {
            console.error("Error fetching meditations:", error);
        }
    };

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
            setDeleteModalOpen(false);
        }
    };

    const handleMeditationSelect = async (meditation: Meditation) => {
        if (!meditation.media_url) {
            setMessage({ type: 'error', text: 'Esta meditación no tiene un archivo de audio asociado.' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const token = sessionStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('value', meditation.media_url);

            const response = await fetch(`${API_BASE_URL}/api/site-config/homepage_music_url`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                setConfigs(prev => ({ ...prev, homepage_music_url: meditation.media_url || null }));
                setMessage({ type: 'success', text: `Música de inicio actualizada: ${meditation.title}` });
            } else {
                setMessage({ type: 'error', text: 'Error al actualizar la música de fondo' });
            }
        } catch (error) {
            console.error("Error setting meditation as background music:", error);
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMeditations = meditationQuery === ''
        ? meditations
        : meditations.filter((m) => {
            const currentLang = i18n.language.split('-')[0];
            const title = m.translations?.[currentLang]?.title || m.title;
            return title.toLowerCase().includes(meditationQuery.toLowerCase());
        });

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

            {/* Multimedia Section: Background Music */}
            <div className="mt-12 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-8">
                <div className="flex items-center gap-3 mb-6">
                    <MusicalNoteIcon className="h-8 w-8 text-forest" />
                    <div>
                        <h2 className="text-xl font-headers text-gray-900">Música de Fondo (Página de Inicio)</h2>
                        <p className="text-sm text-gray-500">Esta canción sonará automáticamente al abrir la Home (Volumen 50%)</p>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="w-full">
                        {configs['homepage_music_url'] ? (
                            <div className="bg-bone/50 p-6 rounded-2xl flex flex-col gap-4 border border-forest/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-forest uppercase tracking-widest">Canción seleccionada:</span>
                                        <p className="text-sm text-bark font-medium truncate max-w-md">
                                            {(() => {
                                                const currentUrl = configs['homepage_music_url'];
                                                const meditation = meditations.find((m: Meditation) => m.media_url === currentUrl);
                                                if (meditation) {
                                                    const currentLang = i18n.language.split('-')[0];
                                                    return meditation.translations?.[currentLang]?.title || meditation.title;
                                                }
                                                return currentUrl?.split('/').pop() || 'Archivo subido';
                                            })()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteClick('homepage_music_url')}
                                        className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all"
                                        title="Eliminar música"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                <audio controls key={configs['homepage_music_url']} src={getImageUrl(configs['homepage_music_url'])} className="w-full h-10 accent-forest" />
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                                <MusicalNoteIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No hay música seleccionada</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Selector de Meditaciones */}
                        <div className="bg-bone/30 p-6 rounded-2xl border border-gray-100 italic">
                            <label className="block text-sm font-bold text-bark mb-4 uppercase tracking-wider">Elegir de Meditaciones Existentes</label>
                            <Combobox value={null} onChange={handleMeditationSelect}>
                                <div className="relative mt-1">
                                    <div className="relative w-full cursor-default overflow-hidden rounded-xl bg-white text-left border border-gray-200 focus-within:ring-2 focus-within:ring-forest focus-within:border-forest transition-all">
                                        <Combobox.Input
                                            className="w-full border-none py-3 pl-10 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                            displayValue={(m: any) => m?.title || ''}
                                            onChange={(event) => setMeditationQuery(event.target.value)}
                                            placeholder="Buscar meditación..."
                                        />
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </Combobox.Button>
                                    </div>
                                    <Transition
                                        as={React.Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                        afterLeave={() => setMeditationQuery('')}
                                    >
                                        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                            {filteredMeditations.length === 0 && meditationQuery !== '' ? (
                                                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                                    No se encontraron meditaciones.
                                                </div>
                                            ) : (
                                                filteredMeditations.map((meditation: Meditation) => {
                                                    const currentLang = i18n.language.split('-')[0];
                                                    const displayTitle = meditation.translations?.[currentLang]?.title || meditation.title;
                                                    return (
                                                        <Combobox.Option
                                                            key={meditation.id}
                                                            className={({ active }) =>
                                                                `relative cursor-default select-none py-3 pl-10 pr-4 ${active ? 'bg-forest text-white' : 'text-gray-900'
                                                                }`
                                                            }
                                                            value={meditation}
                                                        >
                                                            {({ selected, active }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                        {displayTitle}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-forest'}`}>
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Combobox.Option>
                                                    )
                                                })
                                            )}
                                        </Combobox.Options>
                                    </Transition>
                                </div>
                            </Combobox>
                            <p className="mt-3 text-xs text-gray-500">Busca y selecciona una de tus meditaciones ya publicadas.</p>
                        </div>

                        {/* Botón de Subida Directa */}
                        <div className="bg-bone/30 p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center min-h-[140px]">
                            <label className="block text-sm font-bold text-bark mb-4 uppercase tracking-wider">O Subir Archivo Nuevo</label>
                            <label className={`w-full text-center px-8 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg inline-block ${uploadingKey === 'homepage_music_url'
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-forest text-white hover:bg-matcha hover:-translate-y-1'
                                }`}>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="audio/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setUploadingKey('homepage_music_url');
                                            try {
                                                const token = sessionStorage.getItem('access_token');
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                const response = await fetch(`${API_BASE_URL}/api/site-config/upload/homepage_music_url`, {
                                                    method: 'POST',
                                                    headers: { 'Authorization': `Bearer ${token}` },
                                                    body: formData
                                                });
                                                if (response.ok) {
                                                    const data = await response.json();
                                                    setConfigs(prev => ({ ...prev, homepage_music_url: data.url }));
                                                    setMessage({ type: 'success', text: 'Música de fondo actualizada' });
                                                } else {
                                                    const errorData = await response.json().catch(() => ({}));
                                                    setMessage({ type: 'error', text: `Error al subir audio: ${errorData.detail || 'Error del servidor'}` });
                                                }
                                            } catch (err) {
                                                setMessage({ type: 'error', text: 'Error de conexión al subir audio' });
                                            } finally {
                                                setUploadingKey(null);
                                            }
                                        }
                                    }}
                                    disabled={!!uploadingKey}
                                />
                                {uploadingKey === 'homepage_music_url' ? 'Subiendo...' : 'Seleccionar Canción'}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <MantraControl />

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
