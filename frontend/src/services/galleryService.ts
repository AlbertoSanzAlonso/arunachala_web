import api from './api';

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
        const response = await api.get<GalleryImage[]>(`/gallery/${category ? `?category=${category}` : ''}`);
        return response.data;
    },

    upload: async (formData: FormData) => {
        const response = await api.post<GalleryImage>('/gallery/upload', formData);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/gallery/${id}`);
    },

    deleteMultiple: async (ids: number[]) => {
        await api.post('/gallery/delete-multiple', { ids });
    },

    reorder: async (items: { id: number, position: number }[]) => {
        await api.post('/gallery/reorder', items);
    },

    crop: async (id: number, formData: FormData) => {
        const response = await api.put<GalleryImage>(`/gallery/${id}/crop`, formData);
        return response.data;
    },

    update: async (id: number, data: Partial<GalleryImage>) => {
        const response = await api.put<GalleryImage>(`/gallery/${id}`, data);
        return response.data;
    }
};
