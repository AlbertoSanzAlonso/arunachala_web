import { API_BASE_URL } from '../config';

export interface GalleryImage {
    id: number;
    url: string;
    alt_text: string;
    category: string;
    position: number;
}

export type GalleryCategory = 'home' | 'yoga' | 'therapies' | 'center';

export const galleryService = {
    getAll: async (category?: string) => {
        const response = await fetch(`${API_BASE_URL}/api/gallery/${category ? `?category=${category}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch gallery');
        return response.json();
    },

    upload: async (formData: FormData) => {
        const response = await fetch(`${API_BASE_URL}/api/gallery/upload`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload image');
        return response.json();
    },

    uploadBulk: async (formData: FormData) => {
        const response = await fetch(`${API_BASE_URL}/api/gallery/bulk-upload/`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload bulk');
        return response.json();
    },

    delete: async (id: number) => {
        const response = await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete image');
    },

    deleteMultiple: async (ids: number[]) => {
        const response = await fetch(`${API_BASE_URL}/api/gallery/delete-multiple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });
        if (!response.ok) throw new Error('Failed to delete multiple');
    },

    reorder: async (items: { id: number, position: number }[]) => {
        const response = await fetch(`${API_BASE_URL}/api/gallery/reorder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items)
        });
        if (!response.ok) throw new Error('Failed to reorder');
    },

    crop: async (id: number, formData: FormData) => {
        const response = await fetch(`${API_BASE_URL}/api/gallery/${id}/crop`, {
            method: 'PUT',
            body: formData
        });
        if (!response.ok) throw new Error('Failed to crop image');
        return response.json();
    },

    update: async (id: number, data: Partial<GalleryImage>) => {
        const response = await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update image');
        return response.json();
    }
};
