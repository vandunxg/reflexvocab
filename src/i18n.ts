import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { vi } from './locales/vi';
import type { InterfaceLocale } from './domain/model';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en };
  }
}

/** Unsupported, missing or malformed values resolve to English. */
export function normalizeLocale(value: unknown): InterfaceLocale {
  return value === 'vi' ? 'vi' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: vi } },
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'vi'],
  initAsync: false,
  interpolation: { escapeValue: false },
});

export function applyLocale(value: unknown) {
  const locale = normalizeLocale(value);
  document.documentElement.lang = locale;
  if (i18n.language !== locale) void i18n.changeLanguage(locale);
}

export default i18n;
