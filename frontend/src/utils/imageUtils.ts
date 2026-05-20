import { API_BASE_URL } from '../config';

const SUPABASE_BUCKET_URL = 'https://vybpihtssncjalbsnbcr.supabase.co/storage/v1/object/public/arunachala-images';
const PRODUCTION_SITE = 'https://www.yogayterapiasarunachala.es';

/** Rutas servidas desde frontend/public (Vercel), no desde Supabase ni API. */
const SITE_PUBLIC_ASSETS: Record<string, string> = {
    '/logo_icon.webp': '/logo_icon.webp',
    '/gallery/articles/meditation_default.webp': '/gallery/articles/meditation_default.webp',
};

/** Rutas /static/ que deben resolverse en el sitio (no están en Supabase). */
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

const isEphemeralUrl = (url: string): boolean =>
    url.startsWith('blob:') || url.startsWith('file:');

const resolveSitePublicAsset = (path: string): string => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (SITE_PUBLIC_ASSETS[normalized]) {
        return `${getSiteOrigin()}${SITE_PUBLIC_ASSETS[normalized]}`;
    }
    return `${getSiteOrigin()}${normalized}`;
};

/**
 * Returns a full URL for an image.
 * - blob:/file: → '' (invalid cross-session; use UI fallback)
 * - http(s)/data: → as-is
 * - /gallery/... o /logo_icon.webp → sitio (Vercel public/)
 * - /static/... → Supabase, salvo assets solo en el sitio
 * - other relative → API_BASE_URL
 */
export const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed || isEphemeralUrl(trimmed)) return '';

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
        return `${SUPABASE_BUCKET_URL}/${pathOnly}`;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed.split('/').pop() || '');
    if (isUuid && !trimmed.includes('/')) {
        return `${SUPABASE_BUCKET_URL}/${trimmed}`;
    }

    return `${API_BASE_URL.replace(/\/$/, '')}/${trimmed.replace(/^\//, '')}`;
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
