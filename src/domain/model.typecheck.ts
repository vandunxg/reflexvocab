import type { Attempt, Exercise, ExerciseOf } from './model';

const base = {
  id: 'exercise-id',
  senseId: 'sense-id',
  contextId: 'context-id',
  version: 1,
  active: true,
  prompt: 'Prompt',
  explanation: 'Explanation',
};

const choices = [
  { id: 'a', text: 'first option' },
  { id: 'b', text: 'second option' },
] satisfies [{ id: string; text: string }, ...{ id: string; text: string }[]];

// Each evaluator must get its answer key after narrowing on kind.
export const exercises = {
  'definition-match': {
    ...base,
    kind: 'definition-match',
    choices,
    correctChoiceId: 'a',
  },
  'multiple-choice-cloze': {
    ...base,
    kind: 'multiple-choice-cloze',
    choices,
    correctChoiceId: 'b',
  },
  'typing-cloze': {
    ...base,
    kind: 'typing-cloze',
    acceptedAnswers: ['organize', 'organise'],
  },
  'collocation-match': {
    ...base,
    kind: 'collocation-match',
    choices,
    correctChoiceId: 'a',
  },
  'sentence-build': {
    ...base,
    kind: 'sentence-build',
    chunks: choices,
    correctOrder: ['b', 'a'],
  },
} satisfies { [Kind in Exercise['kind']]: ExerciseOf<Kind> };

// @ts-expect-error A typing exercise cannot be published without accepted answers.
export const missingAnswers: Exercise = { ...base, kind: 'typing-cloze' };

type UnsubmittedAttempt = Extract<Attempt, { answer: null }>;
// @ts-expect-error Revealing the answer without submitting cannot be a correct answer.
export const revealWithoutAnswer: UnsubmittedAttempt['outcome'] = 'correct';
