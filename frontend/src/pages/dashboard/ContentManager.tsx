import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    DocumentTextIcon,
    MusicalNoteIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

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
}

const TABS = [
    { name: 'Todos', value: 'all' },
    { name: 'Artículos Yoga', value: 'yoga_article' },
    { name: 'Artículos Terapia', value: 'therapy_article' },
    { name: 'Meditaciones', value: 'meditation' },
];

export default function ContentManager() {
    const { t } = useTranslation();
    const { login } = useAuth(); // Using context just in case we need auth actions
    const [contents, setContents] = useState<Content[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTab, setCurrentTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<Content | null>(null);
    const [formData, setFormData] = useState<Partial<Content>>({
        title: '',
        status: 'draft',
        type: 'article',
        category: 'general'
    });

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

    const filteredContents = contents.filter(item => {
        if (currentTab === 'all') return true;
        if (currentTab === 'yoga_article') return item.type === 'article' && item.category === 'yoga';
        if (currentTab === 'therapy_article') return item.type === 'article' && item.category === 'therapy';
        if (currentTab === 'meditation') return item.type === 'meditation';
        return true;
    });

    const handleOpenModal = (content?: Content) => {
        if (content) {
            setEditingContent(content);
            setFormData(content);
        } else {
            setEditingContent(null);
            // Set defaults based on current tab
            let defaultType = 'article';
            let defaultCategory = 'general';

            if (currentTab === 'yoga_article') { defaultType = 'article'; defaultCategory = 'yoga'; }
            if (currentTab === 'therapy_article') { defaultType = 'article'; defaultCategory = 'therapy'; }
            if (currentTab === 'meditation') { defaultType = 'meditation'; defaultCategory = undefined as any; }

            setFormData({
                title: '',
                status: 'draft',
                type: defaultType as any,
                category: defaultCategory as any,
                body: '',
                excerpt: '',
                thumbnail_url: '',
                media_url: ''
            });
        }
        setIsModalOpen(true);
    };

    const [uploading, setUploading] = useState(false);

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
            } else {
                alert('Error al subir el archivo');
            }
        } catch (error) {
            console.error(error);
            alert('Error al conectar con el servidor');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
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
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchContents();
            } else {
                alert('Error al guardar el contenido');
            }
        } catch (error) {
            console.error(error);
            alert('Error al conectar con el servidor');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este contenido?')) return;

        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/content/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchContents();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
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
                        className="block rounded-md bg-forest px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                    >
                        <PlusIcon className="h-5 w-5 inline-block mr-1" />
                        Crear Contenido
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setCurrentTab(tab.value)}
                            className={`
                                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
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

            {/* Table */}
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Título</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipo</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Categoría</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="text-center py-4">Cargando...</td></tr>
                                    ) : filteredContents.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-4 text-gray-500">No hay contenido en esta sección.</td></tr>
                                    ) : (
                                        filteredContents.map((item) => (
                                            <tr key={item.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {item.title}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                                                    {item.type === 'meditation' ? 'Meditación' : 'Artículo'}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{item.category || '-'}</td>
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
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                        {editingContent ? 'Editar Contenido' : 'Nuevo Contenido'}
                                    </Dialog.Title>

                                    <form onSubmit={handleSave} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">Título</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.title}
                                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                                />
                                            </div>

                                            <div>
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

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                                                <select
                                                    value={formData.category || ''}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                                    disabled={formData.type === 'meditation'}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border disabled:bg-gray-100"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="yoga">Yoga</option>
                                                    <option value="therapy">Terapia</option>
                                                    <option value="general">General</option>
                                                </select>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">Extracto (Resumen corto)</label>
                                                <input
                                                    type="text"
                                                    value={formData.excerpt || ''}
                                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    {formData.type === 'meditation' ? 'Audio/Video' : 'Cuerpo del Artículo'}
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
                                                        <div className="text-xs text-gray-400">
                                                            O si prefieres usar una URL externa:
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="https://..."
                                                            value={formData.media_url || ''}
                                                            onChange={e => setFormData({ ...formData, media_url: e.target.value })}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                                        />
                                                    </div>
                                                ) : (
                                                    <textarea
                                                        rows={6}
                                                        value={formData.body || ''}
                                                        onChange={e => setFormData({ ...formData, body: e.target.value })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                                    />
                                                )}
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">Imagen Destacada (URL)</label>
                                                <input
                                                    type="text"
                                                    value={formData.thumbnail_url || ''}
                                                    onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                                />
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
                                                className="inline-flex justify-center rounded-md border border-transparent bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                                            >
                                                Guardar
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
