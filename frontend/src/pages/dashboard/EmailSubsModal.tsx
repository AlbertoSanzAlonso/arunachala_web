import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface EmailSubsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (subject: string, content: string) => void;
    selectedCount: number;
    isSending: boolean;
}

export default function EmailSubsModal({ isOpen, onClose, onSend, selectedCount, isSending }: EmailSubsModalProps) {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !content) return;
        onSend(subject, content);
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <Transition.Root show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as="div"
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
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
                                <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-3xl border border-gray-100 flex flex-col max-h-[90vh]">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <PaperAirplaneIcon className="w-5 h-5 text-primary-500" />
                                                Enviar Correo a Suscriptores
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1 font-bold">Enviando a {selectedCount} suscriptor(es).</p>
                                        </div>
                                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                                        <div className="p-4 sm:p-6 space-y-4 flex flex-col flex-1 min-h-0 overflow-y-auto">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Asunto</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={subject}
                                                    onChange={e => setSubject(e.target.value)}
                                                    className="w-full rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500 p-3 border"
                                                    placeholder="Hola, tenemos novedades..."
                                                />
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Contenido</label>
                                                <div className="rounded-xl overflow-hidden border border-gray-200 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 bg-white" style={{ minHeight: '200px', height: 'min(300px, 40vh)' }}>
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={content}
                                                        onChange={setContent}
                                                        modules={modules}
                                                        style={{ height: 'calc(100% - 42px)' }}
                                                        className="h-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 p-4 sm:p-6 bg-gray-50 flex justify-end gap-3 rounded-b-3xl border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSending || !content || !subject}
                                                className="px-6 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center gap-2"
                                            >
                                                <PaperAirplaneIcon className="w-4 h-4" />
                                                {isSending ? 'Enviando...' : 'Enviar Correo'}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </div>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
