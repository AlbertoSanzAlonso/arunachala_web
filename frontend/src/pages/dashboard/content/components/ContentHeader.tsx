
import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ContentHeaderProps {
    onAdd: () => void;
}

export const ContentHeader: React.FC<ContentHeaderProps> = ({ onAdd }) => {
    return (
        <div className="sm:flex sm:items-center justify-between gap-4">
            <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold leading-6 text-gray-900">Gestor de Contenido</h1>
                <p className="mt-2 text-sm text-gray-700">
                    Gestiona los artículos de yoga, terapias y audios de meditación.
                </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                    type="button"
                    onClick={onAdd}
                    className="inline-flex items-center justify-center w-full sm:w-auto rounded-xl bg-forest px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-forest/10 hover:bg-forest/90 transition-all active:scale-95"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Crear Contenido
                </button>
            </div>
        </div>
    );
};
