import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslation from './locales/en/translation.json'
import viTranslation from './locales/vi/translation.json'

const resources = {
  en: {
    translation: enTranslation,
  },
  vi: {
    translation: viTranslation,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })


