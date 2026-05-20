import { API_BASE_URL } from '../config';

const SUPABASE_BUCKET_URL = 'https://vybpihtssncjalbsnbcr.supabase.co/storage/v1/object/public/arunachala-images';

export const DEFAULT_THUMBNAIL_PATHS = {
    meditation: '/static/gallery/articles/meditation_default.webp',
    yoga: '/static/gallery/articles/om_symbol.webp',
    therapy: '/static/gallery/articles/logo_icon.webp',
} as const;

export const getDefaultThumbnailPath = (type?: string, category?: string): string => {
    if (type === 'meditation') return DEFAULT_THUMBNAIL_PATHS.meditation;
    if (category === 'yoga') return DEFAULT_THUMBNAIL_PATHS.yoga;
    return DEFAULT_THUMBNAIL_PATHS.therapy;
};

const isEphemeralUrl = (url: string): boolean =>
    url.startsWith('blob:') || url.startsWith('file:');

/**
 * Returns a full URL for an image.
 * - blob:/file: → '' (invalid cross-session; use UI fallback)
 * - http(s)/data: → as-is
 * - /static/... → Supabase bucket (API static is not deployed in production)
 * - other relative → API_BASE_URL
 */
export const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed || isEphemeralUrl(trimmed)) return '';

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
        return trimmed;
    }

    if (trimmed.startsWith('/static/')) {
        const pathOnly = trimmed.replace(/^\/static\//, '');
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
