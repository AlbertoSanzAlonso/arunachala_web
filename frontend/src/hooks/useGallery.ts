import { useState, useCallback, useEffect } from 'react';
import { galleryService, GalleryImage, GalleryCategory } from '../services/galleryService';

export const useGallery = (selectedCategory: GalleryCategory) => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<Record<GalleryCategory, number>>({
        home: 0, yoga: 0, therapies: 0, center: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

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

        for (const file of fileArray) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', selectedCategory);

            try {
                await galleryService.upload(formData);
            } catch (error) {
                console.error('Error uploading file:', file.name, error);
            }
        }

        await fetchImages();
        await fetchCounts();
        setIsUploading(false);
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

    const toggleMainImage = async (id: number) => {
        const image = images.find(img => img.id === id);
        if (!image) return;

        // Using simple text tagging convention: "[MAIN]" in alt_text
        const isCurrentlyMain = image.alt_text?.includes('[MAIN]');

        try {
            if (!isCurrentlyMain) {
                // Determine previous main and demote it
                const previousMain = images.find(img => img.alt_text?.includes('[MAIN]'));
                if (previousMain) {
                    const newAlt = previousMain.alt_text.replace('[MAIN]', '').trim();
                    const updatedPrev = await galleryService.update(previousMain.id, { alt_text: newAlt });
                    setImages(prev => prev.map(img => img.id === updatedPrev.id ? updatedPrev : img));
                }

                // Promote new main
                const newAlt = `${image.alt_text || ''} [MAIN]`.trim();
                const updatedImage = await galleryService.update(id, { alt_text: newAlt });
                setImages(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
            } else {
                // Demote if clicking same one (optional, maybe we want at least one main? User said "select the main one", usually means radio behavior)
                // But allowing deselect is fine.
                const newAlt = image.alt_text.replace('[MAIN]', '').trim();
                const updatedImage = await galleryService.update(id, { alt_text: newAlt });
                setImages(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
            }
        } catch (error) {
            console.error('Error toggling main image:', error);
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
        deleteImage,
        deleteMultipleImages,
        saveOrder,
        cropImage,
        toggleMainImage
    };
};
