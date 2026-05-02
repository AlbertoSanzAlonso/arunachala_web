
import React from 'react';
import { 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    ChevronDoubleLeftIcon, 
    ChevronDoubleRightIcon 
} from '@heroicons/react/24/outline';

interface BlogPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const BlogPagination: React.FC<BlogPaginationProps> = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
}) => {
    if (totalPages <= 1) return null;

    // Calculate the range of pages to show (up to 3)
    const getPageNumbers = () => {
        const pages = [];
        let start = Math.max(1, currentPage - 1);
        let end = Math.min(totalPages, start + 2);
        
        // Adjust if we are at the last pages
        if (end === totalPages) {
            start = Math.max(1, end - 2);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mt-20 font-body">
            {/* First Page */}
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-forest/10 text-forest disabled:opacity-20 hover:bg-forest/5 transition-colors"
                title="Primera página"
            >
                <ChevronDoubleLeftIcon className="w-5 h-5" />
            </button>

            {/* Previous */}
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-full border border-forest/10 text-forest disabled:opacity-20 hover:bg-forest/5 transition-colors text-sm font-medium"
            >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="hidden md:inline">Anterior</span>
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-2 mx-2">
                {pages.map(pageNum => (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 text-sm font-bold ${
                            currentPage === pageNum 
                            ? 'bg-forest text-white shadow-md scale-110' 
                            : 'bg-white border border-forest/10 text-forest hover:bg-forest/5'
                        }`}
                    >
                        {pageNum}
                    </button>
                ))}
            </div>

            {/* Next */}
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-full border border-forest/10 text-forest disabled:opacity-20 hover:bg-forest/5 transition-colors text-sm font-medium"
            >
                <span className="hidden md:inline">Siguiente</span>
                <ChevronRightIcon className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-forest/10 text-forest disabled:opacity-20 hover:bg-forest/5 transition-colors"
                title="Última página"
            >
                <ChevronDoubleRightIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default BlogPagination;
