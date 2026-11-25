import type { UserSettings } from './model';

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
