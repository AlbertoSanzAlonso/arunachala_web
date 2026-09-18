import { API_BASE_URL } from '../config';

const PRODUCTION_SITE = 'https://www.yogayterapiasarunachala.es';

/** Rutas servidas desde frontend/public (Vercel), no desde la API. */
const SITE_PUBLIC_ASSETS: Record<string, string> = {
    '/logo_icon.webp': '/logo_icon.webp',
    '/gallery/articles/meditation_default.webp': '/gallery/articles/meditation_default.webp',
};

/** Rutas /static/ que deben resolverse en el sitio (no están en el volumen de la API). */
const STATIC_ON_SITE_ONLY = new Set([
    'gallery/articles/meditation_default.webp',
]);

export const DEFAULT_THUMBNAIL_PATHS = {
    meditation: '/gallery/articles/meditation_default.webp',
    yoga: '/static/gallery/articles/om_symbol.webp',
    therapy: '/static/gallery/articles/logo_icon.webp',
} as const;

export const getDefaultThumbnailPath = (type?: string, category?: string): string => {
    if (type === 'meditation') return DEFAULT_THUMBNAIL_PATHS.meditation;
    if (category === 'yoga') return DEFAULT_THUMBNAIL_PATHS.yoga;
    return DEFAULT_THUMBNAIL_PATHS.therapy;
};

const getSiteOrigin = (): string => {
    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }
    return PRODUCTION_SITE;
};

const getApiOrigin = (): string => API_BASE_URL.replace(/\/$/, '');

const isEphemeralUrl = (url: string): boolean =>
    url.startsWith('blob:') || url.startsWith('file:');

const resolveSitePublicAsset = (path: string): string => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (SITE_PUBLIC_ASSETS[normalized]) {
        return `${getSiteOrigin()}${SITE_PUBLIC_ASSETS[normalized]}`;
    }
    return `${getSiteOrigin()}${normalized}`;
};

/** Media en disco/API: /static/... */
const resolveApiStatic = (pathOnly: string): string =>
    `${getApiOrigin()}/static/${pathOnly.replace(/^\//, '')}`;

/**
 * Path de objeto si la URL es de un storage público legado
 * (.../storage/v1/object/public/<bucket>/...).
 */
const legacyPublicObjectPath = (url: string): string | null => {
    const marker = '/storage/v1/object/public/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const after = url.slice(idx + marker.length);
    const slash = after.indexOf('/');
    if (slash === -1) return null;
    return after.slice(slash + 1).split('?')[0];
};

/**
 * Returns a full URL for an image/audio asset.
 * - blob:/file: → '' (invalid cross-session; use UI fallback)
 * - URLs http de storage legado → API /static/...
 * - data: u otras http(s) → as-is (incl. MinIO / media.*)
 * - /gallery/... o /logo_icon.webp → sitio (Vercel public/)
 * - /static/... → API (disco local), salvo assets solo en el sitio
 * - other relative → API_BASE_URL
 */
export const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed || isEphemeralUrl(trimmed)) return '';

    const fromLegacy = legacyPublicObjectPath(trimmed);
    if (fromLegacy) {
        if (STATIC_ON_SITE_ONLY.has(fromLegacy)) {
            return resolveSitePublicAsset(`/gallery/articles/${fromLegacy.split('/').pop()}`);
        }
        return resolveApiStatic(fromLegacy);
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
        return trimmed;
    }

    if (trimmed.startsWith('/gallery/') || trimmed in SITE_PUBLIC_ASSETS) {
        return resolveSitePublicAsset(trimmed);
    }

    if (trimmed.startsWith('/logo_icon.webp')) {
        return resolveSitePublicAsset('/logo_icon.webp');
    }

    if (trimmed.startsWith('/static/')) {
        const pathOnly = trimmed.replace(/^\/static\//, '');
        if (STATIC_ON_SITE_ONLY.has(pathOnly)) {
            return resolveSitePublicAsset(`/gallery/articles/${pathOnly.split('/').pop()}`);
        }
        return resolveApiStatic(pathOnly);
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed.split('/').pop() || '');
    if (isUuid && !trimmed.includes('/')) {
        return resolveApiStatic(trimmed);
    }

    return `${getApiOrigin()}/${trimmed.replace(/^\//, '')}`;
};

/** Preview URL for dashboard content modal (supports in-session blob crops). */
export const getContentThumbnailSrc = (
    thumbnailUrl: string | null | undefined,
    type?: string,
    category?: string
): string => {
    if (thumbnailUrl?.startsWith('blob:')) return thumbnailUrl;
    const resolved = thumbnailUrl ? getImageUrl(thumbnailUrl) : '';
    if (resolved) return resolved;
    return getImageUrl(getDefaultThumbnailPath(type, category));
};
