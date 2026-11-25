export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
}

export interface AudioAdapter {
  readonly supported: boolean;
  /** Available English voices; the same array until the browser reports a change. */
  listVoices(): VoiceOption[];
  subscribeVoices(listener: () => void): () => void;
  /** Settles on completion or cancellation; rejects with code `playback-failed` or `unsupported`. */
  speak(text: string, options?: { voiceId?: string | null; rate?: number }): Promise<void>;
  stop(): void;
}

export const DEFAULT_SPEECH_RATE = 0.9;
const isEnglish = (voice: SpeechSynthesisVoice) => /^en([-_]|$)/i.test(voice.lang);
const audioError = (code: 'playback-failed' | 'unsupported', message: string) => Object.assign(new Error(message), { code });

/** Browser speech synthesis behind the small audio contract in docs/ADAPTERS.md. */
export function createBrowserAudio(synth: SpeechSynthesis | undefined): AudioAdapter {
  const supported = synth !== undefined && typeof SpeechSynthesisUtterance !== 'undefined';
  const englishVoices = () => (supported ? synth.getVoices().filter(isEnglish) : []);
  const toOption = (voice: SpeechSynthesisVoice): VoiceOption => ({ id: voice.voiceURI, name: voice.name, lang: voice.lang });
  let options: VoiceOption[] = englishVoices().map(toOption);
  const listeners = new Set<() => void>();
  // Voices often load after the first render; keep one snapshot and refresh it on `voiceschanged`.
  synth?.addEventListener('voiceschanged', () => {
    options = englishVoices().map(toOption);
    listeners.forEach((listener) => listener());
  });

  function stop() {
    if (supported && (synth.speaking || synth.pending)) synth.cancel();
  }

  return {
    supported,
    listVoices() {
      if (options.length === 0) {
        const loaded = englishVoices();
        if (loaded.length) options = loaded.map(toOption);
      }
      return options;
    },
    subscribeVoices(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    speak(text, { voiceId, rate = DEFAULT_SPEECH_RATE } = {}) {
      if (!supported) return Promise.reject(audioError('unsupported', 'Speech synthesis is unavailable'));
      stop();
      const voices = englishVoices();
      // A saved voice may not exist on this device: fall back to the default, then any English voice.
      const voice = voices.find((item) => item.voiceURI === voiceId)
        ?? voices.find((item) => item.default)
        ?? voices.find((item) => item.lang.toLowerCase().replace('_', '-') === 'en-us')
        ?? voices[0];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice?.lang ?? 'en-US';
      if (voice) utterance.voice = voice;
      utterance.rate = rate;
      return new Promise<void>((resolve, reject) => {
        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
          if (event.error === 'canceled' || event.error === 'interrupted') resolve();
          else reject(audioError('playback-failed', event.error));
        };
        synth.speak(utterance);
      });
    },
    stop,
  };
}
