import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import arTranslation from './locales/ar.json';
import esTranslation from './locales/es.json';
import frTranslation from './locales/fr.json';
import zhTranslation from './locales/zh.json';

const resources = {
  en: { translation: enTranslation },
  hi: { translation: hiTranslation },
  ar: { translation: arTranslation },
  es: { translation: esTranslation },
  fr: { translation: frTranslation },
  zh: { translation: zhTranslation },
  // More languages will be added dynamically
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
