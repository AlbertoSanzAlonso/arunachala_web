import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './locales/es/translation.json';
import ca from './locales/ca/translation.json';
import en from './locales/en/translation.json';

i18n
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        debug: false,
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources: {
            es: {
                translation: es
            },
            ca: {
                translation: ca
            },
            en: {
                translation: en
            }
        }
    });

// Sync html lang attribute
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng.split('-')[0];
});

export default i18n;
