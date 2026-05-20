
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../../config';
import { useToast } from '../../../../hooks/useToast';
import { Content } from '../types';

const CONTENT_PAYLOAD_KEYS = [
    'title', 'type', 'category', 'status', 'body', 'excerpt',
    'thumbnail_url', 'media_url', 'tags', 'author_id', 'translations',
] as const;

const isEphemeralUrl = (url?: string | null): boolean =>
    !!url && (url.startsWith('blob:') || url.startsWith('file:'));

/** Solo campos que acepta la API; evita enviar id, slug, author, etc. */
const buildContentPayload = (formData: Partial<Content>): Record<string, unknown> => {
    const payload: Record<string, unknown> = {};
    for (const key of CONTENT_PAYLOAD_KEYS) {
        const value = formData[key];
        if (value !== undefined) {
            payload[key] = value;
        }
    }
    if (payload.type === 'meditation') {
        payload.category = null;
    }
    return payload;
};

export const useContentPersistence = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleSave = useCallback(async (
        formData: Partial<Content>, 
        editingContent: Content | null,
        onSuccess: (data: Content) => void
    ) => {
        setIsSaving(true);
        try {
            const token = sessionStorage.getItem('access_token');
            let currentFormData = buildContentPayload(formData);

            // Miniatura recortada pendiente de subir (blob: solo válido en esta pestaña)
            if (isEphemeralUrl(currentFormData.thumbnail_url as string | undefined)) {
                setUploading(true);
                try {
                    const blobResp = await fetch(currentFormData.thumbnail_url!);
                    if (!blobResp.ok) {
                        throw new Error('blob_fetch_failed');
                    }
                    const blob = await blobResp.blob();
                    const file = new File([blob], 'cropped_image.webp', { type: 'image/webp' });
                    
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', file);
                    uploadFormData.append('folder', 'articles');

                    const uploadResponse = await fetch(`${API_BASE_URL}/api/content/upload-media`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: uploadFormData
                    });

                    if (!uploadResponse.ok) {
                        toast.error('No se pudo subir la imagen recortada. Vuelve a seleccionarla o guarda sin cambiar la miniatura.');
                        return;
                    }
                    const uploadData = await uploadResponse.json();
                    currentFormData.thumbnail_url = uploadData.url;
                } catch {
                    if (editingContent?.thumbnail_url && !isEphemeralUrl(editingContent.thumbnail_url)) {
                        currentFormData.thumbnail_url = editingContent.thumbnail_url;
                    } else {
                        delete currentFormData.thumbnail_url;
                    }
                    toast.error('La miniatura recortada ya no está disponible. Se guardará sin cambiar la imagen.');
                } finally {
                    setUploading(false);
                }
            }

            if (isEphemeralUrl(currentFormData.media_url as string | undefined)) {
                if (editingContent?.media_url && !isEphemeralUrl(editingContent.media_url)) {
                    currentFormData.media_url = editingContent.media_url;
                } else {
                    delete currentFormData.media_url;
                }
            }

            const url = editingContent ? `${API_BASE_URL}/api/content/${editingContent.id}` : `${API_BASE_URL}/api/content`;
            const method = editingContent ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(currentFormData)
            });

            if (response.ok) {
                const data = await response.json();
                queryClient.invalidateQueries({ queryKey: ['contents'] });
                onSuccess(data);
                if (editingContent || currentFormData.status !== 'draft') {
                    toast.success(editingContent ? 'Contenido actualizado correctamente' : 'Contenido creado correctamente');
                }
            } else {
                const errorData = await response.json().catch(() => null);
                toast.error(errorData?.detail || 'Error al guardar el contenido');
            }
        } catch (error) {
            toast.error('Error al conectar con el servidor');
        } finally {
            setIsSaving(false);
        }
    }, [queryClient, toast]);

    const handleDelete = useCallback(async (
        contentToDelete: number | null, 
        selectedIds: Set<number>,
        onSuccess: () => void
    ) => {
        if (!contentToDelete && selectedIds.size === 0) return;
        setIsSaving(true);
        try {
            const token = sessionStorage.getItem('access_token');
            if (contentToDelete) {
                const response = await fetch(`${API_BASE_URL}/api/content/${contentToDelete}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) toast.success('Contenido eliminado');
            } else {
                for (const id of Array.from(selectedIds)) {
                    await fetch(`${API_BASE_URL}/api/content/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                }
                toast.success(`${selectedIds.size} elementos eliminados`);
            }
            queryClient.invalidateQueries({ queryKey: ['contents'] });
            onSuccess();
        } catch (error) {
            toast.error('Error al eliminar');
        } finally {
            setIsSaving(false);
        }
    }, [queryClient, toast]);

    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const token = sessionStorage.getItem('access_token');
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('folder', 'meditations');

            const response = await fetch(`${API_BASE_URL}/api/content/upload-media`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });

            if (response.ok) {
                const data = await response.json();
                onComplete(data.url);
                toast.success('Archivo subido correctamente');
            } else {
                toast.error('Error al subir archivo');
            }
        } catch (error) {
            toast.error('Error de red');
        } finally {
            setUploading(false);
        }
    }, [toast]);

    const handleQuickPublish = useCallback(async (contentId: number, onSuccess: () => void) => {
        setIsSaving(true);
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/content/${contentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'published' })
            });
            if (response.ok) {
                queryClient.invalidateQueries({ queryKey: ['contents'] });
                onSuccess();
                toast.success('¡Contenido publicado con éxito!');
            }
        } finally {
            setIsSaving(false);
        }
    }, [queryClient, toast]);

    return {
        isSaving,
        uploading,
        handleSave,
        handleDelete,
        handleFileUpload,
        handleQuickPublish
    };
};
