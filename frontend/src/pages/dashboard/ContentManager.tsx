
import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronLeftIcon, PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon, Bars3Icon, PhotoIcon, SpeakerWaveIcon, ClockIcon } from '@heroicons/react/24/outline';
import ChevronUpIcon from '@heroicons/react/24/outline/ChevronUpIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import { TagSelector } from '../../components/TagSelector';
import { API_BASE_URL } from '../../config';
import { useToast } from '../../hooks/useToast';
import ToastNotification from '../../components/ToastNotification';
import RichTextEditor from '../../components/RichTextEditor';
import PageLoader from '../../components/PageLoader';

interface Content {
    id: number;
    title: string;
    slug: string;
    type: 'article' | 'meditation' | 'service' | 'announcement';
    category?: 'yoga' | 'therapy' | 'general';
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    excerpt?: string;
    body?: string;
    thumbnail_url?: string;
    media_url?: string;
    tags?: string[] | string;
}

const TABS = [
    { name: 'Todos', value: 'all' },
    { name: 'Artículos Yoga', value: 'yoga_article' },
    { name: 'Artículos Terapia', value: 'therapy_article' },
    { name: 'Meditaciones', value: 'meditation' },
];

export default function ContentManager() {
    const toast = useToast();
    const [contents, setContents] = useState<Content[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [currentTab, setCurrentTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<Content | null>(null);
    const [formData, setFormData] = useState<Partial<Content>>({
        title: '',
        status: 'draft',
        type: 'article',
        category: 'yoga',
        tags: []
    });

    // New filters and selection state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'week' | 'month' | 'year'>('all');
    const [filterValue, setFilterValue] = useState<string>('');
    const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Local state for tags input to allow smooth typing
    // const [localTags, setLocalTags] = useState(''); // This is no longer needed

    // Delete Confirmation State
    const [deleteModalState, setDeleteModalState] = useState<{
        isOpen: boolean;
        type: 'single' | 'bulk';
        id?: number; // for single
    }>({ isOpen: false, type: 'single' });

    const fetchContents = async () => {
        setIsLoading(true);
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/content`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setContents(data);
            }
        } catch (error) {
            console.error("Failed to fetch content", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContents();
    }, []);

    const filteredContents = contents
        .filter(item => {
            // Tab filter
            let matchesTab = true;
            if (currentTab === 'yoga_article') matchesTab = item.type === 'article' && item.category === 'yoga';
            else if (currentTab === 'therapy_article') matchesTab = item.type === 'article' && item.category === 'therapy';
            else if (currentTab === 'meditation') matchesTab = item.type === 'meditation';

            // Search filter
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());

            // Time filter
            let matchesTime = true;
            if (filterType !== 'all' && filterValue) {
                const itemDate = new Date(item.created_at);

                if (filterType === 'month') {
                    // Match YYYY-MM
                    const itemMonth = itemDate.toISOString().slice(0, 7);
                    matchesTime = itemMonth === filterValue;
                } else if (filterType === 'year') {
                    // Match YYYY
                    matchesTime = itemDate.getFullYear().toString() === filterValue;
                } else if (filterType === 'week') {
                    // Match YYYY-Www
                    // Helper to calc ISO week
                    const getISOWeekValue = (d: Date): string => {
                        const date = new Date(d.getTime());
                        date.setHours(0, 0, 0, 0);
                        // Thursday in current week decides the year.
                        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
                        const week1 = new Date(date.getFullYear(), 0, 4);
                        const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
                        return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`;
                    };
                    matchesTime = getISOWeekValue(itemDate) === filterValue;
                }
            }

            return matchesTab && matchesSearch && matchesTime;
        })
        .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateSort === 'asc' ? dateA - dateB : dateB - dateA;
        });

    // Search Suggestions
    const searchSuggestions = contents
        .filter(c =>
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            searchTerm.length > 0 &&
            !contents.find(exact => exact.title.toLowerCase() === searchTerm.toLowerCase()) // Don't show if exact match already
        )
        .map(c => c.title)
        .slice(0, 5);

    // Selection handlers
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredContents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredContents.map(c => c.id)));
        }
    };

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const openDeleteModal = (id?: number) => {
        if (id) {
            setDeleteModalState({ isOpen: true, type: 'single', id });
        } else {
            // Bulk
            if (selectedIds.size === 0) return;
            setDeleteModalState({ isOpen: true, type: 'bulk' });
        }
    };

    const confirmDelete = async () => {
        setDeleteModalState(prev => ({ ...prev, isOpen: false }));
        setIsSaving(true);

        if (deleteModalState.type === 'single' && deleteModalState.id) {
            try {
                const token = sessionStorage.getItem('access_token');
                const response = await fetch(`${API_BASE_URL}/api/content/${deleteModalState.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    fetchContents();
                    // If the deleted item was selected, remove it from selection
                    if (selectedIds.has(deleteModalState.id)) {
                        const newSelected = new Set(selectedIds);
                        newSelected.delete(deleteModalState.id);
                        setSelectedIds(newSelected);
                    }
                    toast.success('Contenido eliminado correctamente de la base de datos y sistema RAG');
                } else {
                    toast.error('Error al eliminar el contenido');
                }
            } catch (error) {
                console.error(error);
                toast.error('Error al conectar con el servidor');
            } finally {
                setIsSaving(false);
            }
        } else if (deleteModalState.type === 'bulk') {
            try {
                setIsSaving(true);
                const token = sessionStorage.getItem('access_token');
                const deletePromises = Array.from(selectedIds).map(id =>
                    fetch(`${API_BASE_URL}/api/content/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                );

                await Promise.all(deletePromises);

                toast.success(`${selectedIds.size} elementos eliminados correctamente de la base de datos y sistema RAG`);
                setSelectedIds(new Set());
                fetchContents();
            } catch (error) {
                console.error(error);
                toast.error('Error al eliminar algunos elementos');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleBulkDelete = () => {
        openDeleteModal();
    };

    const handleOpenModal = (content?: Content) => {
        if (content) {
            setEditingContent(content);

            // Normalize tags to string[]
            let normalizedTags: string[] = [];
            if (Array.isArray(content.tags)) {
                normalizedTags = content.tags;
            } else if (typeof content.tags === 'string') {
                if (content.tags.trim().startsWith('[')) {
                    try { normalizedTags = JSON.parse(content.tags); } catch { }
                } else {
                    normalizedTags = content.tags.split(',').map(t => t.trim()).filter(Boolean);
                }
            }

            setFormData({ ...content, tags: normalizedTags });
        } else {
            setEditingContent(null);
            // Set defaults based on current tab
            let defaultType: 'article' | 'meditation' | 'service' | 'announcement' = 'article';
            let defaultCategory: 'yoga' | 'therapy' | 'general' | undefined = 'yoga';

            if (currentTab === 'yoga_article') { defaultType = 'article'; defaultCategory = 'yoga'; }
            if (currentTab === 'therapy_article') { defaultType = 'article'; defaultCategory = 'therapy'; }
            if (currentTab === 'meditation') { defaultType = 'meditation'; defaultCategory = undefined; }

            setFormData({
                title: '',
                status: 'draft',
                type: defaultType as any,
                category: defaultCategory as any,
                body: '',
                excerpt: '',
                thumbnail_url: '',
                media_url: '',
                tags: []
            });
        }
        setIsModalOpen(true);
    };

    const [uploading, setUploading] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const generateAIImage = async () => {
        console.log("generateAIImage clicked. Title:", formData.title);
        if (!formData.title) {
            toast.error('Por favor, añade un título primero para usarlo como base');
            return;
        }

        // Use title directly as prompt for better UX
        const userPrompt = formData.title;
        console.log("Using prompt:", userPrompt);

        // Notify user we are starting using the title
        toast.success(`Generando imagen para: "${userPrompt}"...`);

        setIsGeneratingImage(true);
        try {
            const token = sessionStorage.getItem('access_token');
            const folder = formData.type === 'meditation' ? 'meditations' : 'articles';

            // Use GET request with query params
            const encodedPrompt = encodeURIComponent(userPrompt);
            const encodedFolder = encodeURIComponent(folder);

            const response = await fetch(`${API_BASE_URL}/api/content/generate-ai-image?prompt=${encodedPrompt}&folder=${encodedFolder}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, thumbnail_url: data.url }));
                toast.success('Imagen generada con IA correctamente');
            } else {
                const errData = await response.json().catch(() => ({}));
                console.error("AI Generation Error:", errData);
                toast.error(`Error al generar la imagen: ${errData.detail || response.statusText}`);
            }
        } catch (error) {
            console.error("AI Generation Network Error:", error);
            toast.error('Error de conexión con el servicio de IA. Inténtalo de nuevo.');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/upload/audio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, media_url: data.url }));
                toast.success('Audio subido correctamente');
            } else {
                toast.error('Error al subir el audio');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión al subir audio');
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const token = sessionStorage.getItem('access_token');
            const folder = formData.type === 'meditation' ? 'meditations' : 'articles';
            const titleParam = formData.title ? `&title=${encodeURIComponent(formData.title)}` : '';
            const response = await fetch(`${API_BASE_URL}/api/upload/image?folder=${folder}${titleParam}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, thumbnail_url: data.url }));
                toast.success('Imagen subida correctamente');
            } else {
                toast.error('Error al subir la imagen');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión al subir imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Validate required fields
        if (!formData.title || formData.title.trim() === '') {
            toast.error('El título es obligatorio');
            return;
        }

        if (formData.type === 'article' && !formData.category) {
            toast.error('La categoría es obligatoria para los artículos');
            return;
        }

        const token = sessionStorage.getItem('access_token');
        const url = editingContent
            ? `${API_BASE_URL}/api/content/${editingContent.id}`
            : `${API_BASE_URL}/api/content`;

        const method = editingContent ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags // Use direct array from selector
                })
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchContents();
                toast.success(editingContent ? 'Contenido actualizado correctamente' : 'Contenido creado correctamente');
            } else {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.detail || 'Error al guardar el contenido';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al conectar con el servidor');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (id: number) => {
        openDeleteModal(id);
    };

    return (
        <>
            {isSaving && <PageLoader />}
            <ToastNotification toasts={toast.toasts} onRemove={toast.removeToast} />
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold leading-6 text-gray-900">Gestor de Contenido</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Gestiona los artículos de yoga, terapias y audios de meditación.
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            type="button"
                            onClick={() => handleOpenModal()}
                            className="flex items-center justify-center w-full sm:w-auto rounded-md bg-forest px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                        >
                            <PlusIcon className="h-5 w-5 inline-block mr-1" />
                            Crear Contenido
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto" aria-label="Tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setCurrentTab(tab.value)}
                                className={`
                                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex-shrink-0
                                ${currentTab === tab.value
                                        ? 'border-forest text-forest'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                            `}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Filters and Actions Bar */}
                <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-1 gap-4 w-full sm:w-auto flex-wrap">
                        {/* Search + Autocomplete */}
                        <div className="relative flex-grow sm:max-w-xs">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-forest sm:text-sm sm:leading-6"
                                placeholder="Buscar por título..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                            />
                            {/* Suggestions Dropdown */}
                            {showSuggestions && searchSuggestions.length > 0 && (
                                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    {searchSuggestions.map((suggestion, idx) => (
                                        <div
                                            key={idx}
                                            className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-forest/10"
                                            onClick={() => {
                                                setSearchTerm(suggestion);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            <span className="block truncate">{suggestion}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Date Period Filter */}
                        <div className="flex gap-2 items-center">
                            <div className="relative w-32">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <ClockIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-forest sm:text-sm sm:leading-6"
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value as any);
                                        setFilterValue(''); // Reset value when type changes
                                    }}
                                >
                                    <option value="all">Todo</option>
                                    <option value="week">Semana</option>
                                    <option value="month">Mes</option>
                                    <option value="year">Año</option>
                                </select>
                            </div>

                            {filterType !== 'all' && (
                                <div className="w-40">
                                    {filterType === 'week' && (
                                        <input
                                            type="week"
                                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-forest sm:text-sm sm:leading-6"
                                            value={filterValue}
                                            onChange={(e) => setFilterValue(e.target.value)}
                                        />
                                    )}
                                    {filterType === 'month' && (
                                        <input
                                            type="month"
                                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-forest sm:text-sm sm:leading-6"
                                            value={filterValue}
                                            onChange={(e) => setFilterValue(e.target.value)}
                                        />
                                    )}
                                    {filterType === 'year' && (
                                        <input
                                            type="number"
                                            placeholder="2024"
                                            min="2000"
                                            max="2100"
                                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-forest sm:text-sm sm:leading-6"
                                            value={filterValue}
                                            onChange={(e) => setFilterValue(e.target.value)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sort Order Toggle */}
                        <button
                            onClick={() => setDateSort(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            title={dateSort === 'asc' ? "Más antiguos primero" : "Más recientes primero"}
                        >
                            {dateSort === 'asc' ? (
                                <>
                                    <ChevronUpIcon className="h-5 w-5 text-gray-400 mr-2" />
                                    <span>Antiguos</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDownIcon className="h-5 w-5 text-gray-400 mr-2" />
                                    <span>Recientes</span>
                                </>
                            )}
                        </button>
                    </div>

                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center justify-center rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
                        >
                            <TrashIcon className="h-5 w-5 mr-1" />
                            Eliminar seleccionados ({selectedIds.size})
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="relative py-3.5 pl-4 pr-3 sm:pl-6 w-12">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-forest focus:ring-forest"
                                                    checked={filteredContents.length > 0 && selectedIds.size === filteredContents.length}
                                                    onChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Título</th>
                                            <th scope="col" className="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipo</th>
                                            {currentTab !== 'meditation' && (
                                                <th scope="col" className="hidden lg:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Categoría</th>
                                            )}
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {isLoading ? (
                                            <tr><td colSpan={6} className="text-center py-4">Cargando...</td></tr>
                                        ) : filteredContents.length === 0 ? (
                                            <tr><td colSpan={6} className="text-center py-4 text-gray-500">No hay contenido en esta sección.</td></tr>
                                        ) : (
                                            filteredContents.map((item) => (
                                                <tr key={item.id} className={selectedIds.has(item.id) ? 'bg-gray-50' : undefined}>
                                                    <td className="relative py-4 pl-4 pr-3 sm:pl-6">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-forest focus:ring-forest"
                                                            checked={selectedIds.has(item.id)}
                                                            onChange={() => toggleSelect(item.id)}
                                                        />
                                                    </td>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                                        {item.title}
                                                    </td>
                                                    <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                                                        {item.type === 'meditation' ? 'Meditación' : 'Artículo'}
                                                    </td>
                                                    {currentTab !== 'meditation' && (
                                                        <td className="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{item.category || '-'}</td>
                                                    )}
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset 
                                                        ${item.status === 'published' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'}`}>
                                                            {item.status === 'published' ? 'Publicado' : 'Borrador'}
                                                        </span>
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <button onClick={() => handleOpenModal(item)} className="text-forest hover:text-forest/80 mr-4">
                                                            <PencilSquareIcon className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                <Transition appear show={isModalOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-25" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all">
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                            {editingContent ? 'Editar Contenido' : 'Nuevo Contenido'}
                                        </Dialog.Title>

                                        <form onSubmit={handleSave} className="space-y-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div className="col-span-1 lg:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700">Título</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.title}
                                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                                    />
                                                </div>

                                                <div className="col-span-1">
                                                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                                    <select
                                                        value={formData.type}
                                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                                    >
                                                        <option value="article">Artículo</option>
                                                        <option value="meditation">Meditación</option>
                                                    </select>
                                                </div>

                                                {formData.type !== 'meditation' && (
                                                    <div className="col-span-1">
                                                        <label className="block text-sm font-medium text-gray-700">Categoría</label>
                                                        <select
                                                            value={formData.category || ''}
                                                            onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            <option value="yoga">Yoga</option>
                                                            <option value="therapy">Terapia</option>
                                                        </select>
                                                    </div>
                                                )}

                                                <div className="col-span-1 lg:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas</label>
                                                    <TagSelector
                                                        value={Array.isArray(formData.tags) ? formData.tags : []}
                                                        onChange={(newTags) => setFormData({ ...formData, tags: newTags })}
                                                        category={
                                                            formData.type === 'meditation' ? 'meditation' :
                                                                formData.type === 'article' ? (formData.category || 'general') :
                                                                    'general'
                                                        }
                                                    />
                                                </div>

                                                <div className="col-span-1 lg:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700">Extracto (Resumen corto)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.excerpt || ''}
                                                        onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                                    />
                                                </div>

                                                <div className="col-span-1 lg:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        {formData.type === 'meditation' ? 'Audio' : 'Cuerpo del Artículo'}
                                                    </label>
                                                    {formData.type === 'meditation' ? (
                                                        <div className="mt-1 space-y-2">
                                                            {formData.media_url && (
                                                                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                                                                    Archivo cargado: {formData.media_url.split('/').pop()}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="file"
                                                                    accept="audio/*"
                                                                    onChange={handleFileUpload}
                                                                    disabled={uploading}
                                                                    className="block w-full text-sm text-gray-500
                                                                    file:mr-4 file:py-2 file:px-4
                                                                    file:rounded-md file:border-0
                                                                    file:text-sm file:font-semibold
                                                                    file:bg-forest file:text-white
                                                                    hover:file:bg-forest/90"
                                                                />
                                                                {uploading && <span className="text-sm text-gray-500 animate-pulse">Subiendo y procesando...</span>}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-1">
                                                            <RichTextEditor
                                                                value={formData.body || ''}
                                                                onChange={(value) => setFormData({ ...formData, body: value })}
                                                                placeholder="Escribe el contenido aquí..."
                                                                className="w-full"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-span-1 lg:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700">Imagen Destacada</label>
                                                    {formData.thumbnail_url && (
                                                        <div className="mt-2 mb-2">
                                                            <img
                                                                src={formData.thumbnail_url.startsWith('http') ? formData.thumbnail_url : `${API_BASE_URL}${formData.thumbnail_url}`}
                                                                alt="Destacada"
                                                                className="h-40 w-auto object-cover rounded-md"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, thumbnail_url: '' })}
                                                                className="text-xs text-red-600 mt-1 hover:underline"
                                                            >
                                                                Eliminar imagen
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageUpload}
                                                                disabled={uploading || isGeneratingImage}
                                                                className="block w-full text-sm text-gray-500
                                                                file:mr-4 file:py-2 file:px-4
                                                                file:rounded-md file:border-0
                                                                file:text-sm file:font-semibold
                                                                file:bg-forest file:text-white
                                                                hover:file:bg-forest/90"
                                                            />
                                                            {uploading && <span className="text-sm text-gray-500 animate-pulse">Subiendo...</span>}
                                                        </div>

                                                        <div className="relative">
                                                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                                <div className="w-full border-t border-gray-300" />
                                                            </div>
                                                            <div className="relative flex justify-center">
                                                                <span className="bg-white px-2 text-sm text-gray-500">O genera una nueva</span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={generateAIImage}
                                                            disabled={isGeneratingImage || uploading}
                                                            className="flex items-center justify-center w-full rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100 border border-indigo-200"
                                                        >
                                                            {isGeneratingImage ? (
                                                                <div className="flex items-center space-x-2">
                                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    <span className="animate-pulse">Creando imagen mágica...</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <SparklesIcon className="h-5 w-5 mr-2" />
                                                                    Generar con IA
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                                                    <select
                                                        value={formData.status}
                                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                                    >
                                                        <option value="draft">Borrador</option>
                                                        <option value="published">Publicado</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                                    onClick={() => setIsModalOpen(false)}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSaving || uploading || isGeneratingImage}
                                                    className="inline-flex justify-center rounded-md border border-transparent bg-forest px-6 py-2 text-sm font-medium text-white hover:bg-forest/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:opacity-50"
                                                >
                                                    {isSaving ? 'Guardando...' : (editingContent ? 'Guardar Cambios' : 'Crear Contenido')}
                                                </button>
                                            </div>
                                        </form>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {/* Delete Confirmation Modal */}
                <Transition appear show={deleteModalState.isOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-25" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
                                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                            </div>
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                                Confirmar eliminación
                                            </Dialog.Title>
                                        </div>

                                        <div className="mt-2 text-sm text-gray-500">
                                            <p className="mb-2">
                                                {deleteModalState.type === 'single'
                                                    ? '¿Estás seguro de que deseas eliminar este contenido?'
                                                    : `¿Estás seguro de que deseas eliminar los ${selectedIds.size} elementos seleccionados?`
                                                }
                                            </p>
                                            <p className="border-l-4 border-red-500 pl-3 italic">
                                                Advertencia: Esta acción eliminará el contenido de:
                                                <ul className="list-disc list-inside mt-1">
                                                    <li>La base de datos</li>
                                                    <li>La página web pública</li>
                                                    <li>El sistema de Inteligencia Artificial (RAG)</li>
                                                </ul>
                                            </p>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
                                                onClick={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                onClick={confirmDelete}
                                            >
                                                Eliminar definitivamente
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </>
    );
}
