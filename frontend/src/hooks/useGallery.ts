import { useState, useCallback, useEffect } from 'react';
import { galleryService, GalleryImage, GalleryCategory } from '../services/galleryService';

export const useGallery = (selectedCategory: GalleryCategory) => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<Record<GalleryCategory, number>>({
        home: 0, yoga: 0, therapies: 0, center: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

    const fetchImages = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await galleryService.getAll(selectedCategory);

            // Auto-assign MAIN if category is 'center' and none exists
            if (selectedCategory === 'center' && data.length > 0) {
                const hasMain = data.some(img => img.alt_text?.includes('[MAIN]'));
                if (!hasMain) {
                    const firstImage = data[0];
                    try {
                        const newAlt = `${firstImage.alt_text || ''} [MAIN]`.trim();
                        await galleryService.update(firstImage.id, { alt_text: newAlt });
                        // Update local state to reflect change immediately
                        firstImage.alt_text = newAlt;
                    } catch (err) {
                        console.error('Error setting default main image:', err);
                    }
                }
            }

            setImages(data);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory]);

    const fetchCounts = useCallback(async () => {
        try {
            const categories: GalleryCategory[] = ['home', 'yoga', 'therapies', 'center'];
            const newCounts = { ...categoryCounts };

            // Parallel fetching could be better but let's keep it simple/sequential 
            // or Promise.all for speed.
            await Promise.all(categories.map(async (cat) => {
                const data = await galleryService.getAll(cat);
                newCounts[cat] = data.length;
            }));

            setCategoryCounts(newCounts);
        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Initial load
    useEffect(() => {
        fetchImages();
        fetchCounts();
    }, [fetchImages, fetchCounts]);

    const uploadImages = async (files: FileList | null) => {
        if (!files?.length) return;

        setIsUploading(true);
        const fileArray = Array.from(files);
        setUploadProgress({ current: 0, total: fileArray.length });

        // We'll upload in chunks of 5 to not overwhelm the connection but still be fast
        const chunkSize = 5;
        for (let i = 0; i < fileArray.length; i += chunkSize) {
            const chunk = fileArray.slice(i, i + chunkSize);
            const formData = new FormData();
            chunk.forEach(file => formData.append('files', file));
            formData.append('category', selectedCategory);

            try {
                await galleryService.uploadBulk(formData);
                setUploadProgress(prev => ({ ...prev, current: Math.min(prev.total, i + chunk.length) }));
            } catch (error) {
                console.error('Error uploading bulk chunk:', error);
            }
        }

        await fetchImages();
        await fetchCounts();
        setIsUploading(false);
        setUploadProgress({ current: 0, total: 0 });
    };

    const deleteImage = async (id: number) => {
        try {
            await galleryService.delete(id);
            setImages(prev => {
                const wasMain = prev.find(img => img.id === id)?.alt_text?.includes('[MAIN]');
                const remaining = prev.filter(img => img.id !== id);

                // If we deleted the main image and there are others left, promote the first one
                if (wasMain && selectedCategory === 'center' && remaining.length > 0) {
                    const newMain = remaining[0];
                    const newAlt = `${newMain.alt_text || ''} [MAIN]`.trim();

                    // Fire and forget update
                    galleryService.update(newMain.id, { alt_text: newAlt }).catch(console.error);

                    return remaining.map(img => img.id === newMain.id ? { ...img, alt_text: newAlt } : img);
                }

                return remaining;
            });
            await fetchCounts();
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const deleteMultipleImages = async (ids: number[]) => {
        try {
            await galleryService.deleteMultiple(ids);
            setImages(prev => prev.filter(img => !ids.includes(img.id)));
            await fetchCounts();
        } catch (error) {
            console.error('Error removing multiple images:', error);
        }
    };

    const saveOrder = async (currentImages: GalleryImage[]) => {
        try {
            const updates = currentImages.map((img, index) => ({
                id: img.id,
                position: index
            }));
            await galleryService.reorder(updates);
            // Optionally refetch or just trust local state
        } catch (error) {
            console.error('Error saving order:', error);
        }
    };

    const cropImage = async (id: number, blob: Blob) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', blob, 'cropped.webp');

        try {
            const updatedImage = await galleryService.crop(id, formData);
            setImages(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
        } catch (error) {
            console.error('Error cropping image:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMainImage = async (id: number) => {
        const image = images.find(img => img.id === id);
        if (!image) return;

        const isCurrentlyMain = image.alt_text?.includes('[MAIN]');

        // If it's already main, do nothing (prevent deselecting)
        if (isCurrentlyMain) return;

        try {
            // Determine previous main and demote it
            const previousMain = images.find(img => img.alt_text?.includes('[MAIN]'));
            if (previousMain) {
                const newAlt = previousMain.alt_text.replace('[MAIN]', '').trim();
                // Optimistic update locally first
                setImages(prev => prev.map(img => img.id === previousMain.id ? { ...img, alt_text: newAlt } : img));
                // Then server update
                await galleryService.update(previousMain.id, { alt_text: newAlt });
            }

            // Promote new main
            const newAlt = `${image.alt_text || ''} [MAIN]`.trim();
            // Optimistic update locally
            setImages(prev => prev.map(img => img.id === id ? { ...img, alt_text: newAlt } : img));
            // Then server update
            await galleryService.update(id, { alt_text: newAlt });

        } catch (error) {
            console.error('Error toggling main image:', error);
            // Revert on error would be ideal, but for now simple error logging
            await fetchImages();
        }
    };

    return {
        images,
        setImages, // Exposed for local Reorder updates
        categoryCounts,
        isLoading,
        isUploading,
        fetchImages,
        uploadImages,
        uploadProgress,
        deleteImage,
        deleteMultipleImages,
        saveOrder,
        cropImage,
        toggleMainImage
    };
};
