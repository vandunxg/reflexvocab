import type { Exercise } from './model';

type Assistance = { hintUsed: boolean; answerRevealed: boolean; isRetry: boolean };
export type Evidence = 'independent' | 'hinted' | 'revealed' | 'retry' | 'incorrect';

export function evaluateAnswer(
  exercise: Exercise,
  answer: unknown,
  assistance: Assistance,
): { correct: boolean; evidence: Evidence } {
  let correct: boolean;
  if (answer === null && assistance.answerRevealed) {
    correct = false;
  } else if (exercise.kind === 'sentence-build') {
    if (!Array.isArray(answer) || !answer.every((chunk) => typeof chunk === 'string')) {
      throw new TypeError('Invalid sentence answer');
    }
    correct =
      answer.length === exercise.correctOrder.length &&
      exercise.correctOrder.every((id, index) => id === answer[index]);
  } else {
    if (typeof answer !== 'string') throw new TypeError('Invalid answer');
    if (exercise.kind === 'typing-cloze') {
      const normalize = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase();
      const normalized = normalize(answer);
      correct =
        normalized !== '' &&
        exercise.acceptedAnswers.some((item) => normalize(item) === normalized);
    } else {
      correct = answer === exercise.correctChoiceId;
    }
  }

  const evidence = assistance.answerRevealed
    ? 'revealed'
    : assistance.isRetry
      ? 'retry'
      : assistance.hintUsed
        ? 'hinted'
        : correct
          ? 'independent'
          : 'incorrect';
  return { correct, evidence };
}
