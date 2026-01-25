import React, { useState, useEffect } from 'react';
import { CameraIcon, ArrowLeftIcon, EyeIcon, EyeSlashIcon, XCircleIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import PageLoader from '../../../components/PageLoader';
import { API_BASE_URL } from '../../../config';

export default function UserProfile() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileVersion, setProfileVersion] = useState(0); // To force refresh images
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        newPassword: '',
        confirmPassword: '',
        profile_picture: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    email: data.email,
                    profile_picture: data.profile_picture
                }));
            }
        } catch (error) {
            console.error("Error loading profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/auth/me/upload-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            if (response.ok) {
                const data = await response.json();
                // Update local state with new URL
                setFormData(prev => ({ ...prev, profile_picture: data.url }));
                setProfileVersion(v => v + 1); // Force re-render

                // Update sessionStorage for persistence across reloads if desired
                const stored = sessionStorage.getItem('arunachala_user');
                if (stored) {
                    const user = JSON.parse(stored);
                    user.profile_picture = data.url;
                    sessionStorage.setItem('arunachala_user', JSON.stringify(user));
                }

                // Dispatch custom event to notify DashboardLayout
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                const errorText = await response.text();
                console.error('Upload failed:', response.status, errorText);
                alert(`Error al subir la imagen: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error(error);
            alert(`Error de red al subir la imagen: ${error}`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            // Validate passwords if user is trying to change password
            if (formData.newPassword || formData.confirmPassword) {
                // Check if both fields are filled
                if (!formData.newPassword || !formData.confirmPassword) {
                    setError('Por favor, completa ambos campos de contraseña');
                    setIsSaving(false);
                    return;
                }

                // Check if passwords match
                if (formData.newPassword !== formData.confirmPassword) {
                    setError('Las contraseñas no coinciden');
                    setIsSaving(false);
                    return;
                }

                // Check minimum length
                if (formData.newPassword.length < 6) {
                    setError('La contraseña debe tener al menos 6 caracteres');
                    setIsSaving(false);
                    return;
                }
            }

            const token = sessionStorage.getItem('access_token');

            // Prepare update data
            const updateData: any = {
                first_name: formData.firstName || null,
                last_name: formData.lastName || null
            };

            // Add password if provided
            if (formData.newPassword && formData.newPassword.trim()) {
                updateData.new_password = formData.newPassword;
            }

            // Update profile information (first_name, last_name, and optionally password)
            const profileResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (!profileResponse.ok) {
                const errorData = await profileResponse.json();
                throw new Error(errorData.detail || 'Error al actualizar el perfil');
            }

            // Update sessionStorage with new data
            const updatedUser = await profileResponse.json();
            const stored = sessionStorage.getItem('arunachala_user');
            if (stored) {
                const user = JSON.parse(stored);
                user.first_name = updatedUser.first_name;
                user.last_name = updatedUser.last_name;
                sessionStorage.setItem('arunachala_user', JSON.stringify(user));
            }

            // Dispatch custom event to notify DashboardLayout
            window.dispatchEvent(new CustomEvent('profileUpdated'));

            // Navigate to dashboard with success message
            const successMessage = formData.newPassword
                ? 'Perfil y contraseña actualizados correctamente'
                : 'Perfil actualizado correctamente';

            navigate('/dashboard', {
                state: {
                    notification: {
                        type: 'success',
                        message: successMessage
                    }
                }
            });

        } catch (error: any) {
            setError(error.message || 'No se pudo actualizar el perfil');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (isLoading) return <PageLoader />;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="md:grid md:grid-cols-3 md:gap-6">

                {/* Profile Picture Section */}
                <div className="md:col-span-1">
                </div>

                <div className="mt-5 md:col-span-2 md:mt-0">
                    <div className="shadow sm:overflow-hidden sm:rounded-md">
                        <div className="space-y-6 bg-white px-4 py-5 sm:p-6">

                            {/* Photo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Foto</label>
                                <div className="mt-2 flex items-center justify-center">
                                    <div className="relative group">
                                        <span className="inline-block h-40 w-40 overflow-hidden rounded-full bg-gray-100 ring-4 ring-white shadow-lg">
                                            {formData.profile_picture ? (
                                                <img
                                                    className="h-full w-full object-cover"
                                                    src={`${API_BASE_URL}${formData.profile_picture}?v=${profileVersion}`}
                                                    alt="Profile"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600">
                                                    <span className="text-4xl font-bold">
                                                        {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : (formData.email ? formData.email.charAt(0).toUpperCase() : 'A')}
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                        <label
                                            htmlFor="photo-upload"
                                            className="absolute bottom-0 right-0 rounded-full bg-primary-600 p-2 text-white shadow-sm hover:bg-primary-500 cursor-pointer transition-colors"
                                        >
                                            <CameraIcon className="h-5 w-5" aria-hidden="true" />
                                            <input
                                                id="photo-upload"
                                                name="photo-upload"
                                                type="file"
                                                className="sr-only"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden sm:block" aria-hidden="true">
                <div className="py-5">
                    <div className="border-t border-gray-200" />
                </div>
            </div>

            {/* Form Section */}
            <div className="mt-10 sm:mt-0">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <div className="px-4 sm:px-0">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Información Personal</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Actualiza tus datos personales y credenciales de acceso.
                            </p>
                        </div>
                    </div>
                    <div className="mt-5 md:col-span-2 md:mt-0">
                        <form onSubmit={handleSubmit}>
                            <div className="shadow overflow-hidden sm:rounded-md">
                                <div className="bg-white px-4 py-5 sm:p-6">
                                    <div className="grid grid-cols-6 gap-6">

                                        {/* Error Notification */}
                                        {error && (
                                            <div className="col-span-6">
                                                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                                                        </div>
                                                        <div className="ml-3 flex-1">
                                                            <p className="text-sm font-medium text-red-800">{error}</p>
                                                        </div>
                                                        <div className="ml-auto pl-3">
                                                            <div className="-mx-1.5 -my-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setError('')}
                                                                    className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                                                                >
                                                                    <span className="sr-only">Cerrar</span>
                                                                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Success Notification */}
                                        {success && (
                                            <div className="col-span-6">
                                                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                                                        </div>
                                                        <div className="ml-3 flex-1">
                                                            <p className="text-sm font-medium text-green-800">{success}</p>
                                                        </div>
                                                        <div className="ml-auto pl-3">
                                                            <div className="-mx-1.5 -my-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSuccess('')}
                                                                    className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                                                                >
                                                                    <span className="sr-only">Cerrar</span>
                                                                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}


                                        <div className="col-span-6 sm:col-span-3">
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                                Nombre
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                id="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                                placeholder="Juan"
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-3">
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                                Apellidos
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                id="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                                placeholder="Pérez García"
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-4">
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Correo electrónico
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                            />
                                        </div>

                                        <div className="col-span-6 border-t border-gray-100 pt-6">
                                            <h3 className="text-sm font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
                                        </div>

                                        <div className="col-span-6 sm:col-span-3">
                                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                                Nueva contraseña
                                            </label>
                                            <div className="mt-1 relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    id="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 pr-10 border"
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? (
                                                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="col-span-6 sm:col-span-3">
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                                Confirmar nueva contraseña
                                            </label>
                                            <div className="mt-1 relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    id="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 pr-10 border"
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="col-span-6 flex justify-between items-center pt-6">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                        >
                                            <ArrowLeftIcon className="h-4 w-4" />
                                            Volver
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            {isSaving ? 'Guardando...' : 'Guardar cambios'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
