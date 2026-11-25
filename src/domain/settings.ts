import type { InterfaceLocale, UserSettings } from './model';

/** Product defaults (DECISIONS.md) used until the account saves its own settings row. */
export const DEFAULT_SETTINGS: UserSettings = {
  locale: 'en',
  dailyMinutes: 10,
  newPerDay: 8,
  voiceId: null,
  speechRate: 0.9,
  timezone: 'Asia/Ho_Chi_Minh',
  onboardingCompleted: false,
};

/** Choices offered by onboarding and Settings. A saved value outside them is still shown and kept. */
export const DAILY_MINUTE_OPTIONS = [5, 10, 15, 20] as const;
export const NEW_WORD_OPTIONS = [4, 6, 8, 10] as const;

/** Unsupported, missing or malformed values resolve to English. */
export function normalizeLocale(value: unknown): InterfaceLocale {
  return value === 'vi' ? 'vi' : 'en';
}

export function isTimezone(value: unknown): value is string {
  if (typeof value !== 'string' || !value) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const isInteger = (value: unknown, min: number): value is number => Number.isInteger(value) && (value as number) >= min;

/** Stored settings are untrusted: each unsupported field falls back to its default on its own. */
export function normalizeSettings(stored: Partial<UserSettings> | null | undefined): UserSettings {
  const value = stored ?? {};
  return {
    locale: normalizeLocale(value.locale),
    dailyMinutes: isInteger(value.dailyMinutes, 1) ? value.dailyMinutes : DEFAULT_SETTINGS.dailyMinutes,
    newPerDay: isInteger(value.newPerDay, 0) ? value.newPerDay : DEFAULT_SETTINGS.newPerDay,
    voiceId: typeof value.voiceId === 'string' && value.voiceId ? value.voiceId : null,
    speechRate: typeof value.speechRate === 'number' && value.speechRate >= 0.1 && value.speechRate <= 10
      ? value.speechRate : DEFAULT_SETTINGS.speechRate,
    timezone: isTimezone(value.timezone) ? value.timezone : DEFAULT_SETTINGS.timezone,
    onboardingCompleted: value.onboardingCompleted === true,
  };
}
