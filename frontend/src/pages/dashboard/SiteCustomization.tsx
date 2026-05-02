import React, { useState, useEffect } from 'react';
import { PhotoIcon, ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, TrashIcon, XMarkIcon, MusicalNoteIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { Transition, Combobox } from '@headlessui/react';
import { MagnifyingGlassIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { API_BASE_URL } from '../../config';
import { getImageUrl } from '../../utils/imageUtils';
import PageLoader from '../../components/PageLoader';
import ConfirmModal from '../../components/ConfirmModal';
import CropModal from '../../components/CropModal';
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
    aspectRatio?: number;
}

const CUSTOMIZABLE_IMAGES: CustomizableImage[] = [

    {
        key: 'about_hero_image',
        label: 'Foto de Quienes Somos',
        description: 'Esta imagen aparece en la parte superior de la página "Quienes Somos".',
        recommendedSize: '800x800px (Cuadrada)',
        aspectRatio: 1
    },
    {
        key: 'yoga_hero_image',
        label: 'Foto Principal de Yoga',
        description: 'Esta imagen es el fondo de la sección principal de la página de Yoga.',
        recommendedSize: '1920x1080px',
        aspectRatio: 16 / 9
    },
    {
        key: 'therapies_hero_image',
        label: 'Foto Principal de Terapias',
        description: 'Esta imagen es el fondo de la sección principal de la página de Terapias y Masajes.',
        recommendedSize: '1920x1080px',
        aspectRatio: 16 / 9
    },
    {
        key: 'our_space_main_image',
        label: 'Foto Principal de Nuestro Espacio',
        description: 'La imagen principal que se muestra en la sección "Nuestro Espacio".',
        recommendedSize: '1000x800px',
        aspectRatio: 5 / 4
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
    const [aspect, setAspect] = useState<number | undefined>(undefined);

    // Background music - staged upload state
    const [includeInMeditations, setIncludeInMeditations] = useState(false);
    const [meditationTitle, setMeditationTitle] = useState('');
    const [meditationDescription, setMeditationDescription] = useState('');
    const [meditationThumb, setMeditationThumb] = useState<File | null>(null);
    const [meditationThumbPreview, setMeditationThumbPreview] = useState<string | null>(null);
    const [pendingAudioFile, setPendingAudioFile] = useState<File | null>(null);  // staged audio file
    const [musicUploadMessage, setMusicUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

    const handleFileSelect = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setActiveKey(key);
            const item = CUSTOMIZABLE_IMAGES.find(i => i.key === key);
            setAspect(item?.aspectRatio);

            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleCropSave = async (croppedBlob: Blob) => {
        if (!activeKey) return;

        setUploadingKey(activeKey);
        setCropModalOpen(false);
        setMessage(null);

        try {
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
            console.error("Error uploading:", error);
            setMessage({ type: 'error', text: 'Error al subir la imagen' });
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
                if (keyToDelete === 'homepage_music_url') {
                    setMessage({ type: 'success', text: 'Música de fondo eliminada. La página de inicio quedará en silencio.' });
                } else {
                    setMessage({ type: 'success', text: 'Imagen personalizada eliminada. No se mostrará ninguna imagen.' });
                }
            } else {
                setMessage({ type: 'error', text: 'Error al eliminar' });
            }
        } catch (error) {
            console.error("Error deleting:", error);
            setMessage({ type: 'error', text: 'Error de conexión al eliminar' });
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

    // Handle audio file selection (staged — doesn't upload until button click)
    const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingAudioFile(file);
            setMusicUploadMessage(null);
        }
        e.target.value = '';
    };

    // Handle thumbnail image selection with preview
    const handleThumbSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMeditationThumb(file);
            const reader = new FileReader();
            reader.onload = () => setMeditationThumbPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // Execute the actual upload when the user clicks "Subir"
    const handleMusicUpload = async () => {
        if (!pendingAudioFile) return;
        setUploadingKey('homepage_music_url');
        setMusicUploadMessage(null);

        try {
            const token = sessionStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('file', pendingAudioFile);
            formData.append('create_meditation', includeInMeditations.toString());
            if (includeInMeditations) {
                if (meditationTitle) formData.append('meditation_title', meditationTitle);
                if (meditationDescription) formData.append('meditation_description', meditationDescription);
                if (meditationThumb) formData.append('meditation_thumbnail', meditationThumb);
            }

            const response = await fetch(`${API_BASE_URL}/api/site-config/upload/homepage_music_url`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setConfigs(prev => ({ ...prev, homepage_music_url: data.url }));
                setMusicUploadMessage({
                    type: 'success',
                    text: includeInMeditations
                        ? '✅ Música de fondo actualizada y añadida a meditaciones'
                        : '✅ Música de fondo actualizada correctamente'
                });
                // Reset staged state
                setPendingAudioFile(null);
                setMeditationThumbPreview(null);
                if (includeInMeditations) {
                    fetchMeditations();
                    setMeditationTitle('');
                    setMeditationDescription('');
                    setMeditationThumb(null);
                    setIncludeInMeditations(false);
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                setMusicUploadMessage({ type: 'error', text: `Error al subir audio: ${errorData.detail || 'Error del servidor'}` });
            }
        } catch (err) {
            setMusicUploadMessage({ type: 'error', text: 'Error de conexión al subir audio' });
        } finally {
            setUploadingKey(null);
        }
    };

    const filteredMeditations = meditationQuery === ''
        ? meditations
        : meditations.filter((m) => {
            const currentLang = i18n.language.split('-')[0];
            const title = m.translations?.[currentLang]?.title || m.title;
            return title.toLowerCase().includes(meditationQuery.toLowerCase());
        });

    const logoSrc = configs['logo_url'] ? getImageUrl(configs['logo_url']) : '/logo_icon.webp';

    if (isLoading) return <PageLoader />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {uploadingKey && uploadingKey !== 'homepage_music_url' && <PageLoader />}
            <MantraControl />

            {message && (
                <div className={`mt-8 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
                    <p className="text-sm font-medium">{message.text}</p>
                    <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="mt-12 sm:flex sm:items-center mb-8">
                <div className="sm:flex-auto">
                    <h2 className="text-xl font-semibold leading-6 text-gray-900 font-headers">Imágenes del Sitio</h2>
                    <p className="mt-2 text-sm text-gray-700">
                        Gestiona las imágenes principales de las diferentes secciones de la web.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {CUSTOMIZABLE_IMAGES.map((item) => (
                    <div key={item.key} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group/card">
                        <div className="aspect-video bg-gray-100 relative group overflow-hidden">
                            {configs[item.key] ? (
                                <>
                                    <img
                                        src={getImageUrl(configs[item.key])}
                                        alt={item.label}
                                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setActiveKey(item.key);
                                            setAspect(item.aspectRatio);
                                            setImageToCrop(getImageUrl(configs[item.key]));
                                            setCropModalOpen(true);
                                        }}
                                        title="Haz clic para volver a recortar esta imagen"
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
                                    <p className="text-xs text-center italic text-gray-400">Sin imagen (no se mostrará imagen en la web)</p>
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
                        <p className="text-sm text-gray-500">Esta canción sonará automáticamente al abrir la Home (Volumen 5%)</p>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Current active music */}
                    <div className="w-full">
                        {configs['homepage_music_url'] ? (
                            <div className="bg-bone/50 p-6 rounded-2xl flex flex-col gap-4 border border-forest/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="h-10 w-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                            <img
                                                src={logoSrc}
                                                alt="Logo"
                                                className="h-8 w-8 object-contain"
                                                onError={(e) => { e.currentTarget.src = '/logo_icon.webp'; }}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-black text-forest uppercase tracking-widest block mb-0.5">Canción activa</span>
                                            <p className="text-sm text-bark font-bold truncate max-w-xs sm:max-w-md">
                                                {(() => {
                                                    const currentUrl = configs['homepage_music_url'];
                                                    const meditation = meditations.find((m: Meditation) => {
                                                        const normalizeUrl = (u: string) => u ? u.replace(API_BASE_URL, '').split('?')[0].replace(/\/+$/, '') : '';
                                                        return normalizeUrl(m.media_url || '') === normalizeUrl(currentUrl || '') && currentUrl !== null;
                                                    });
                                                    if (meditation) {
                                                        const currentLang = i18n.language.split('-')[0];
                                                        return meditation.translations?.[currentLang]?.title || meditation.title;
                                                    }
                                                    return currentUrl?.split('/').pop()?.replace(/-[a-f0-9]+\.(mp3|ogg|wav|flac|aac)$/, (m, ext) => `.${ext}`) || 'Archivo de audio';
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Always-visible delete button */}
                                    <button
                                        onClick={() => handleDeleteClick('homepage_music_url')}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-red-500 hover:text-white hover:bg-red-500 rounded-xl border border-red-200 hover:border-red-500 transition-all"
                                        title="Eliminar música de fondo"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        <span className="hidden sm:inline">Eliminar</span>
                                    </button>
                                </div>
                                <audio controls key={configs['homepage_music_url']} src={getImageUrl(configs['homepage_music_url'])} className="w-full h-10 accent-forest" />
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                                <MusicalNoteIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No hay música de fondo activa — la página de inicio estará en silencio</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Selector de Meditaciones Existentes */}
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
                                        <Combobox.Options className="absolute mt-1 max-h-80 w-full overflow-y-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 overflow-x-hidden">
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

                        {/* Subida de Archivo Nuevo — flujo en dos pasos */}
                        <div className="bg-bone/30 p-6 rounded-2xl border border-gray-100 flex flex-col gap-5">
                            <label className="block text-sm font-bold text-bark uppercase tracking-wider">O Subir Archivo Nuevo</label>

                            {/* Step 1: Select audio */}
                            {!pendingAudioFile ? (
                                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-forest hover:bg-forest/5 transition-all group">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="audio/*"
                                        onChange={handleAudioFileSelect}
                                    />
                                    <MusicalNoteIcon className="h-10 w-10 text-gray-300 group-hover:text-forest transition-colors" />
                                    <span className="text-sm font-semibold text-gray-500 group-hover:text-forest transition-colors text-center">
                                        Haz click para seleccionar un archivo de audio
                                    </span>
                                    <span className="text-xs text-gray-400">MP3, OGG, WAV, FLAC, AAC...</span>
                                </label>
                            ) : (
                                /* Step 2: Configure and upload */
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    {/* Audio preview */}
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                                        <div className="w-10 h-10 bg-forest/10 rounded-lg flex items-center justify-center shrink-0">
                                            <MusicalNoteIcon className="h-5 w-5 text-forest" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-bark truncate">{pendingAudioFile.name}</p>
                                            <p className="text-xs text-gray-400">{(pendingAudioFile.size / 1024 / 1024).toFixed(1)} MB</p>
                                        </div>
                                        <button
                                            onClick={() => { setPendingAudioFile(null); setMusicUploadMessage(null); }}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            title="Cambiar archivo"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Include in meditations toggle */}
                                    <div className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-100">
                                        <input
                                            type="checkbox"
                                            id="createMeditation"
                                            checked={includeInMeditations}
                                            onChange={(e) => setIncludeInMeditations(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-forest focus:ring-forest"
                                        />
                                        <label htmlFor="createMeditation" className="text-xs text-gray-700 cursor-pointer font-medium">
                                            ¿Añadir también a la lista pública de meditaciones?
                                        </label>
                                    </div>

                                    {/* Meditation metadata fields */}
                                    {includeInMeditations && (
                                        <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-forest/60">Datos de la meditación</p>
                                            <input
                                                type="text"
                                                placeholder="Título de la meditación (ej: Relajación Nocturna)"
                                                value={meditationTitle}
                                                onChange={(e) => setMeditationTitle(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-forest focus:border-forest"
                                            />
                                            <textarea
                                                placeholder="Descripción corta (opcional)"
                                                value={meditationDescription}
                                                onChange={(e) => setMeditationDescription(e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-forest focus:border-forest resize-none"
                                            />
                                            {/* Thumbnail picker with preview */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase block">Imagen de portada:</label>
                                                {meditationThumbPreview ? (
                                                    <div className="relative w-24 h-24">
                                                        <img src={meditationThumbPreview} alt="preview" className="w-24 h-24 rounded-xl object-cover border border-gray-200" />
                                                        <button
                                                            onClick={() => { setMeditationThumb(null); setMeditationThumbPreview(null); }}
                                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                        >
                                                            <XMarkIcon className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="flex items-center gap-2 cursor-pointer text-xs text-forest hover:text-matcha transition-colors">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleThumbSelect}
                                                        />
                                                        <PhotoIcon className="h-5 w-5" />
                                                        <span className="font-semibold">Seleccionar imagen</span>
                                                        <span className="text-gray-400">(opcional — se usará el logo si no se sube)</span>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload button */}
                                    <button
                                        onClick={handleMusicUpload}
                                        disabled={!!uploadingKey}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-forest text-white rounded-xl font-bold text-sm hover:bg-matcha hover:-translate-y-0.5 transition-all shadow-lg disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        {uploadingKey === 'homepage_music_url' ? (
                                            <>
                                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                                Subiendo...
                                            </>
                                        ) : (
                                            <>
                                                <CloudArrowUpIcon className="h-5 w-5" />
                                                Subir como música de fondo
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {musicUploadMessage && (
                                <p className={`text-xs mt-1 font-medium ${musicUploadMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {musicUploadMessage.text}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setKeyToDelete(null);
                }}
                onConfirm={confirmDelete}
                title={keyToDelete === 'homepage_music_url' ? 'Eliminar música de fondo' : 'Eliminar imagen personalizada'}
                message={
                    keyToDelete === 'homepage_music_url'
                        ? '¿Estás seguro de que quieres eliminar la música de fondo? La página de inicio quedará en silencio. Si la canción también está en la lista de meditaciones, se eliminará de ahí también.'
                        : '¿Estás seguro de que quieres eliminar esta imagen personalizada? Si la eliminas, no se mostrará ninguna imagen en esta sección del sitio web.'
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
            />

            {imageToCrop && (
                <CropModal
                    open={cropModalOpen}
                    onClose={() => {
                        setCropModalOpen(false);
                        setImageToCrop(null);
                    }}
                    imageSrc={imageToCrop}
                    onSave={handleCropSave}
                    aspectRatio={aspect}
                />
            )}
        </div>
    );
}
