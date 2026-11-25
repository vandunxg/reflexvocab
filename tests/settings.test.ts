import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_SETTINGS, normalizeSettings } from '../src/domain/settings.ts';

test('an unsupported stored locale or timezone falls back alone, leaving other settings untouched', () => {
  const stored = {
    locale: 'fr', timezone: 'Mars/Olympus', dailyMinutes: 15, newPerDay: 4,
    voiceId: 'v-gb', speechRate: 1.1, onboardingCompleted: true,
  } as unknown as Parameters<typeof normalizeSettings>[0];
  assert.deepEqual(normalizeSettings(stored), {
    locale: 'en', timezone: DEFAULT_SETTINGS.timezone, dailyMinutes: 15, newPerDay: 4,
    voiceId: 'v-gb', speechRate: 1.1, onboardingCompleted: true,
  });
  assert.equal(normalizeSettings({ locale: 'vi', timezone: 'America/New_York' }).timezone, 'America/New_York');
  assert.deepEqual(normalizeSettings(null), DEFAULT_SETTINGS);
});
