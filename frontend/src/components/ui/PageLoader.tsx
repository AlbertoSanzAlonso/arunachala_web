import React from 'react';
import { useTranslation } from 'react-i18next';

const PageLoader: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bone/90 backdrop-blur-sm">
            <div
                role="status"
                aria-label={t('common.loading', 'Cargando...')}
                className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-forest/20 border-t-forest animate-spin opacity-80"
            />
            <span className="sr-only">{t('common.loading', 'Cargando...')}</span>
        </div>
    );
};

export default PageLoader;
