
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@heroicons/react/24/outline';


interface ArticleLightboxProps {
    selectedImage: string | null;
    isZoomed: boolean;
    onClose: () => void;
    onToggleZoom: () => void;
}

const ArticleLightbox: React.FC<ArticleLightboxProps> = ({ 
    selectedImage, 
    isZoomed, 
    onClose, 
    onToggleZoom 
}) => {


    return (
        <AnimatePresence>
            {selectedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10000] bg-forest/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-hidden"
                    onClick={onClose}
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-6 right-6 z-[10001] bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all border border-white/20"
                        onClick={onClose}
                    >
                        <XMarkIcon className="w-8 h-8" />
                    </button>

                    {/* Zoom Button */}
                    <button
                        className="absolute bottom-6 right-6 z-[10001] bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all border border-white/20 hidden md:block"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleZoom();
                        }}
                    >
                        {isZoomed ? <MagnifyingGlassMinusIcon className="w-6 h-6" /> : <MagnifyingGlassPlusIcon className="w-6 h-6" />}
                    </button>

                    {/* Image Container */}
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ 
                            scale: isZoomed ? 1.5 : 1, 
                            y: 0,
                            cursor: isZoomed ? 'zoom-out' : 'zoom-in'
                        }}
                        transition={{ duration: 0 }}
                        className={`max-w-full max-h-full flex items-center justify-center transition-all ${isZoomed ? 'overflow-auto' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleZoom();
                        }}
                    >
                        <img
                            src={selectedImage}
                            alt="Full screen view"
                            className="rounded-xl shadow-2xl max-w-full max-h-[90vh] object-contain select-none"
                            draggable={false}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ArticleLightbox;
