import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
    className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 text-bark/60 hover:text-forest transition-colors duration-300 text-sm md:text-base font-light mb-8 hover:-translate-x-1 transform ${className}`}
        >
            <ArrowLeftIcon className="h-4 w-4 md:h-5 md:w-5" />
            <span>Volver al inicio</span>
        </button>
    );
};

export default BackButton;
