export const getTranslated = (obj: any, field: string, lang: string, fallback: string = "") => {
    if (!obj) return fallback;

    // Check if translations exist for the specific language
    // Handle edge case where i18n language might be 'es-ES' or similar
    const shortLang = lang.split('-')[0];

    if (obj.translations && obj.translations[shortLang] && obj.translations[shortLang][field]) {
        return obj.translations[shortLang][field];
    }

    // Fallback to the main field value
    return obj[field] || fallback;
};
