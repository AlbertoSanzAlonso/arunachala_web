
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TagSelector } from '../../../../components/dashboard/TagSelector';
import RichTextEditor from '../../../../components/dashboard/RichTextEditor';
import CropModal from '../../../../components/ui/modals/CropModal';
import { getContentThumbnailSrc } from '../../../../utils/imageUtils';
import { Content } from '../types';

interface ContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingContent: Content | null;
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    onSave: (e: React.FormEvent) => void;
    isSaving: boolean;
    uploading: boolean;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    editorSalt: string;
    isCropModalOpen: boolean;
    setIsCropModalOpen: (open: boolean) => void;
    imageSrc: string | null;
    setImageSrc: (src: string | null) => void;
    showCloseConfirm: boolean;
    setShowCloseConfirm: (show: boolean) => void;
}

export const ContentModal: React.FC<ContentModalProps> = ({
    isOpen,
    onClose,
    editingContent,
    formData,
    setFormData,
    onSave,
    isSaving,
    uploading,
    handleFileUpload,
    handleImageUpload,
    editorSalt,
    isCropModalOpen,
    setIsCropModalOpen,
    imageSrc,
    setImageSrc,
    showCloseConfirm,
    setShowCloseConfirm
}) => {
    const handleRequestClose = () => {
        // Simple comparison to check for changes
        const hasChanges = JSON.stringify(formData) !== JSON.stringify(editingContent || {
            title: '',
            type: formData.type,
            category: formData.category,
            status: 'draft',
            body: '',
            excerpt: '',
            thumbnail_url: '',
            media_url: '',
            tags: []
        });

        if (hasChanges && !isCropModalOpen) {
            setShowCloseConfirm(true);
        } else if (!isCropModalOpen) {
            onClose();
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleRequestClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog.Overlay className="fixed inset-0 bg-black/25 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl h-[90vh] flex flex-col transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-bark/10">
                                {/* Fixed Header */}
                                <div className="px-6 py-4 border-b border-bark/5 flex items-center justify-between shrink-0 bg-white z-30">
                                    <Dialog.Title as="h3" className="text-xl font-headers text-forest">
                                        {editingContent ? 'Editar Contenido' : 'Nuevo Contenido'}
                                    </Dialog.Title>
                                    <button
                                        onClick={handleRequestClose}
                                        className="p-2 text-bark/40 hover:text-forest hover:bg-forest/5 rounded-full transition-all focus:outline-none"
                                        title="Cerrar"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Scrollable Body */}
                                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                                    <form onSubmit={onSave} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="col-span-1 lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Título <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                            <select
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                            >
                                                <option value="article">Artículo</option>
                                                <option value="meditation">Meditación</option>
                                                <option value="announcement">Noticia / Anuncio</option>
                                            </select>
                                        </div>

                                        {formData.type === 'article' && (
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Categoría <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    required
                                                    value={formData.category || ''}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="yoga">Yoga</option>
                                                    <option value="therapy">Terapia</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="col-span-1 lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas</label>
                                            <TagSelector
                                                value={Array.isArray(formData.tags) ? formData.tags : []}
                                                onChange={(newTags) => setFormData({ ...formData, tags: newTags })}
                                                category={
                                                    formData.type === 'meditation' ? 'meditation' :
                                                        formData.type === 'article' ? (formData.category || 'general') :
                                                            'general'
                                                }
                                            />
                                        </div>

                                        <div className="col-span-1 lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Extracto (Resumen corto)</label>
                                            <input
                                                type="text"
                                                value={formData.excerpt || ''}
                                                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                            />
                                        </div>

                                        <div className="col-span-1 lg:col-span-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    {formData.type === 'meditation' ? 'Audio' : 'Cuerpo del Artículo'}
                                                </label>
                                            </div>
                                            {formData.type === 'meditation' ? (
                                                <div className="mt-1 space-y-2">
                                                    {formData.media_url && (
                                                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                                                            Archivo cargado: {formData.media_url.split('/').pop()}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="file"
                                                            accept=".mp3,.m4a,.wav,.aac,.ogg,.flac,.opus,audio/mpeg,audio/mp4,audio/wav,audio/aac,audio/ogg"
                                                            onChange={handleFileUpload}
                                                            disabled={uploading}
                                                            className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-md file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-forest file:text-white
                                                        hover:file:bg-forest/90"
                                                        />
                                                        {uploading && <span className="text-sm text-gray-500 animate-pulse">Subiendo y procesando...</span>}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-1">
                                                    <RichTextEditor
                                                        key={`${editingContent?.id ?? 'new'}-${editorSalt}`}
                                                        value={formData.body || ''}
                                                        onChange={(value) => setFormData((prev: any) => ({ ...prev, body: value }))}
                                                        placeholder="Escribe el contenido aquí..."
                                                        className="w-full"
                                                    />
                                                    <p className="mt-1 text-[10px] text-gray-400">
                                                        Usa la barra de herramientas para dar formato visual.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-span-1 lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Imagen Destacada</label>
                                            {(formData.thumbnail_url ||
                                                (formData.type === 'article' && (formData.category === 'yoga' || formData.category === 'therapy')) ||
                                                (formData.type === 'meditation')) && (
                                                    <div className="mt-2 mb-2 relative group">
                                                        <img
                                                            src={getContentThumbnailSrc(
                                                                formData.thumbnail_url,
                                                                formData.type,
                                                                formData.category
                                                            )}
                                                            onClick={() => {
                                                                if (formData.thumbnail_url) {
                                                                    const src = formData.thumbnail_url.startsWith('blob:')
                                                                        ? formData.thumbnail_url
                                                                        : getContentThumbnailSrc(
                                                                            formData.thumbnail_url,
                                                                            formData.type,
                                                                            formData.category
                                                                        );
                                                                    setImageSrc(src);
                                                                    setIsCropModalOpen(true);
                                                                }
                                                            }}
                                                            title={formData.thumbnail_url ? "Haz clic para volver a recortar esta imagen" : ""}
                                                            style={{ cursor: formData.thumbnail_url ? 'pointer' : 'default' }}
                                                            alt="Destacada"
                                                            className={`h-32 w-auto object-cover rounded-md border border-gray-200 ${!formData.thumbnail_url ? 'opacity-30 grayscale' : ''}`}
                                                            onError={(e) => {
                                                                const target = e.currentTarget;
                                                                if (target.getAttribute('data-fallback')) {
                                                                    target.style.display = 'none';
                                                                    return;
                                                                }
                                                                target.setAttribute('data-fallback', 'true');
                                                                target.src = getContentThumbnailSrc(
                                                                    null,
                                                                    formData.type,
                                                                    formData.category
                                                                );
                                                                target.className = "h-32 w-auto object-contain p-4 opacity-30 grayscale rounded-md border border-gray-200";
                                                            }}
                                                        />
                                                        {!formData.thumbnail_url && (
                                                            <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                                                                Imagen por defecto (basada en {formData.type === 'meditation' ? 'meditación' : 'categoría'})
                                                            </span>
                                                        )}
                                                        {formData.thumbnail_url && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, thumbnail_url: '' })}
                                                                className="text-xs text-red-600 mt-1 hover:underline block"
                                                            >
                                                                Eliminar imagen (usar valor por defecto)
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        disabled={uploading}
                                                        className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-md file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-forest file:text-white
                                                    hover:file:bg-forest/90"
                                                    />
                                                    {uploading && <span className="text-sm text-gray-500 animate-pulse">Subiendo...</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Estado</label>
                                            <select
                                                value={formData.status}
                                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-forest focus:ring-forest sm:text-sm p-2 border"
                                            >
                                                <option value="draft">Borrador</option>
                                                <option value="published">Publicado</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                            onClick={handleRequestClose}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving || uploading}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-forest px-6 py-2 text-sm font-medium text-white hover:bg-forest/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:opacity-50"
                                        >
                                            {isSaving ? 'Guardando...' : (editingContent ? 'Guardar Cambios' : 'Crear Contenido')}
                                        </button>
                                    </div>
                                </form>
                            </div>

                                {isCropModalOpen && imageSrc && (
                                    <CropModal
                                        open={isCropModalOpen}
                                        imageSrc={imageSrc}
                                        onClose={() => setIsCropModalOpen(false)}
                                        onSave={async (croppedBlob: Blob) => {
                                            // Convert blob to a temporary URL for preview
                                            const croppedUrl = URL.createObjectURL(croppedBlob);
                                            setFormData((prev: any) => ({ ...prev, thumbnail_url: croppedUrl }));
                                            setIsCropModalOpen(false);
                                            
                                            // Note: In a real scenario, you might want to upload this blob to the server immediately
                                            // but for now this maintains the existing logic flow.
                                        }}
                                        aspectRatio={16 / 9}
                                    />
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};
