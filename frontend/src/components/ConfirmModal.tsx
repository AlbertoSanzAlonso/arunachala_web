import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    zIndex?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger',
    zIndex = 'z-[100]'
}) => {
    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className={`relative ${zIndex}`} onClose={onClose}>
                <Transition.Child
                    as="div"
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as="div"
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            className="relative transform overflow-hidden rounded-[32px] bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-8 border border-gray-100"
                        >
                            <Dialog.Panel as="div">
                                <div className="sm:flex sm:items-start">
                                    <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${type === 'danger' ? 'bg-red-50 text-red-600' :
                                        type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-primary-50 text-primary-600'
                                        } sm:mx-0 sm:h-10 sm:w-10`}>
                                        <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                        <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 font-headers">
                                            {title}
                                        </Dialog.Title>
                                        <div className="mt-2 text-sm text-gray-500 leading-relaxed italic">
                                            {message}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3 relative z-10">
                                    <button
                                        type="button"
                                        className={`w-full sm:w-auto px-6 py-3 text-sm font-bold text-white rounded-2xl transition-all shadow-lg touch-manipulation pointer-events-auto ${type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' :
                                            type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-primary-500 hover:bg-primary-600 shadow-primary-200'
                                            }`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onConfirm();
                                        }}
                                        onTouchEnd={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onConfirm();
                                        }}
                                    >
                                        {confirmText}
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all border border-gray-100 touch-manipulation pointer-events-auto"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onClose();
                                        }}
                                        onTouchEnd={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onClose();
                                        }}
                                    >
                                        {cancelText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default ConfirmModal;
