import { API_BASE_URL } from '../config';

/**
 * Returns a full URL for an image.
 * If the URL is already absolute (starts with http), it returns it as is.
 * Otherwise, it prepends the API_BASE_URL.
 */
export const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
};
