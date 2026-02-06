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

    if (translations && translations[shortLang]) {
        // Direct match
        if (translations[shortLang][field]) {
            return translations[shortLang][field];
        }

        // Aliases mapping
        const aliases: Record<string, string[]> = {
            'title': ['name', 'header'],
            'body': ['content', 'description'],
            'excerpt': ['summary', 'short_description'],
            'name': ['title']
        };

        // Check aliases
        if (aliases[field]) {
            for (const alias of aliases[field]) {
                if (translations[shortLang][alias]) {
                    return translations[shortLang][alias];
                }
            }
        }
    }

    // Fallback to the main field value
    return obj[field] || fallback;
};
