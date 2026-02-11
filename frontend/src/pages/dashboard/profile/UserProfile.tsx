import React, { useState, useEffect, useCallback } from 'react';
import { CameraIcon, ArrowLeftIcon, EyeIcon, EyeSlashIcon, XCircleIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';
import getCroppedImg from '../../../utils/cropImage';
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

    // Cropper States
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || null);
                setIsCropping(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropSave = async () => {
        if (imageSrc && croppedAreaPixels) {
            try {
                const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
                if (croppedImageBlob) {
                    await uploadCroppedImage(croppedImageBlob);
                    setIsCropping(false);
                    setImageSrc(null);
                }
            } catch (e) {
                console.error(e);
                alert("Error al recortar la imagen");
            }
        }
    };

    const uploadCroppedImage = async (blob: Blob) => {
        const uploadData = new FormData();
        uploadData.append('file', blob, 'profile.webp');

        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/auth/me/profile-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            if (response.ok) {
                const data = await response.json();
                const newPicUrl = data.profile_picture;

                setFormData(prev => ({ ...prev, profile_picture: newPicUrl }));
                setProfileVersion(v => v + 1);

                const stored = sessionStorage.getItem('arunachala_user');
                if (stored) {
                    const user = JSON.parse(stored);
                    user.profile_picture = newPicUrl;
                    sessionStorage.setItem('arunachala_user', JSON.stringify(user));
                }

                window.dispatchEvent(new CustomEvent('profileUpdated'));
                setSuccess('Foto de perfil actualizada con éxito');
            } else {
                const errorText = await response.text();
                alert(`Error al subir la imagen: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            alert(`Error de red al subir la imagen: ${error}`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            if (formData.newPassword || formData.confirmPassword) {
                if (!formData.newPassword || !formData.confirmPassword) {
                    setError('Por favor, completa ambos campos de contraseña');
                    setIsSaving(false);
                    return;
                }
                if (formData.newPassword !== formData.confirmPassword) {
                    setError('Las contraseñas no coinciden');
                    setIsSaving(false);
                    return;
                }
                if (formData.newPassword.length < 6) {
                    setError('La contraseña debe tener al menos 6 caracteres');
                    setIsSaving(false);
                    return;
                }
            }

            const token = sessionStorage.getItem('access_token');
            const updateData: any = {
                first_name: formData.firstName || null,
                last_name: formData.lastName || null
            };

            if (formData.newPassword && formData.newPassword.trim()) {
                updateData.new_password = formData.newPassword;
            }

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

            const updatedUser = await profileResponse.json();
            const stored = sessionStorage.getItem('arunachala_user');
            if (stored) {
                const user = JSON.parse(stored);
                user.first_name = updatedUser.first_name;
                user.last_name = updatedUser.last_name;
                sessionStorage.setItem('arunachala_user', JSON.stringify(user));
            }

            window.dispatchEvent(new CustomEvent('profileUpdated'));

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
            {isCropping && imageSrc && (
                <div className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex flex-col items-center justify-center p-4">
                    <div className="relative w-full max-w-xl h-[400px] bg-gray-900 rounded-lg overflow-hidden">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div className="mt-4 flex flex-col gap-2 w-full max-w-xl">
                        <label className="text-white text-sm font-medium">Zoom</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={() => { setIsCropping(false); setImageSrc(null); }}
                            className="px-6 py-2 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCropSave}
                            className="px-8 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 shadow-lg shadow-primary-900/20 transition-all"
                        >
                            Guardar Foto
                        </button>
                    </div>
                </div>
            )}

            <div className="md:grid md:grid-cols-3 md:gap-6 pt-4">
                <div className="md:col-span-1">
                    <div className="px-4 sm:px-0 text-center md:text-left">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Foto de Perfil</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Esta foto será visible en la parte superior del dashboard.
                        </p>

                        <div className="mt-6 flex justify-center">
                            <div className="relative group">
                                <span className="inline-block h-48 w-48 overflow-hidden rounded-full bg-gray-100 ring-4 ring-white shadow-xl">
                                    {formData.profile_picture ? (
                                        <img
                                            className="h-full w-full object-cover"
                                            src={`${API_BASE_URL}${formData.profile_picture}?v=${profileVersion}`}
                                            alt="Profile"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600">
                                            <span className="text-5xl font-bold">
                                                {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : (formData.email ? formData.email.charAt(0).toUpperCase() : 'A')}
                                            </span>
                                        </div>
                                    )}
                                </span>
                                <label
                                    htmlFor="photo-upload"
                                    className="absolute bottom-2 right-2 rounded-full bg-primary-600 p-3 text-white shadow-lg hover:bg-primary-500 cursor-pointer transition-all transform hover:scale-110"
                                >
                                    <CameraIcon className="h-6 w-6" aria-hidden="true" />
                                    <input
                                        id="photo-upload"
                                        name="photo-upload"
                                        type="file"
                                        className="sr-only"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 md:col-span-2 md:mt-0">
                    <form onSubmit={handleSubmit}>
                        <div className="shadow sm:overflow-hidden sm:rounded-2xl">
                            <div className="space-y-6 bg-white px-4 py-5 sm:p-8">
                                <div className="grid grid-cols-6 gap-6">
                                    {error && (
                                        <div className="col-span-6">
                                            <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-center gap-3">
                                                <XCircleIcon className="h-5 w-5 text-red-500" />
                                                <p className="text-sm font-medium text-red-800">{error}</p>
                                            </div>
                                        </div>
                                    )}

                                    {success && (
                                        <div className="col-span-6">
                                            <div className="rounded-xl bg-green-50 p-4 border border-green-100 flex items-center gap-3">
                                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                                <p className="text-sm font-medium text-green-800">{success}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="firstName" className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-3 border hover:border-gray-300 transition-colors"
                                        />
                                    </div>

                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="lastName" className="block text-sm font-bold text-gray-700 mb-1">Apellidos</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-3 border hover:border-gray-300 transition-colors"
                                        />
                                    </div>

                                    <div className="col-span-6 sm:col-span-4">
                                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            disabled
                                            value={formData.email}
                                            className="block w-full rounded-xl border-gray-100 bg-gray-50 text-gray-400 sm:text-sm p-3 border cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="col-span-6 pt-4 border-t border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-900">Seguridad</h3>
                                        <p className="text-xs text-gray-500 mb-4">Deja las contraseñas en blanco si no deseas cambiarlas.</p>
                                    </div>

                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="newPassword" className="block text-sm font-bold text-gray-700 mb-1">Nueva contraseña</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                name="newPassword"
                                                id="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-gray-200 sm:text-sm p-3 border hover:border-gray-300 transition-colors"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-1">Confirmar</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                id="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-gray-200 sm:text-sm p-3 border hover:border-gray-300 transition-colors"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-8">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/dashboard')}
                                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <ArrowLeftIcon className="h-4 w-4" />
                                        Volver al Panel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-100 hover:bg-primary-500 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
