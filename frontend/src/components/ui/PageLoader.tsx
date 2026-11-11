import React from 'react';
import { useTranslation } from 'react-i18next';
import lotusFlower from 'assets/images/lotus_flower.png';

const PageLoader: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bone/90 backdrop-blur-sm">
            <div role="status" aria-label={t('common.loading', 'Cargando...')}>
                <img
                    src={lotusFlower}
                    alt=""
                    aria-hidden="true"
                    className="h-16 md:h-24 w-auto animate-heartbeat opacity-80 drop-shadow-md"
                />
            </div>
            <span className="sr-only">{t('common.loading', 'Cargando...')}</span>
        </div>
    );
};

export default PageLoader;
