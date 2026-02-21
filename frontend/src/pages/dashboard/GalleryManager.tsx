import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Reorder } from 'framer-motion';
import { PhotoIcon, TrashIcon, ArrowsUpDownIcon, ArrowPathIcon, CheckCircleIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import PageLoader from '../../components/PageLoader';
import ConfirmModal from '../../components/ConfirmModal';
import CropModal from '../../components/CropModal';
import { useGallery } from '../../hooks/useGallery';
import type { GalleryCategory, GalleryImage } from '../../services/galleryService';
import { getImageUrl } from '../../utils/imageUtils';

const CATEGORIES: { value: GalleryCategory; label: string }[] = [
    { value: 'home', label: 'Home' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'therapies', label: 'Terapias' },
    { value: 'center', label: 'Centro' },
];

export default function GalleryManager() {
    const [searchParams, setSearchParams] = useSearchParams();

    // UI State
    const initialCategory = (searchParams.get('category') as GalleryCategory) || 'home';
    const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>(initialCategory);

    // Sync URL when category changes
    useEffect(() => {
        setSearchParams(prev => {
            prev.set('category', selectedCategory);
            return prev;
        }, { replace: true });
    }, [selectedCategory, setSearchParams]);

    const [dragEnabled, setDragEnabled] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<number | null>(null);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [croppingImage, setCroppingImage] = useState<GalleryImage | null>(null);

    // Business Logic Hook
    const {
        images,
        setImages,
        categoryCounts,
        isLoading,
        isUploading,
        uploadImages,
        uploadProgress,
        deleteImage,
        deleteMultipleImages,
        saveOrder,
        cropImage
    } = useGallery(selectedCategory);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        await uploadImages(e.target.files);
        e.target.value = '';
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.types.includes('Files')) {
            setIsDragging(false);
            await uploadImages(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setImageToDelete(id);
    };

    const toggleIdSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const confirmDelete = async () => {
        if (imageToDelete === null && selectedIds.length === 0) return;

        if (isBulkDeleting) {
            await deleteMultipleImages(selectedIds);
            setSelectedIds([]);
            setSelectionMode(false);
        } else if (imageToDelete !== null) {
            await deleteImage(imageToDelete);
        }

        setImageToDelete(null);
        setIsBulkDeleting(false);
    };

    const handleSaveCrop = async (croppedBlob: Blob) => {
        if (!croppingImage) return;
        await cropImage(croppingImage.id, croppedBlob);
        setCroppingImage(null);
    };

    const handleReorder = (newOrder: GalleryImage[]) => {
        setImages(newOrder);
        setHasChanges(true);
    };

    const handleSaveOrder = async () => {
        await saveOrder(images);
        setHasChanges(false);
        setDragEnabled(false);
    };

    const handleCategoryChange = (category: GalleryCategory) => {
        setSelectedCategory(category);
        setDragEnabled(false);
        setSelectionMode(false);
        setSelectedIds([]);
        setHasChanges(false);
    };

    if (isLoading) return <PageLoader />;

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`min-h-screen transition-colors duration-200 rounded-lg ${isDragging ? 'bg-primary-50 ring-4 ring-primary-500 ring-inset' : ''}`}
        >
            {isDragging && (
                <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-primary-500">
                        <ArrowPathIcon className="h-12 w-12 text-primary-600 mx-auto mb-2 animate-bounce" />
                        <h3 className="text-xl font-bold text-gray-900">Suelta para subir</h3>
                    </div>
                </div>
            )}

            {isUploading && (
                <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex items-center">
                    <div className="bg-white px-6 py-4 rounded-xl shadow-2xl border-l-4 border-forest animate-fadeIn flex items-center gap-4">
                        <div className="relative">
                            <ArrowPathIcon className="h-8 w-8 text-forest animate-spin" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                {uploadProgress.total > 1
                                    ? `Subiendo archivos (${uploadProgress.current}/${uploadProgress.total})`
                                    : 'Subiendo archivo...'}
                            </h3>
                            <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div
                                    className="h-full bg-forest transition-all duration-300"
                                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">Galería de Imágenes</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        {selectionMode
                            ? `Seleccionadas ${selectedIds.length} imágenes`
                            : 'Selecciona varias fotos, arrástralas aquí, ordénalas y gestiónalas por categoría.'}
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-2 flex-wrap justify-end">
                    {!dragEnabled && !selectionMode && (
                        <>
                            <button
                                type="button"
                                onClick={() => setSelectionMode(true)}
                                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                <CheckCircleIcon className="h-5 w-5 mr-1 text-gray-500" />
                                Seleccionar
                            </button>
                            <button
                                type="button"
                                onClick={() => setDragEnabled(true)}
                                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                <ArrowsUpDownIcon className="h-5 w-5 mr-1 text-gray-500" />
                                Ordenar
                            </button>
                        </>
                    )}

                    {selectionMode && (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectionMode(false);
                                    setSelectedIds([]);
                                }}
                                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (selectedIds.length > 0) {
                                        setIsBulkDeleting(true);
                                    }
                                }}
                                disabled={selectedIds.length === 0}
                                className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm text-white ${selectedIds.length > 0 ? 'bg-red-600 hover:bg-red-500' : 'bg-red-300 cursor-not-allowed'
                                    }`}
                            >
                                <TrashIcon className="h-5 w-5 mr-1" />
                                Eliminar ({selectedIds.length})
                            </button>
                        </>
                    )}

                    {dragEnabled && (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setDragEnabled(false);
                                    // fetchImages logic handled by hook if we want to reset? 
                                    // Actually just toggling drag off might be enough if we don't save
                                    // But typically we want a reset. Hook doesn't expose clean reset but changing cat does.
                                    setHasChanges(false);
                                }}
                                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                Volver
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveOrder}
                                disabled={!hasChanges}
                                className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${hasChanges ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Guardar Orden
                            </button>
                        </>
                    )}

                    {!dragEnabled && !selectionMode && (
                        <div className="relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleUpload}
                                className="hidden"
                                id="file-upload"
                                disabled={isUploading}
                            />
                            <label
                                htmlFor="file-upload"
                                className={`inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 cursor-pointer ${isUploading ? 'opacity-70 cursor-wait' : ''
                                    }`}
                            >
                                {isUploading ? <ArrowPathIcon className="h-5 w-5 animate-spin mr-1" /> : <PhotoIcon className="h-5 w-5 mr-1" />}
                                {isUploading
                                    ? (uploadProgress.total > 1
                                        ? ` Subiendo ${uploadProgress.current}/${uploadProgress.total}...`
                                        : ' Subiendo...')
                                    : ' Subir Fotos'}
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Tabs */}
            <div className="mt-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.value}
                            onClick={() => handleCategoryChange(category.value)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${selectedCategory === category.value
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {category.label}
                            <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${selectedCategory === category.value ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-900'
                                }`}>
                                {categoryCounts[category.value]}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-8">
                {dragEnabled ? (
                    <Reorder.Group
                        axis="y"
                        values={images}
                        onReorder={handleReorder}
                        className="space-y-3 max-w-3xl mx-auto"
                    >
                        {images.map((image) => (
                            <Reorder.Item
                                key={image.id}
                                value={image}
                                dragListener={dragEnabled}
                                className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm cursor-move hover:shadow-md transition-shadow"
                            >
                                <div className="h-16 w-24 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                    <img
                                        src={getImageUrl(image.url)}
                                        alt={image.alt_text}
                                        className="h-full w-full object-cover pointer-events-none select-none"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">Imagen #{image.id}</p>
                                    <p className="text-xs text-gray-500 truncate">Posición: {image.position}</p>
                                </div>
                                <div className="text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => handleDeleteClick(image.id)}>
                                    <TrashIcon className="h-5 w-5" />
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                ) : (
                    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image) => {
                            const isSelected = selectedIds.includes(image.id);
                            return (
                                <li
                                    key={image.id}
                                    onClick={() => selectionMode && toggleIdSelection(image.id)}
                                    className={`relative group aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 shadow-sm border-2 transition-all cursor-pointer ${isSelected ? 'border-primary-500 ring-2 ring-primary-200 scale-[0.98]' : 'border-gray-200 hover:border-primary-300'
                                        }`}
                                >
                                    <img
                                        src={getImageUrl(image.url)}
                                        alt={image.alt_text || 'Gallery image'}
                                        className={`w-full h-full object-cover transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                                    />

                                    {selectionMode && (
                                        <div className="absolute top-2 right-2 z-10">
                                            {isSelected ? (
                                                <CheckCircleIconSolid className="h-6 w-6 text-primary-500 bg-white rounded-full" />
                                            ) : (
                                                <div className="h-6 w-6 border-2 border-white rounded-full bg-black/20" />
                                            )}
                                        </div>
                                    )}

                                    {!selectionMode && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCroppingImage(image);
                                                }}
                                                className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                                                title="Recortar"
                                            >
                                                <ScissorsIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(image.id);
                                                }}
                                                className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                                                title="Eliminar"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>

                                        </div>
                                    )}

                                    {isSelected && <div className="absolute inset-0 bg-primary-500/10" />}
                                </li>
                            );
                        })}
                    </ul>
                )}

                {images.length === 0 && !isLoading && !isDragging && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg pointer-events-none">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay imágenes en {CATEGORIES.find(c => c.value === selectedCategory)?.label}</h3>
                        <p className="mt-1 text-sm text-gray-500">Arrastra archivos aquí o usa el botón.</p>
                    </div>
                )}
            </div>

            <ConfirmModal
                open={imageToDelete !== null || isBulkDeleting}
                onClose={() => {
                    setImageToDelete(null);
                    setIsBulkDeleting(false);
                }}
                onConfirm={confirmDelete}
                title={isBulkDeleting ? `¿Eliminar ${selectedIds.length} imágenes?` : "¿Seguro?"}
                message={isBulkDeleting
                    ? `Vas a eliminar permanentemente ${selectedIds.length} imágenes y sus archivos correspondientes. Esta acción no se puede deshacer.`
                    : "¿Seguro que quieres eliminar esta imagen? Esta acción eliminará el archivo permanentemente y no se puede deshacer."}
                confirmText="Eliminar"
                isDangerous={true}
            />

            {croppingImage && (
                <CropModal
                    open={!!croppingImage}
                    onClose={() => setCroppingImage(null)}
                    imageSrc={getImageUrl(croppingImage.url)}
                    onSave={handleSaveCrop}
                />
            )}
        </div>
    );
}
