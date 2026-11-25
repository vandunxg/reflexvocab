import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../../app/LearningProvider';
import { Icon } from '../../components/Icon';
import { audio, useEnglishVoices } from './audio';

/**
 * Plays English text with the saved voice and rate. Hidden when the device cannot speak English, so
 * learning continues by text. Unmounting (next question, leaving the screen) stops its playback.
 */
export function SpeakButton({ text, label, small = false }: { text: string; label: string; small?: boolean }) {
  const { t } = useTranslation();
  const { settings } = useLearning();
  const voices = useEnglishVoices();
  const [state, setState] = useState<'idle' | 'playing' | 'failed'>('idle');
  const playing = useRef(false);
  useEffect(() => () => {
    if (playing.current) audio.stop();
  }, []);

  if (!audio.supported || voices.length === 0) return null;

  async function toggle() {
    if (playing.current) {
      audio.stop();
      return;
    }
    playing.current = true;
    setState('playing');
    try {
      await audio.speak(text, { voiceId: settings.voiceId, rate: settings.speechRate });
      setState('idle');
    } catch {
      setState('failed');
    } finally {
      playing.current = false;
    }
  }

  return (
    <span className="speak">
      <button
        type="button"
        className={small ? 'speak-button speak-button-small' : 'speak-button'}
        aria-label={state === 'playing' ? t('audio.stop') : label}
        aria-pressed={state === 'playing'}
        onClick={toggle}
      >
        <Icon name={state === 'playing' ? 'stop' : 'volume'} size={small ? 18 : 20} />
      </button>
      {state === 'failed' && <span className="speak-error" role="status">{t('audio.failed')}</span>}
    </span>
  );
}
