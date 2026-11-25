import type { Evidence } from '../../domain/answers';
import type { Exercise, VocabularySense } from '../../domain/model';

/** Human-readable form of an answer for feedback, using authored option/chunk text. */
export function answerText(exercise: Exercise, answer: string | string[] | null): string | null {
  if (answer === null) return null;
  if (exercise.kind === 'sentence-build') {
    const chunks = new Map(exercise.chunks.map((chunk) => [chunk.id, chunk.text]));
    return (answer as string[]).map((id) => chunks.get(id) ?? id).join(' ');
  }
  if (exercise.kind === 'typing-cloze') return answer as string;
  return exercise.choices.find((choice) => choice.id === answer)?.text ?? (answer as string);
}

export function correctAnswerText(exercise: Exercise): string {
  if (exercise.kind === 'typing-cloze') return exercise.acceptedAnswers[0];
  if (exercise.kind === 'sentence-build') return answerText(exercise, exercise.correctOrder)!;
  return answerText(exercise, exercise.correctChoiceId)!;
}

/** Prompt text for speech before answering: blanks become a pause and nothing reveals the answer. */
export function speakablePrompt(prompt: string): string {
  return prompt.replace(/_{2,}/g, '…');
}

/** Splits text around case-insensitive occurrences of a word so the caller can emphasize it. */
export function splitOnWord(text: string, word: string): { text: string; match: boolean }[] {
  if (!word) return [{ text, match: false }];
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.split(new RegExp(`\\b(${escaped})\\b`, 'i')).filter(Boolean)
    .map((part) => ({ text: part, match: part.toLowerCase() === word.toLowerCase() }));
}

export interface HintItem {
  kind: 'partOfSpeech' | 'collocations' | 'firstLetter' | 'firstChunk' | 'definition' | 'gloss';
  value: string;
}

/**
 * Support offered before answering. A hint never contains the answer itself: definition
 * questions get word class and collocations only, because the definition or the Vietnamese
 * gloss would expose the correct choice. Showing the answer is a separate, recorded reveal.
 */
export function hintItems(exercise: Exercise, sense: VocabularySense): HintItem[] {
  const gloss: HintItem[] = sense.viGloss ? [{ kind: 'gloss', value: sense.viGloss }] : [];
  const definition: HintItem = { kind: 'definition', value: sense.definition };
  switch (exercise.kind) {
    case 'definition-match':
      return [
        { kind: 'partOfSpeech', value: sense.partOfSpeech },
        ...(sense.collocations.length ? [{ kind: 'collocations' as const, value: sense.collocations.join(', ') }] : []),
      ];
    case 'typing-cloze':
      return [definition, { kind: 'firstLetter', value: exercise.acceptedAnswers[0].trim().charAt(0) }, ...gloss];
    case 'sentence-build': {
      const first = exercise.chunks.find((chunk) => chunk.id === exercise.correctOrder[0]);
      return [...(first ? [{ kind: 'firstChunk' as const, value: first.text }] : []), definition, ...gloss];
    }
    default:
      return [definition, ...gloss];
  }
}

/** Fisher–Yates shuffle; a multi-item list never keeps the authored order (e.g. the correct sentence). */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let attempt = 0; attempt < 5; attempt += 1) {
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    if (result.length < 2 || result.some((item, index) => item !== items[index])) return result;
  }
  return [...result.slice(1), result[0]];
}

export type FeedbackHeading = 'correct' | 'correctSupported' | 'correctRetry' | 'revealed' | 'incorrect';

/** Feedback wording never presents a revealed or hinted answer as independent recall. */
export function feedbackHeading(correct: boolean, evidence: Evidence): FeedbackHeading {
  if (evidence === 'revealed') return 'revealed';
  if (!correct) return 'incorrect';
  if (evidence === 'retry') return 'correctRetry';
  return evidence === 'hinted' ? 'correctSupported' : 'correct';
}
