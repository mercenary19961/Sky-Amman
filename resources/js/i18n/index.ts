import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import ar from './ar';

/**
 * Initialize at 'en' — the actual language is set by LanguageContext
 * after hydration based on the server-shared session locale (no localStorage).
 * The session cookie is the single source of truth, mirroring Nuor Steel.
 */
i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        ar: { translation: ar },
    },
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    interpolation: {
        escapeValue: false,
    },
    returnObjects: true,
});

export default i18n;
