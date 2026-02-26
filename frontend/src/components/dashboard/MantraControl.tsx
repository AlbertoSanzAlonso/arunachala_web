import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, CheckCircleIcon, PlusIcon, TrashIcon, BookmarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../config';
import ConfirmModal from '../ConfirmModal';

interface Mantra {
    id: number;
    text_sanskrit: string;
    translation: string;
    is_predefined: boolean;
    is_active: boolean;
}

export default function MantraControl() {
    const [dailyMantra, setDailyMantra] = useState<Mantra | null>(null);
    const [allMantras, setAllMantras] = useState<Mantra[]>([]);
    const [newSanskrit, setNewSanskrit] = useState('');
    const [newTranslation, setNewTranslation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Delete Confirmation
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [mantraToDelete, setMantraToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchDailyMantra();
        fetchAllMantras();
    }, []);

    const fetchDailyMantra = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mantras/daily`);
            if (response.ok) {
                const data = await response.json();
                setDailyMantra(data);
            }
        } catch (error) {
            console.error("Error fetching daily mantra:", error);
        }
    };

    const fetchAllMantras = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mantras`);
            if (response.ok) {
                const data = await response.json();
                setAllMantras(data);
            }
        } catch (error) {
            console.error("Error fetching all mantras:", error);
        }
    };

    const handleRegenerate = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/mantras/regenerate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setDailyMantra(data);
                setMessage({ type: 'success', text: 'Mantra regenerado correctamente' });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Regenerate failed:", response.status, errorData);
                setMessage({ type: 'error', text: `Error ${response.status}: No se pudo regenerar el mantra` });
            }
        } catch (error) {
            console.error("Regenerate error:", error);
            setMessage({ type: 'error', text: 'Error de conexión al regenerar mantra' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCustom = async (asDaily: boolean = false) => {
        if (!newSanskrit || !newTranslation) return;
        setIsLoading(true);
        setMessage(null);
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/mantras?set_as_daily=${asDaily}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text_sanskrit: newSanskrit,
                    translation: newTranslation
                })
            });
            if (response.ok) {
                const data = await response.json();
                if (asDaily) setDailyMantra(data);
                setNewSanskrit('');
                setNewTranslation('');
                fetchAllMantras();
                setMessage({ type: 'success', text: asDaily ? 'Mantra fijado como diario' : 'Mantra guardado en la biblioteca' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al guardar mantra' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setMantraToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (mantraToDelete === null) return;
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/mantras/${mantraToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                if (dailyMantra?.id === mantraToDelete) {
                    handleRegenerate();
                }
                fetchAllMantras();
                setMessage({ type: 'success', text: 'Mantra eliminado correctamente' });
            } else {
                setMessage({ type: 'error', text: 'Error al eliminar el mantra' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión al eliminar' });
        } finally {
            setDeleteModalOpen(false);
            setMantraToDelete(null);
        }
    };

    return (
        <div className="mt-12 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-semibold leading-6 text-gray-900 font-headers mb-6">Mantra del Día</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Daily Mantra */}
                <div className="bg-bone p-6 rounded-2xl border border-forest/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BookmarkIcon className="h-24 w-24 text-forest" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs uppercase tracking-widest text-forest/60 mb-2 font-medium">Mantra Actual</p>
                        {dailyMantra ? (
                            <>
                                <h3 className="text-2xl font-serif italic text-bark mb-2">"{dailyMantra.text_sanskrit}"</h3>
                                <p className="text-gray-600 mb-6 font-light">— {dailyMantra.translation}</p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-white text-forest border border-forest/20 rounded-full text-sm font-medium hover:bg-forest hover:text-white transition-all disabled:opacity-50"
                                    >
                                        <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                        Regenerar
                                    </button>

                                    {dailyMantra.id !== 0 && (
                                        <button
                                            onClick={() => handleDeleteClick(dailyMantra.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Eliminar de la biblioteca"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="h-32 flex items-center justify-center text-gray-400 italic">Cargando mantra...</div>
                        )}
                    </div>
                </div>

                {/* New Mantra Form */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-headers text-bark mb-4 flex items-center gap-2">
                        <PlusIcon className="h-5 w-5 text-forest" />
                        Añadir / Fijar Nuevo Mantra
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Frase en Sánscrito</label>
                            <input
                                type="text"
                                value={newSanskrit}
                                onChange={(e) => setNewSanskrit(e.target.value)}
                                placeholder="Ej: Om Namah Shivaya"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all font-serif italic text-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Traducción</label>
                            <input
                                type="text"
                                value={newTranslation}
                                onChange={(e) => setNewTranslation(e.target.value)}
                                placeholder="Ej: Honro la divinidad que habita en mí"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all text-sm"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => handleSaveCustom(true)}
                                disabled={isLoading || !newSanskrit}
                                className="flex-1 px-4 py-2 bg-forest text-white rounded-xl text-sm font-bold hover:bg-matcha transition-all shadow-md disabled:opacity-50"
                            >
                                Fijar para Hoy
                            </button>
                            <button
                                onClick={() => handleSaveCustom(false)}
                                disabled={isLoading || !newSanskrit}
                                className="px-4 py-2 bg-white text-forest border border-forest/20 rounded-xl text-sm font-medium hover:bg-forest/5 transition-all disabled:opacity-50"
                            >
                                Solo Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {message && (
                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            {/* Library Section */}
            <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">Biblioteca de Mantras</h3>
                <div className="flex flex-wrap gap-3">
                    {allMantras.map((mantra) => (
                        <div
                            key={mantra.id}
                            className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 group transition-all ${dailyMantra?.id === mantra.id
                                ? 'bg-forest text-white shadow-md ring-2 ring-forest/20'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <span className="font-serif italic">{mantra.text_sanskrit}</span>
                            {!mantra.is_predefined && (
                                <button
                                    onClick={() => handleDeleteClick(mantra.id)}
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-black/10 ${dailyMantra?.id === mantra.id ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-red-500'
                                        }`}
                                >
                                    <TrashIcon className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Mantra"
                message="¿Estás seguro de que quieres eliminar este mantra de la biblioteca?"
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDangerous={true}
            />
        </div>
    );
}
