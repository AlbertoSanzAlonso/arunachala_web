// Default to the production URL to avoid localhost errors on the deployed site.
const getApiUrl = () => {
    // 1. Try CRA environment variable (for compatibility)
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    // 2. Check if we are running on localhost for local development
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:8000';
    }

    // 3. Default to Production API URL (Force HTTPS for security)
    const productionUrl = 'https://api.yogayterapiasarunachala.es';
    
    // Ensure that if we have a REACT_APP_API_URL, it also uses https in production
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL.replace('http://', 'https://');
    }

    return productionUrl;
};

export const API_BASE_URL = getApiUrl();

