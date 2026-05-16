import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import vi from './locales/vi.json';
import en from './locales/en.json';
import zh from './locales/zh.json';
import id from './locales/id.json';
import th from './locales/th.json';

// Custom language detector based on browser language and timezone
const customDetector = {
  name: 'customDetector',
  lookup() {
    // Check localStorage first
    const stored = localStorage.getItem('i18nextLng');
    if (stored) return stored;

    // Detect from browser language
    const browserLang = navigator.language || (navigator as any).userLanguage;

    // Map browser language codes to our supported languages
    if (browserLang) {
      const langCode = browserLang.toLowerCase();
      if (langCode.startsWith('vi')) return 'vi';
      if (langCode.startsWith('en')) return 'en';
      if (langCode.startsWith('zh') || langCode.startsWith('cn')) return 'zh';
      if (langCode.startsWith('id')) return 'id';
      if (langCode.startsWith('th')) return 'th';
    }

    // Detect from timezone as fallback
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Asia/Ho_Chi_Minh') || timezone.includes('Asia/Bangkok')) {
      // Vietnam or nearby region
      return 'vi';
    }
    if (timezone.includes('Asia/Jakarta')) return 'id';
    if (timezone.includes('Asia/Shanghai') || timezone.includes('Asia/Hong_Kong')) return 'zh';

    // Default to Vietnamese
    return 'vi';
  },
  cacheUserLanguage(lng: string) {
    localStorage.setItem('i18nextLng', lng);
  }
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(customDetector);

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
      zh: { translation: zh },
      id: { translation: id },
      th: { translation: th },
    },
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en', 'zh', 'id', 'th'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['customDetector', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
