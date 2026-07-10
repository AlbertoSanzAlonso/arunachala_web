import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
    className?: string;
    to?: string;
    label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = '', to = '/', label }) => {
    const { t } = useTranslation();
    const displayLabel = label ?? t('common.back_home', 'Volver al inicio');

    return (
        <Link
            to={to}
            className={`flex items-center gap-2 text-bark/60 hover:text-forest transition-colors duration-300 text-sm md:text-base font-light mb-8 hover:-translate-x-1 transform pl-4 md:pl-8 ${className}`}
        >
            <ArrowLeftIcon className="h-4 w-4 md:h-5 md:w-5" />
            <span>{displayLabel}</span>
        </Link>
    );
};

export default BackButton;
