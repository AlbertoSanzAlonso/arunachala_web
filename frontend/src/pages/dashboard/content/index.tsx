
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import { useToast } from '../../../hooks/useToast';
import ToastNotification from '../../../components/ui/ToastNotification';
import PageLoader from '../../../components/ui/PageLoader';

import { ITEMS_PER_PAGE } from './types';
import { ContentHeader } from './components/ContentHeader';
import { ContentTabs } from './components/ContentTabs';
import { ContentFilters } from './components/ContentFilters';
import { ContentTable } from './components/ContentTable';
import { ContentModal } from './components/ContentModal';
import { useContentLogic } from './hooks/useContentLogic';

export default function ContentManager() {
    const toast = useToast();
    const logic = useContentLogic();

    return (
        <>
            {(logic.isSaving || logic.uploading) && <PageLoader />}
            <ToastNotification toasts={toast.toasts} onRemove={toast.removeToast} />

            <div className="px-4 sm:px-6 lg:px-8">
                <ContentHeader onAdd={() => logic.handleOpenModal()} />
                
                <ContentTabs 
                    currentTab={logic.currentTab} 
                    onTabChange={(tab) => { logic.setCurrentTab(tab); logic.setCurrentPage(1); }} 
                    contents={logic.contents} 
                />

                <ContentFilters 
                    searchTerm={logic.searchTerm}
                    setSearchTerm={logic.setSearchTerm}
                    showSuggestions={logic.showSuggestions}
                    setShowSuggestions={logic.setShowSuggestions}
                    searchSuggestions={logic.searchSuggestions}
                    filterType={logic.filterType}
                    setFilterType={logic.setFilterType}
                    filterValue={logic.filterValue}
                    setFilterValue={logic.setFilterValue}
                    filterAuthor={logic.filterAuthor}
                    setFilterAuthor={logic.setFilterAuthor}
                    dateSort={logic.dateSort}
                    setDateSort={logic.setDateSort}
                    selectedIdsCount={logic.selectedIds.size}
                    onBulkDelete={() => logic.openDeleteModal()}
                />

                <ContentTable 
                    filteredContents={logic.filteredContents}
                    selectedIds={logic.selectedIds}
                    toggleSelect={logic.toggleSelect}
                    toggleSelectAll={logic.toggleSelectAll}
                    handleOpenModal={logic.handleOpenModal}
                    handleDelete={logic.openDeleteModal}
                    isGlobalLoading={logic.isGlobalLoading}
                    currentPage={logic.currentPage}
                    currentTab={logic.currentTab}
                />

                {/* Pagination */}
                {Math.ceil(logic.filteredContents.length / ITEMS_PER_PAGE) > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8 mb-4">
                         <button onClick={() => logic.setCurrentPage(1)} disabled={logic.currentPage === 1} className="p-2 disabled:opacity-30">«</button>
                         <button onClick={() => logic.setCurrentPage(prev => Math.max(1, prev - 1))} disabled={logic.currentPage === 1} className="p-2 disabled:opacity-30">‹</button>
                         <span className="text-sm font-bold">Página {logic.currentPage} de {Math.ceil(logic.filteredContents.length / ITEMS_PER_PAGE)}</span>
                         <button onClick={() => logic.setCurrentPage(prev => Math.min(Math.ceil(logic.filteredContents.length / ITEMS_PER_PAGE), prev + 1))} disabled={logic.currentPage === Math.ceil(logic.filteredContents.length / ITEMS_PER_PAGE)} className="p-2 disabled:opacity-30">›</button>
                         <button onClick={() => logic.setCurrentPage(Math.ceil(logic.filteredContents.length / ITEMS_PER_PAGE))} disabled={logic.currentPage === Math.ceil(logic.filteredContents.length / ITEMS_PER_PAGE)} className="p-2 disabled:opacity-30">»</button>
                    </div>
                )}

                <ContentModal 
                    isOpen={logic.isModalOpen}
                    onClose={() => logic.setIsModalOpen(false)}
                    editingContent={logic.editingContent}
                    formData={logic.formData}
                    setFormData={logic.setFormData}
                    onSave={logic.handleSave}
                    isSaving={logic.isSaving}
                    uploading={logic.uploading}
                    handleFileUpload={logic.handleFileUpload}
                    handleImageUpload={logic.handleImageUpload}
                    editorSalt={logic.editorSalt}
                    isCropModalOpen={logic.isCropModalOpen}
                    setIsCropModalOpen={logic.setIsCropModalOpen}
                    imageSrc={logic.imageSrc}
                    setImageSrc={logic.setImageSrc}
                    showCloseConfirm={logic.showCloseConfirm}
                    setShowCloseConfirm={logic.setShowCloseConfirm}
                />

                {/* Delete Confirmation Modal */}
                <Transition.Root show={logic.isDeleteModalOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-[90]" onClose={() => logic.setIsDeleteModalOpen(false)}>
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
                            <div className="flex min-h-full items-center justify-center p-4">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                        <div className="flex items-center gap-3 text-red-600 mb-4">
                                            <ExclamationTriangleIcon className="h-6 w-6" />
                                            <Dialog.Title as="h3" className="text-lg font-bold">Confirmar eliminación</Dialog.Title>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            ¿Estás seguro de que quieres eliminar el contenido seleccionado? Esta acción no se puede deshacer.
                                        </p>
                                        <div className="mt-6 flex justify-end gap-3">
                                            <button 
                                                type="button"
                                                onClick={() => logic.setIsDeleteModalOpen(false)} 
                                                onTouchEnd={() => logic.setIsDeleteModalOpen(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                            >
                                                Cancelar
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={logic.handleDelete} 
                                                onTouchEnd={logic.handleDelete}
                                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition.Root>

                {/* Close Confirmation Modal */}
                <Transition.Root show={logic.showCloseConfirm} as={Fragment}>
                    <Dialog as="div" className="relative z-[9999]" onClose={() => logic.setShowCloseConfirm(false)}>
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
                            <div className="flex min-h-full items-center justify-center p-4">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                        <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 mb-2">Cambios sin guardar</Dialog.Title>
                                        <p className="text-sm text-gray-500">¿Estás seguro de que quieres cerrar? Los cambios se perderán.</p>
                                        <div className="mt-6 flex justify-end gap-3">
                                            <button 
                                                type="button"
                                                onClick={() => logic.setShowCloseConfirm(false)} 
                                                onTouchEnd={() => logic.setShowCloseConfirm(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                            >
                                                Seguir editando
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => { logic.setShowCloseConfirm(false); logic.setIsModalOpen(false); }} 
                                                onTouchEnd={() => { logic.setShowCloseConfirm(false); logic.setIsModalOpen(false); }}
                                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                            >
                                                Cerrar sin guardar
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition.Root>

                {/* Quick Publication Prompt */}
                <Transition.Root show={logic.showPublicationPrompt} as={Fragment}>
                    <Dialog as="div" className="relative z-[90]" onClose={() => logic.setShowPublicationPrompt(false)}>
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
                            <div className="flex min-h-full items-center justify-center p-4">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                        <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 mb-2">Contenido guardado como borrador</Dialog.Title>
                                        <p className="text-sm text-gray-500">¿Quieres publicarlo ahora mismo?</p>
                                        <div className="mt-6 flex justify-end gap-3">
                                            <button 
                                                type="button"
                                                onClick={() => logic.setShowPublicationPrompt(false)} 
                                                onTouchEnd={() => logic.setShowPublicationPrompt(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                            >
                                                Mantener borrador
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={logic.handleQuickPublish} 
                                                onTouchEnd={logic.handleQuickPublish}
                                                className="px-4 py-2 text-sm font-medium text-white bg-forest rounded-md hover:bg-forest/90"
                                            >
                                                Publicar ahora
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition.Root>
            </div>
        </>
    );
}
