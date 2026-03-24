import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationBN from './locales/bn/translation.json';

const resources = {
    en: { translation: translationEN },
    bn: { translation: translationBN },
};

const DEFAULT_LANG = localStorage.getItem('lang') || import.meta.env.VITE_DEFAULT_LANGUAGE || 'en';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: DEFAULT_LANG,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
