
import React from 'react';
import { PencilSquareIcon, TrashIcon, EyeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Content, TabType, ITEMS_PER_PAGE } from '../types';

interface ContentTableProps {
    filteredContents: Content[];
    selectedIds: Set<number>;
    toggleSelect: (id: number) => void;
    toggleSelectAll: () => void;
    handleOpenModal: (content?: Content) => void;
    handleDelete: (id: number) => void;
    isGlobalLoading: boolean;
    currentPage: number;
    currentTab: TabType;
}

export const ContentTable: React.FC<ContentTableProps> = ({
    filteredContents,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    handleOpenModal,
    handleDelete,
    isGlobalLoading,
    currentPage,
    currentTab
}) => {
    const paginatedContents = filteredContents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="mt-8">
            {/* Mobile Cards View - Show up to 2xl (1536px) because of sidebar space */}
            <div className="grid grid-cols-1 gap-4 2xl:hidden">
                {isGlobalLoading ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-forest/20 border-t-forest mb-2"></div>
                        <p className="text-sm text-gray-500">Cargando contenido...</p>
                    </div>
                ) : filteredContents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-400">No se encontró ningún contenido.</p>
                    </div>
                ) : (
                    paginatedContents.map((item) => (
                        <div key={item.id} className={`p-4 rounded-2xl border transition-all ${selectedIds.has(item.id) ? 'bg-forest/5 border-forest' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="flex items-start gap-3">
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-gray-300 text-forest focus:ring-forest"
                                        checked={selectedIds.has(item.id)}
                                        onChange={() => toggleSelect(item.id)}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {item.status === 'published' ? 'Publicado' : 'Borrador'}
                                        </span>
                                        <span className="inline-flex items-center rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-700 uppercase tracking-wider">
                                            {item.type === 'meditation' ? 'Meditación' : `Artículo ${item.category || ''}`}
                                        </span>
                                        {item.author?.first_name === 'ArunachalaBot' && (
                                            <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                                <SparklesIcon className="w-3 h-3" /> IA
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-base font-bold text-gray-900 leading-tight">
                                        {item.title}
                                    </h4>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2 pt-3 border-t border-gray-50">
                                <button
                                    onClick={() => handleOpenModal(item)}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-forest/10 hover:text-forest transition-all"
                                >
                                    <PencilSquareIcon className="h-4 w-4" /> Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                                >
                                    <TrashIcon className="h-4 w-4" /> Borrar
                                </button>
                                <a
                                    href={item.type === 'meditation' ? `/meditaciones/${item.slug}` : `/blog/${item.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-500 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all"
                                >
                                    <EyeIcon className="h-4 w-4" /> Ver
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View - Only from 2xl (1536px) onwards */}
            <div className="hidden 2xl:flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-sm ring-1 ring-gray-200 sm:rounded-2xl bg-white border border-gray-100">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th scope="col" className="relative py-4 pl-4 pr-3 sm:pl-6 w-12">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-forest focus:ring-forest"
                                                checked={filteredContents.length > 0 && selectedIds.size === filteredContents.length}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider sm:pl-0">Título</th>
                                        <th scope="col" className="hidden lg:table-cell px-3 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo</th>
                                        {currentTab !== 'meditation' && (
                                            <th scope="col" className="hidden lg:table-cell px-3 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Categoría</th>
                                        )}
                                        <th scope="col" className="hidden sm:table-cell px-3 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                                        <th scope="col" className="hidden xl:table-cell px-3 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Autor</th>
                                        <th scope="col" className="py-4 pl-3 pr-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider sm:pr-6 min-w-[120px]">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {isGlobalLoading ? (
                                        <tr><td colSpan={7} className="text-center py-10">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-forest/20 border-t-forest mr-2 align-middle"></div>
                                            <span className="text-sm text-gray-400 font-medium">Cargando...</span>
                                        </td></tr>
                                    ) : filteredContents.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-10 text-gray-400 italic text-sm">No hay contenido en esta sección.</td></tr>
                                    ) : (
                                        paginatedContents.map((item) => (
                                            <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${selectedIds.has(item.id) ? 'bg-forest/5' : 'bg-white'}`}>
                                                <td className="relative py-4 pl-4 pr-3 sm:pl-6">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-forest focus:ring-forest"
                                                        checked={selectedIds.has(item.id)}
                                                        onChange={() => toggleSelect(item.id)}
                                                    />
                                                </td>
                                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 max-w-md">
                                                    <div className="truncate" title={item.title}>{item.title}</div>
                                                </td>
                                                <td className="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                                                    {item.type === 'meditation' ? 'Meditación' : (item.type === 'announcement' ? 'Noticia' : 'Artículo')}
                                                </td>
                                                {currentTab !== 'meditation' && (
                                                    <td className="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{item.category || '-'}</td>
                                                )}
                                                <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                                                    ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {item.status === 'published' ? 'Publicado' : 'Borrador'}
                                                    </span>
                                                </td>
                                                <td className="hidden xl:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-medium">
                                                    {item.author?.first_name === 'ArunachalaBot' ? (
                                                        <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                            <SparklesIcon className="w-3 h-3" /> IA
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-600">{item.author?.first_name || 'Admin'}</span>
                                                    )}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-forest hover:bg-forest/5 rounded-lg transition-all" title="Editar">
                                                            <PencilSquareIcon className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Borrar">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                        <a
                                                            href={item.type === 'meditation' ? `/meditaciones/${item.slug}` : `/blog/${item.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                            title="Ver en la web"
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
