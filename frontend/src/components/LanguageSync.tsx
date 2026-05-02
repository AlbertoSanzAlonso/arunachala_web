import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function LanguageSync() {
    const { search } = useLocation();
    const { i18n } = useTranslation();

    useEffect(() => {
        const params = new URLSearchParams(search);
        const lng = params.get('lng');
        if (lng && i18n.language !== lng) {
            i18n.changeLanguage(lng);
        }
    }, [search, i18n]);

    return null;
}
