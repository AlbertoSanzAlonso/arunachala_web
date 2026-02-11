import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { PencilIcon, TrashIcon, UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../../components/PageLoader';

interface User {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    profile_picture: string | null;
}

export default function UserManager() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        role: 'USER'
    });
    const [successMessage, setSuccessMessage] = useState('');
    const location = useLocation();

    const fetchUsers = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data: User[] = await response.json();
                setUsers(data);
                setFilteredUsers(data.filter(u => u.email !== currentUser?.email));
            } else if (response.status === 403) {
                alert('No tienes permisos para ver esta página');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.email]);

    useEffect(() => {
        // Check for messages sent via navigation state (e.g., from CreateUser)
        if (location.state && (location.state as any).message) {
            setSuccessMessage((location.state as any).message);
            // Clear message from state to avoid showing it again on refresh
            window.history.replaceState({}, document.title);
            setTimeout(() => setSuccessMessage(''), 5000);
        }
        fetchUsers();
    }, [location.state, fetchUsers]);

    useEffect(() => {
        const filtered = users.filter(user => {
            // Ocultar al usuario actual de la lista
            if (user.email === currentUser?.email) return false;

            return (
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
        setFilteredUsers(filtered);
    }, [searchTerm, users, currentUser]);



    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            role: user.role
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setShowDeleteConfirm(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setIsSaving(true);

        const token = sessionStorage.getItem('access_token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchUsers();
                setShowEditModal(false);
                setSelectedUser(null);
                setSuccessMessage('Usuario actualizado correctamente');
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                const error = await response.json();
                alert(error.detail || 'Error al actualizar usuario');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error al actualizar usuario');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        setIsSaving(true);

        const token = sessionStorage.getItem('access_token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/users/${selectedUser.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await fetchUsers();
                setShowDeleteConfirm(false);
                setSelectedUser(null);
                setSuccessMessage('Usuario eliminado correctamente');
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                const error = await response.json();
                alert(error.detail || 'Error al eliminar usuario');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error al eliminar usuario');
        } finally {
            setIsSaving(false);
        }
    };

    const getRoleBadge = (role: string) => {
        const isAdmin = role === 'ADMIN';
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                {isAdmin ? 'Administrador' : 'Usuario'}
            </span>
        );
    };

    if (isLoading) {
        return <div className="text-center py-12">Cargando usuarios...</div>;
    }

    return (
        <div>
            {isSaving && <PageLoader />}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="sm:flex-auto">
                    <h1 className="text-xl sm:text-2xl font-bold leading-6 text-gray-900">Gestión de Usuarios</h1>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                        Administra los usuarios del sistema, sus roles y permisos.
                    </p>
                </div>
                <div className="sm:flex-none">
                    <button
                        type="button"
                        onClick={() => window.location.href = '/dashboard/create-user'}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-100 hover:bg-primary-500 transition-all active:scale-95"
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Crear Usuario
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mt-6 rounded-xl bg-green-50 p-4 border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                        <p className="text-sm font-medium text-green-800">
                            {successMessage}
                        </p>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="mt-6">
                <div className="relative group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors group-focus-within:text-primary-500">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por email o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-xl border-gray-100 py-3 pl-11 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-4 focus:ring-inset focus:ring-primary-50/50 focus:border-primary-500 transition-all sm:text-sm shadow-sm"
                    />
                </div>
            </div>

            {/* Users View: Cards on Mobile, Table on Desktop */}
            <div className="mt-8">
                {/* Mobile Cards */}
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 flex-shrink-0">
                                    {user.profile_picture ? (
                                        <img
                                            className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-50"
                                            src={`${API_BASE_URL}${user.profile_picture}`}
                                            alt=""
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center border border-primary-100">
                                            <span className="text-primary-600 font-bold text-lg">
                                                {user.email.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-gray-900 truncate focus:outline-none">
                                        {user.first_name && user.last_name
                                            ? `${user.first_name} ${user.last_name}`
                                            : user.first_name || user.last_name || 'Sin nombre'}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <div className="shrink-0">
                                    {getRoleBadge(user.role)}
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-gray-50">
                                <button
                                    onClick={() => handleEdit(user)}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-primary-50 hover:text-primary-600 transition-all"
                                >
                                    <PencilIcon className="h-4 w-4" /> Editar
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(user)}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                                >
                                    <TrashIcon className="h-4 w-4" /> Borrar
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-400">No se encontraron usuarios.</p>
                        </div>
                    )}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow-sm ring-1 ring-gray-100 sm:rounded-2xl border border-gray-50">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50/50 backdrop-blur-sm">
                                        <tr>
                                            <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider sm:pl-6">
                                                Usuario
                                            </th>
                                            <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                Rol
                                            </th>
                                            <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Acciones</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            {user.profile_picture ? (
                                                                <img
                                                                    className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-50"
                                                                    src={`${API_BASE_URL}${user.profile_picture}`}
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center border border-primary-100">
                                                                    <span className="text-primary-600 font-bold">
                                                                        {user.email.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-bold text-gray-900">
                                                                {user.first_name && user.last_name
                                                                    ? `${user.first_name} ${user.last_name}`
                                                                    : user.first_name || user.last_name || 'Sin nombre'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-medium">
                                                    {user.email}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    {getRoleBadge(user.role)}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                            title="Editar"
                                                        >
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(user)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Borrar"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Editar Usuario</h3>
                        </div>
                        <form onSubmit={handleUpdate} className="px-6 py-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rol</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
                                >
                                    <option value="USER">Usuario</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {isSaving ? 'Guardando...' : 'Guardar'}
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
                                ¿Estás seguro de que quieres eliminar a <strong>{selectedUser?.email}</strong>? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={handleDelete}
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
