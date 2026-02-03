export const getTranslated = (obj: any, field: string, lang: string | undefined | null, fallback: string = "") => {
    if (!obj) return fallback;

    // Fallback if no language is provided
    if (!lang) return obj[field] || fallback;

    // Handle edge case where i18n language might be 'es-ES' or similar
    const shortLang = lang.split('-')[0];

    // Some versions might have the translations as a string if not parsed correctly
    let translations = obj.translations;
    if (typeof translations === 'string') {
        try {
            translations = JSON.parse(translations);
        } catch (e) {
            translations = null;
        }
    }

    if (translations && translations[shortLang] && translations[shortLang][field]) {
        return translations[shortLang][field];
    }

    // Fallback to the main field value
    return obj[field] || fallback;
};
