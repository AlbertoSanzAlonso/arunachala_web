import React from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../store/uiStore';

interface ShareButtonProps {
    url: string;
    title: string;
    text?: string;
    className?: string;
    iconClassName?: string;
    showLabel?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({
    url,
    title,
    text,
    className = "p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-forest hover:bg-white shadow-sm transition-all focus:outline-none",
    iconClassName = "w-6 h-6",
    showLabel = false
}) => {
    const { t } = useTranslation();
    const { addToast } = useUIStore();

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: text || t('common.share_text', 'Mira esto en Arunachala Yoga'),
                    url: fullUrl,
                });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error("Share failed:", err);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(fullUrl);
                addToast('success', t('common.copied_to_clipboard', 'Enlace copiado al portapapeles'));
            } catch (err) {
                console.error("Copy failed:", err);
                addToast('error', t('common.copy_failed', 'Error al copiar el enlace'));
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`flex items-center justify-center gap-2 transition-all duration-300 ${className}`}
            title={t('common.share', 'Compartir')}
        >
            <ShareIcon className={iconClassName} />
            {showLabel && (
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                    {t('common.share', 'Compartir')}
                </span>
            )}
        </button>
    );
};

export default ShareButton;
