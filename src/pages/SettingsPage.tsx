import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import type { InterfaceLocale, UserSettings } from '../domain/model';
import { DAILY_MINUTE_OPTIONS, NEW_WORD_OPTIONS } from '../domain/settings';
import { Select } from '../components/Select';
import { Icon } from '../components/Icon';
import { audio, useEnglishVoices } from '../features/audio/audio';

// Spoken sample for "Try voice"; English learning audio, so it is not translated.
const VOICE_SAMPLE = 'Please attach the invoice to your email.';
const RATE_MIN = 0.6;
const RATE_MAX = 1.2;
const LOCALES: InterfaceLocale[] = ['en', 'vi'];
const FALLBACK_TIMEZONES = ['Asia/Ho_Chi_Minh', 'Asia/Tokyo', 'Europe/London', 'America/New_York', 'UTC'];
const TIMEZONES = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : FALLBACK_TIMEZONES;
// A saved value outside the offered choices stays selectable instead of being silently changed.
const withSaved = <T,>(options: readonly T[], saved: T) => (options.includes(saved) ? [...options] : [saved, ...options]);

/** Settings (`/settings`): study habit, interface language, English voice and the account section. */
export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { auth, repository, settings, applySettings } = useLearning();
  const voices = useEnglishVoices();
  const [minutes, setMinutes] = useState(settings.dailyMinutes);
  const [newPerDay, setNewPerDay] = useState(settings.newPerDay);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [locale, setLocale] = useState(settings.locale);
  const [voiceId, setVoiceId] = useState(settings.voiceId);
  const [rate, setRate] = useState(settings.speechRate);
  const [now] = useState(() => new Date());
  const [save, setSave] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [sample, setSample] = useState<'idle' | 'playing' | 'failed'>('idle');
  const [signOut, setSignOut] = useState<'idle' | 'pending' | 'failed'>('idle');
  useEffect(() => () => audio.stop(), []);

  const canSpeak = audio.supported && voices.length > 0;
  const voiceMissing = voiceId !== null && canSpeak && !voices.some((voice) => voice.id === voiceId);
  const draft: Partial<UserSettings> = { dailyMinutes: minutes, newPerDay, timezone, locale, voiceId, speechRate: rate };
  // Only changed fields are sent, so a save never overwrites a value this form did not touch.
  const changes = Object.fromEntries(Object.entries(draft)
    .filter(([key, value]) => settings[key as keyof UserSettings] !== value)) as Partial<UserSettings>;
  const dirty = Object.keys(changes).length > 0;
  const rateText = new Intl.NumberFormat(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(rate);
  const localNow = new Intl.DateTimeFormat(i18n.language, {
    timeZone: timezone, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(now);
  const edit = <T,>(setter: (value: T) => void) => (value: T) => { setter(value); setSave('idle'); };

  async function handleSave() {
    setSave('saving');
    try {
      await repository.saveSettings(changes);
    } catch {
      setSave('failed');
      return;
    }
    // A saved locale switches the interface in place; account data is not reloaded.
    applySettings(changes);
    setSave('saved');
  }

  async function trySample() {
    if (sample === 'playing') {
      audio.stop();
      return;
    }
    setSample('playing');
    try {
      await audio.speak(VOICE_SAMPLE, { voiceId, rate });
      setSample('idle');
    } catch {
      setSample('failed');
    }
  }

  async function handleSignOut() {
    setSignOut('pending');
    const result = await auth.signOut();
    // Success swaps the whole signed-in tree for the sign-in screen.
    if (!result.ok) setSignOut('failed');
  }

  return (
    <div className="page page-narrow">
      <Link to="/" className="settings-back"><Icon name="arrowLeft" size={18} />{t('settings.back')}</Link>
      <div className="page-heading">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </div>

      <section className="settings-card" aria-labelledby="habit-title">
        <div className="settings-card-head">
          <span className="settings-icon" aria-hidden="true"><Icon name="calendar" size={18} /></span>
          <h2 id="habit-title">{t('settings.habit.title')}</h2>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <label htmlFor="minutes" className="settings-label">{t('settings.habit.minutes')}</label>
            <p id="minutes-hint" className="settings-hint">{t('settings.habit.minutesHint')}</p>
          </div>
          <Select id="minutes" className="settings-control" aria-describedby="minutes-hint" value={minutes}
            onValueChange={(value) => edit(setMinutes)(Number(value))}>
            {withSaved(DAILY_MINUTE_OPTIONS, minutes).map((value) => (
              <option key={value} value={value}>{t('settings.habit.minutesOption', { minutes: value })}</option>
            ))}
          </Select>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <label htmlFor="new-words" className="settings-label">{t('settings.habit.newWords')}</label>
            <p id="new-words-hint" className="settings-hint">{t('settings.habit.newWordsHint')}</p>
          </div>
          <Select id="new-words" className="settings-control" aria-describedby="new-words-hint" value={newPerDay}
            onValueChange={(value) => edit(setNewPerDay)(Number(value))}>
            {withSaved(NEW_WORD_OPTIONS, newPerDay).map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <label htmlFor="timezone" className="settings-label">{t('settings.habit.timezone')}</label>
            <p id="timezone-hint" className="settings-hint">
              {t('settings.habit.timezoneHint')} <span className="settings-local-time">{t('settings.habit.timezoneNow', { date: localNow })}</span>
            </p>
          </div>
          <Select id="timezone" className="settings-control" aria-describedby="timezone-hint" value={timezone}
            onValueChange={edit(setTimezone)}>
            {withSaved(TIMEZONES, timezone).map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <label htmlFor="locale" className="settings-label">{t('settings.habit.language')}</label>
            <p id="locale-hint" className="settings-hint">{t('settings.habit.languageHint')}</p>
          </div>
          <Select id="locale" className="settings-control" aria-describedby="locale-hint" value={locale}
            onValueChange={(value) => edit(setLocale)(value as InterfaceLocale)}>
            {LOCALES.map((value) => <option key={value} value={value} lang={value}>{t(`settings.habit.languages.${value}`)}</option>)}
          </Select>
        </div>
      </section>

      <section className="settings-card" aria-labelledby="audio-title">
        <div className="settings-card-head">
          <span className="settings-icon settings-icon-blue" aria-hidden="true"><Icon name="volume" size={18} /></span>
          <h2 id="audio-title">{t('settings.audio.title')}</h2>
        </div>
        {!canSpeak && (
          <p className="notice settings-notice" role="status">
            {audio.supported ? t('settings.audio.noVoices') : t('settings.audio.unsupported')}
          </p>
        )}
        <div className="settings-row">
          <label htmlFor="voice" className="settings-label">{t('settings.audio.voice')}</label>
          <Select
            id="voice"
            className="settings-control"
            value={voiceId ?? ''}
            disabled={!canSpeak}
            onValueChange={(value) => edit(setVoiceId)(value || null)}
          >
            <option value="">{t('settings.audio.defaultVoice')}</option>
            {voiceMissing && <option value={voiceId}>{t('settings.audio.missingVoice')}</option>}
            {voices.map((voice) => <option key={voice.id} value={voice.id}>{`${voice.name} (${voice.lang})`}</option>)}
          </Select>
        </div>
        {voiceMissing && <p className="settings-hint settings-row-note" role="status">{t('settings.audio.missingNote')}</p>}
        <div className="settings-row">
          <label htmlFor="rate" className="settings-label">{t('settings.audio.rate', { rate: rateText })}</label>
          <input
            id="rate"
            className="settings-range"
            type="range"
            min={RATE_MIN}
            max={RATE_MAX}
            step={0.1}
            value={rate}
            onChange={(event) => edit(setRate)(Number(event.target.value))}
          />
        </div>
        <div className="settings-row settings-row-start">
          <button type="button" className="btn btn-secondary" disabled={!canSpeak} aria-pressed={sample === 'playing'} onClick={trySample}>
            {sample === 'playing' ? t('settings.audio.stop') : t('settings.audio.try')}
          </button>
          <p className="settings-hint">{sample === 'failed' ? t('settings.audio.failed') : t('settings.audio.note')}</p>
        </div>
      </section>

      <div className="settings-save">
        <button type="button" className="btn btn-primary" disabled={!dirty || save === 'saving'} onClick={handleSave}>
          {save === 'saving' ? t('settings.saving') : t('settings.save')}
        </button>
        {save === 'saved' && <p className="status-pill status-pill-success" role="status"><Icon name="check" size={16} />{t('settings.saved')}</p>}
        {save === 'failed' && <p className="status-pill status-pill-error" role="alert"><Icon name="alert" size={16} />{t('settings.saveFailed')}</p>}
      </div>

      <section className="section-card" aria-labelledby="account-title">
        <div>
          <h2 id="account-title">{t('settings.account.title')}</h2>
          <p>{t('settings.account.body')}</p>
          {signOut === 'failed' && <p className="status-pill status-pill-error" role="alert">{t('settings.account.signOutFailed')}</p>}
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleSignOut} disabled={signOut === 'pending'}>
          {signOut === 'pending' ? t('settings.account.signingOut') : t('settings.account.signOut')}
        </button>
      </section>
    </div>
  );
}
