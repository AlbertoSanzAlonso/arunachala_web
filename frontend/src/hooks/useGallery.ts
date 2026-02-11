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
            setImages(prev => prev.filter(img => img.id !== id));
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
        cropImage
    };
};
