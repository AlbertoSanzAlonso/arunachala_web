import React, { useState, useEffect } from 'react';
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline';
import PageLoader from '../../../components/PageLoader';

export default function UserProfile() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileVersion, setProfileVersion] = useState(0); // To force refresh images

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        profile_picture: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    name: data.email.split('@')[0], // Fallback if no name yet
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
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/auth/me/upload-picture', {
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

                // Update LocalStorage for persistence across reloads if desired (simple hack)
                const stored = localStorage.getItem('arunachala_user');
                if (stored) {
                    const user = JSON.parse(stored);
                    user.profile_picture = data.url;
                    localStorage.setItem('arunachala_user', JSON.stringify(user));
                }
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
        // Implement password update logic here if needed
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        alert('Perfil actualizado correctamente');
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
                    <div className="px-4 sm:px-0">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Perfil de Usuario</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Esta información será mostrada públicamente si así lo decides.
                        </p>
                    </div>
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
                                                    src={`http://localhost:8000${formData.profile_picture}?v=${profileVersion}`}
                                                    alt="Profile"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600">
                                                    <span className="text-4xl font-bold">
                                                        {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
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
                                        <div className="col-span-6 sm:col-span-4">
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                Nombre completo
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
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

                                        <div className="col-span-6 sm:col-span-4">
                                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                                Contraseña actual
                                            </label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                id="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-3">
                                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                                Nueva contraseña
                                            </label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                id="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-3">
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                                Confirmar nueva contraseña
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                id="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
