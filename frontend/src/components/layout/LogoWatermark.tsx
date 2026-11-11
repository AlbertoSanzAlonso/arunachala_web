import React from 'react';
import { useLocation } from 'react-router-dom';

const HIDDEN_PREFIXES = [
    '/login',
    '/dashboard',
    '/forgot-password',
    '/reset-password',
];

const LogoWatermark: React.FC = () => {
    const { pathname } = useLocation();
    const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (hidden) return null;

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center"
        >
            <img
                src="/logo_transparent_v2.webp"
                alt=""
                draggable={false}
                className="w-[min(78vw,34rem)] max-h-[68vh] object-contain select-none opacity-[0.22]"
            />
        </div>
    );
};

export default LogoWatermark;
