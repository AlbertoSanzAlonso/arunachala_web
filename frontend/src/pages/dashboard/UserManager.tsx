import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { PencilIcon, TrashIcon, UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

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
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;

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
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">Gestión de Usuarios</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Administra los usuarios del sistema, sus roles y permisos.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => window.location.href = '/dashboard/create-user'}
                        className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Crear Usuario
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mt-6 rounded-lg bg-green-50 p-4 border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
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
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por email o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Usuario
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Email
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Rol
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {user.profile_picture ? (
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={`${API_BASE_URL}${user.profile_picture}`}
                                                                alt=""
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                                <span className="text-primary-600 font-medium">
                                                                    {user.email.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">
                                                            {user.first_name && user.last_name
                                                                ? `${user.first_name} ${user.last_name}`
                                                                : user.first_name || user.last_name || 'Sin nombre'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="text-primary-600 hover:text-primary-900 mr-4"
                                                >
                                                    <PencilIcon className="h-5 w-5 inline" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(user)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-5 w-5 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                                    className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                                >
                                    Guardar
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
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
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
