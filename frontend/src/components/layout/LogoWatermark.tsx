import React from 'react';
import { useLocation } from 'react-router-dom';
import omSymbol from 'assets/images/om_symbol.png';
import lotusFlower from 'assets/images/lotus_flower.png';

const HIDDEN_PREFIXES = [
    '/login',
    '/dashboard',
    '/forgot-password',
    '/reset-password',
];

const INNER_SCROLL_PATHS = new Set(['/', '/clases-de-yoga', '/terapias-y-masajes']);

export function pageUsesInnerScroll(pathname: string) {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    return INNER_SCROLL_PATHS.has(path);
}

const SECTION_WATERMARKS: { test: (pathname: string) => boolean; src: string }[] = [
    {
        test: (pathname) =>
            pathname.startsWith('/clases-de-yoga') ||
            pathname.startsWith('/galeria/clases-de-yoga'),
        src: omSymbol,
    },
    {
        test: (pathname) =>
            pathname.startsWith('/terapias-y-masajes') ||
            pathname.startsWith('/terapias/') ||
            pathname.startsWith('/galeria/terapias-y-masajes'),
        src: lotusFlower,
    },
];

const LogoWatermark: React.FC = () => {
    const { pathname } = useLocation();
    const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (hidden) return null;

    const src = SECTION_WATERMARKS.find((entry) => entry.test(pathname))?.src
        ?? '/logo_transparent_v2.webp';

    // Home, yoga y terapias desplazan un contenedor interno. `fixed` se
    // recalcula con ese scroll y el logo salta. En el resto de páginas el
    // documento es el scroller: sticky lo mantiene en el centro del viewport.
    const frameClass = pageUsesInnerScroll(pathname)
        ? 'absolute inset-0'
        : 'sticky top-0 h-screen w-full -mb-[100vh]';

    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none z-[-1] flex items-center justify-center overflow-hidden [overflow-anchor:none] ${frameClass}`}
        >
            <img
                src={src}
                alt=""
                draggable={false}
                className="w-[min(90vw,42rem)] max-h-[80vh] object-contain select-none opacity-[0.22]"
            />
        </div>
    );
};

export default LogoWatermark;
