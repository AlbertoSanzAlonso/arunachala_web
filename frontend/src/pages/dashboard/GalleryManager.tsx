import React, { useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import { PhotoIcon, TrashIcon, ArrowsUpDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import PageLoader from '../../components/PageLoader';

interface GalleryImage {
    id: number;
    url: string;
    alt_text: string;
    category: string;
    position: number;
}

export default function GalleryManager() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [dragEnabled, setDragEnabled] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/gallery/');
            if (response.ok) {
                const data = await response.json();
                setImages(data);
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setIsUploading(true);
        const files = Array.from(e.target.files);

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'general'); // Default category for now

            try {
                await fetch('http://localhost:8000/api/gallery/upload', {
                    method: 'POST',
                    body: formData,
                });
            } catch (error) {
                console.error('Error uploading file:', file.name, error);
            }
        }

        await fetchImages();
        setIsUploading(false);
        // Reset input
        e.target.value = '';
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de querer borrar esta imagen?')) return;

        try {
            await fetch(`http://localhost:8000/api/gallery/${id}`, {
                method: 'DELETE',
            });
            setImages(images.filter(img => img.id !== id));
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const handleReorder = (newOrder: GalleryImage[]) => {
        setImages(newOrder);
        setHasChanges(true);
    };

    const saveOrder = async () => {
        try {
            // Map local index to position value
            const updates = images.map((img, index) => ({
                id: img.id,
                position: index
            }));

            const response = await fetch('http://localhost:8000/api/gallery/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                setHasChanges(false);
                setDragEnabled(false);
                fetchImages(); // Refresh to be sure
            }
        } catch (error) {
            console.error('Error saving order:', error);
        }
    };

    if (isLoading) return <PageLoader />;

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">Galería de Imágenes</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Sube fotos, ordénalas y gestiónalas. Las fotos se optimizan automáticamente a WebP.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-2">
                    {!dragEnabled && (
                        <button
                            type="button"
                            onClick={() => setDragEnabled(true)}
                            className="block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            <ArrowsUpDownIcon className="h-5 w-5 inline-block mr-1" />
                            Ordenar
                        </button>
                    )}

                    {dragEnabled && (
                        <button
                            type="button"
                            onClick={saveOrder}
                            disabled={!hasChanges}
                            className={`block rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm ${hasChanges
                                    ? 'bg-green-600 text-white hover:bg-green-500'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Guardar Orden
                        </button>
                    )}

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
                            className={`block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 cursor-pointer ${isUploading ? 'opacity-70 cursor-wait' : ''
                                }`}
                        >
                            {isUploading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <PhotoIcon className="h-5 w-5 inline-block mr-1" />}
                            {isUploading ? ' Subiendo...' : ' Subir Fotos'}
                        </label>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <Reorder.Group
                    axis="y"
                    values={images}
                    onReorder={handleReorder}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    as="ul" // Render as list but grid layout via CSS className
                >
                    {images.map((image) => (
                        <Reorder.Item
                            key={image.id}
                            value={image}
                            drag={dragEnabled}
                            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }} // Allow free drag inside group
                            dragElastic={0.1}
                            className={`relative group aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-gray-200 ${dragEnabled ? 'cursor-move ring-2 ring-primary-500 ring-offset-2' : ''
                                }`}
                        >
                            <img
                                src={`http://localhost:8000${image.url}`}
                                alt={image.alt_text || 'Gallery image'}
                                className="w-full h-full object-cover pointer-events-none" // Prevent img drag interacting with Reorder
                            />

                            {!dragEnabled && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handleDelete(image.id)}
                                        className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
                                        title="Eliminar"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            )}

                            {dragEnabled && (
                                <div className="absolute top-2 right-2 bg-white/80 p-1 rounded text-xs font-mono">
                                    #{image.position}
                                </div>
                            )}
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                {images.length === 0 && !isLoading && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay imágenes</h3>
                        <p className="mt-1 text-sm text-gray-500">Empieza subiendo algunas fotos.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
