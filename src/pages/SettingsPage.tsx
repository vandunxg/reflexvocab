import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import { Icon } from '../components/Icon';
import { audio, useEnglishVoices } from '../features/audio/audio';

// Spoken sample for "Try voice"; English learning audio, so it is not translated.
const VOICE_SAMPLE = 'Please attach the invoice to your email.';
const RATE_MIN = 0.6;
const RATE_MAX = 1.2;

/** Settings (`/settings`): English voice preferences and the account section. P04-T04 adds the rest. */
export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { auth, repository, settings, applySettings } = useLearning();
  const voices = useEnglishVoices();
  const [voiceId, setVoiceId] = useState(settings.voiceId);
  const [rate, setRate] = useState(settings.speechRate);
  const [save, setSave] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [sample, setSample] = useState<'idle' | 'playing' | 'failed'>('idle');
  const [signOut, setSignOut] = useState<'idle' | 'pending' | 'failed'>('idle');
  useEffect(() => () => audio.stop(), []);

  const canSpeak = audio.supported && voices.length > 0;
  const voiceMissing = voiceId !== null && canSpeak && !voices.some((voice) => voice.id === voiceId);
  const dirty = voiceId !== settings.voiceId || rate !== settings.speechRate;
  const rateText = new Intl.NumberFormat(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(rate);

  async function handleSave() {
    setSave('saving');
    try {
      await repository.saveSettings({ voiceId, speechRate: rate });
    } catch {
      setSave('failed');
      return;
    }
    applySettings({ voiceId, speechRate: rate });
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
      <div className="page-heading">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </div>

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
          <select
            id="voice"
            className="settings-control"
            value={voiceId ?? ''}
            disabled={!canSpeak}
            onChange={(event) => { setVoiceId(event.target.value || null); setSave('idle'); }}
          >
            <option value="">{t('settings.audio.defaultVoice')}</option>
            {voiceMissing && <option value={voiceId}>{t('settings.audio.missingVoice')}</option>}
            {voices.map((voice) => <option key={voice.id} value={voice.id}>{`${voice.name} (${voice.lang})`}</option>)}
          </select>
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
            onChange={(event) => { setRate(Number(event.target.value)); setSave('idle'); }}
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
