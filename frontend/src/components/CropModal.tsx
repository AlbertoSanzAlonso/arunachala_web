import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import getCroppedImg from '../utils/cropImage';

interface CropModalProps {
    open: boolean;
    onClose: () => void;
    imageSrc: string;
    onSave: (croppedBlob: Blob) => void;
    aspectRatio?: number;
    cropShape?: 'rect' | 'round';
    zIndex?: string;
}

export default function CropModal({ open, onClose, imageSrc, onSave, aspectRatio, cropShape = 'rect', zIndex = 'z-[9999]' }: CropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [aspect, setAspect] = useState<number | undefined>(aspectRatio);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels || isProcessing) return;

        setIsProcessing(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedBlob) {
                onSave(croppedBlob);
            } else {
                alert('No se pudo generar el recorte. Inténtalo de nuevo.');
            }
        } catch (e) {
            console.error('Error al recortar:', e);
            alert('Error al procesar la imagen. Asegúrate de que el formato es compatible.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Transition.Root show={open} as={Fragment}>
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
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as="div"
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <div>
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-gray-100 flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="mx-auto flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                                                <ScissorsIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                                            </div>
                                            <div className="ml-4">
                                                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                                    Recortar Imagen
                                                </Dialog.Title>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none touch-manipulation pointer-events-auto relative z-10"
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
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>

                                    <div className="relative h-[50vh] bg-gray-900 overflow-hidden">
                                        <Cropper
                                            image={imageSrc}
                                            crop={crop}
                                            zoom={zoom}
                                            aspect={aspect}
                                            cropShape={cropShape}
                                            onCropChange={setCrop}
                                            onCropComplete={onCropComplete}
                                            onZoomChange={setZoom}
                                        />
                                    </div>

                                    <div className="bg-white px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 gap-3 relative z-20">
                                        <button
                                            type="button"
                                            disabled={isProcessing}
                                            className={`inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation pointer-events-auto relative z-10`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSave();
                                            }}
                                            onTouchEnd={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSave();
                                            }}
                                        >
                                            {isProcessing ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                    Procesando...
                                                </div>
                                            ) : 'Guardar Recorte'}
                                        </button>

                                        <div className="flex gap-2 mr-auto mt-4 sm:mt-0">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setAspect(undefined);
                                                }}
                                                onTouchEnd={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setAspect(undefined);
                                                }}
                                                className={`px-3 py-1 rounded-md text-xs font-medium border touch-manipulation pointer-events-auto relative z-10 ${!aspect ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                Libre
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setAspect(1);
                                                }}
                                                onTouchEnd={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setAspect(1);
                                                }}
                                                className={`px-3 py-1 rounded-md text-xs font-medium border touch-manipulation pointer-events-auto relative z-10 ${aspect === 1 ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                1:1
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setAspect(3 / 4);
                                                }}
                                                onTouchEnd={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setAspect(3 / 4);
                                                }}
                                                className={`px-3 py-1 rounded-md text-xs font-medium border touch-manipulation pointer-events-auto relative z-10 ${aspect === 3 / 4 ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                3:4
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setAspect(9 / 16);
                                                }}
                                                onTouchEnd={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setAspect(9 / 16);
                                                }}
                                                className={`px-3 py-1 rounded-md text-xs font-medium border touch-manipulation pointer-events-auto relative z-10 ${aspect === 9 / 16 ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                9:16
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setAspect(4 / 3);
                                                }}
                                                onTouchEnd={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setAspect(4 / 3);
                                                }}
                                                className={`px-3 py-1 rounded-md text-xs font-medium border touch-manipulation pointer-events-auto relative z-10 ${aspect === 4 / 3 ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                4:3
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setAspect(16 / 9);
                                                }}
                                                onTouchEnd={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setAspect(16 / 9);
                                                }}
                                                className={`px-3 py-1 rounded-md text-xs font-medium border touch-manipulation pointer-events-auto relative z-10 ${aspect === 16 / 9 ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                16:9
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 mt-4 sm:mt-0 px-4">
                                            <span className="text-xs text-gray-500">Zoom</span>
                                            <input
                                                type="range"
                                                value={zoom}
                                                min={1}
                                                max={3}
                                                step={0.1}
                                                aria-labelledby="Zoom"
                                                onChange={(e) => setZoom(Number(e.target.value))}
                                                className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto touch-manipulation pointer-events-auto relative z-10"
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
                                            Cancelar
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </div>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
