import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface YogaClass {
    id: number;
    name: string;
    description: string;
    color: string;
    age_range: string | null;
}

const API_URL = 'http://localhost:8000';

const colorOptions = [
    { name: 'Forest (Verde)', value: 'bg-forest/20 border-forest text-forest' },
    { name: 'Sky (Azul)', value: 'bg-sky-100 border-sky-300 text-sky-800' },
    { name: 'Yellow (Amarillo)', value: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
    { name: 'Rose (Rosa)', value: 'bg-rose-100 border-rose-300 text-rose-800' },
    { name: 'Emerald (Esmeralda)', value: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
    { name: 'Amber (Ámbar)', value: 'bg-amber-100 border-amber-300 text-amber-800' },
    { name: 'Violet (Violeta)', value: 'bg-violet-100 border-violet-300 text-violet-800' },
];

export default function ClassTypeManager() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<YogaClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState<YogaClass | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
        age_range: ''
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [classToDelete, setClassToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await fetch(`${API_URL}/api/yoga-classes`);
            if (response.ok) {
                const data = await response.json();
                setClasses(data);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthError = () => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user_role');
        window.location.href = '/login';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = sessionStorage.getItem('access_token');

        try {
            const url = editingClass
                ? `${API_URL}/api/yoga-classes/${editingClass.id}`
                : `${API_URL}/api/yoga-classes`;

            const method = editingClass ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchClasses();
                handleCloseModal();
            } else if (response.status === 401 || response.status === 403) {
                handleAuthError();
            } else {
                const error = await response.json();
                alert(error.detail || 'Error al guardar el tipo de clase');
            }
        } catch (error) {
            console.error('Error saving class:', error);
            alert('Error al guardar el tipo de clase');
        }
    };

    const handleDeleteClick = (id: number) => {
        setClassToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!classToDelete) return;

        const token = sessionStorage.getItem('access_token');

        try {
            const response = await fetch(`${API_URL}/api/yoga-classes/${classToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await fetchClasses();
                setShowDeleteConfirm(false);
                setClassToDelete(null);
            } else if (response.status === 401 || response.status === 403) {
                handleAuthError();
            } else {
                alert('Error al eliminar el tipo de clase');
            }
        } catch (error) {
            console.error('Error deleting class:', error);
            alert('Error al eliminar el tipo de clase');
        }
    };

    const handleEdit = (yc: YogaClass) => {
        setEditingClass(yc);
        setFormData({
            name: yc.name,
            description: yc.description || '',
            color: yc.color || 'bg-emerald-100 border-emerald-300 text-emerald-800',
            age_range: yc.age_range || ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingClass(null);
        setFormData({
            name: '',
            description: '',
            color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
            age_range: ''
        });
    };

    if (isLoading) {
        return <div className="text-center py-12">Cargando tipos de clase...</div>;
    }

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">Menú de Clases</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Define los tipos de clases, sus colores y descripciones que luego aparecerán en el horario.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex sm:gap-3 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/schedule')}
                        className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        Ver Horarios
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Crear Nueva Clase
                    </button>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((yc) => (
                    <div key={yc.id} className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className={`h-2 ${yc.color.split(' ')[0]}`} />
                        <div className="flex-1 p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">{yc.name}</h3>
                            </div>
                            <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                                {yc.description}
                            </p>
                            {yc.age_range && (
                                <p className="mt-2 text-xs font-medium text-primary-600">
                                    Nota/Edad: {yc.age_range}
                                </p>
                            )}
                        </div>
                        <div className="flex border-t border-gray-200 divide-x divide-gray-200">
                            <button
                                onClick={() => handleEdit(yc)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
                                <PencilIcon className="h-4 w-4" /> Editar
                            </button>
                            <button
                                onClick={() => handleDeleteClick(yc.id)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                            >
                                <TrashIcon className="h-4 w-4" /> Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingClass ? 'Editar Tipo de Clase' : 'Nuevo Tipo de Clase'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-6 overflow-y-auto max-h-[80vh]">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre de la Clase</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                        placeholder="Ej: Hatha Yoga"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                        placeholder="Describe de qué trata la clase..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Edad / Nota (Opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.age_range}
                                        onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                        placeholder="Ej: 4-7 años o Práctica fluida"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Visual</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {colorOptions.map((option) => (
                                            <label
                                                key={option.value}
                                                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.color === option.value ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-100 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="color"
                                                    value={option.value}
                                                    checked={formData.color === option.value}
                                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                    className="sr-only"
                                                />
                                                <div className={`w-6 h-6 rounded-full mr-3 ${option.value.split(' ')[0]}`} />
                                                <span className={`text-sm font-medium ${formData.color === option.value ? 'text-primary-900' : 'text-gray-700'}`}>
                                                    {option.name}
                                                </span>
                                                {formData.color === option.value && (
                                                    <TagIcon className="h-4 w-4 ml-auto text-primary-600" />
                                                )}
                                            </label>
                                        ))}
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
                                    className="rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 shadow-sm"
                                >
                                    {editingClass ? 'Actualizar Clase' : 'Crear Clase'}
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
                                ¿Estás seguro de que quieres eliminar este tipo de clase? Esto podría afectar a los horarios existentes.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setClassToDelete(null);
                                    }}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteConfirm}
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
