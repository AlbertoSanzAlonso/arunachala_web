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
    if (url.startsWith('/static/')) {
        const pathOnly = url.replace('/static/', '');
        return `${SUPABASE_BUCKET_URL}/${pathOnly}`;
    }

    return `${API_BASE_URL}${url}`;
};
