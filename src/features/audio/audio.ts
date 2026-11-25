import { useSyncExternalStore } from 'react';
import { createBrowserAudio } from './browser-audio';

/** The one audio implementation for the app; controls and cleanup share it. */
export const audio = createBrowserAudio(typeof window !== 'undefined' ? window.speechSynthesis : undefined);

const noVoices: never[] = [];
export function useEnglishVoices() {
  return useSyncExternalStore(audio.subscribeVoices, audio.listVoices, () => noVoices);
}
