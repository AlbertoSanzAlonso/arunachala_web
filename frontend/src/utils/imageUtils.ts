import { API_BASE_URL } from '../config';

const SUPABASE_BUCKET_URL = 'https://vybpihtssncjalbsnbcr.supabase.co/storage/v1/object/public/arunachala-images';

/**
 * Returns a full URL for an image.
 * If the URL is already absolute (starts with http), it returns it as is.
 * If it points to a local static bundle, reroute to Supabase.
 * Otherwise, it prepends the API_BASE_URL.
 */
export const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;

    // Redirect old local /static/ links to the Supabase Bucket
    // EXCEPT for default assets that are known to be on the backend disk
    if (url.startsWith('/static/')) {
        const pathOnly = url.replace('/static/', '');
        const isDefaultAsset = pathOnly.includes('meditation_default.webp') ||
            pathOnly.includes('om_symbol.webp') ||
            pathOnly.includes('logo_icon.webp');

        if (!isDefaultAsset) {
            return `${SUPABASE_BUCKET_URL}/${pathOnly}`;
        }
    }

    // If it's a UUID-like filename (common for manual uploads), it's likely in Supabase
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(url.split('/').pop() || '');
    if (isUuid && !url.includes('/')) {
        return `${SUPABASE_BUCKET_URL}/${url}`;
    }

    return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};
