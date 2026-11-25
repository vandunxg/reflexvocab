import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateAnswer } from '../src/domain/answers.ts';
import type { Exercise } from '../src/domain/model.ts';

const base = {
  id: 'e',
  senseId: 's',
  contextId: 'c',
  prompt: 'prompt',
  explanation: 'explanation',
  version: 1,
  active: true,
};
const flags = { hintUsed: false, answerRevealed: false, isRetry: false };
const choices: [{ id: string; text: string }, ...{ id: string; text: string }[]] = [
  { id: 'a', text: 'correct' },
  { id: 'b', text: 'wrong' },
];

test('all choice exercise kinds use the declared stable choice ID', () => {
  for (const kind of ['definition-match', 'multiple-choice-cloze', 'collocation-match'] as const) {
    const exercise = { ...base, kind, choices, correctChoiceId: 'a' } satisfies Exercise;
    assert.deepEqual(evaluateAnswer(exercise, 'a', flags), {
      correct: true,
      evidence: 'independent',
    });
    assert.equal(evaluateAnswer(exercise, 'b', flags).correct, false);
  }
});

test('typing accepts declared variants with normalized case and whitespace, not near matches', () => {
  const exercise = {
    ...base,
    kind: 'typing-cloze',
    acceptedAnswers: ['organize', 'organise work'],
  } satisfies Exercise;
  assert.equal(evaluateAnswer(exercise, '  ORGANISE \t work  ', flags).correct, true);
  assert.equal(evaluateAnswer(exercise, 'organise works', flags).correct, false);
});

test('sentence building requires exact chunk order', () => {
  const exercise = {
    ...base,
    kind: 'sentence-build',
    chunks: choices,
    correctOrder: ['a', 'b'],
  } satisfies Exercise;
  assert.equal(evaluateAnswer(exercise, ['a', 'b'], flags).correct, true);
  assert.equal(evaluateAnswer(exercise, ['b', 'a'], flags).correct, false);
});

test('a correct response after reveal, hint, or retry is not independent', () => {
  const exercise = { ...base, kind: 'typing-cloze', acceptedAnswers: ['file'] } satisfies Exercise;
  assert.equal(
    evaluateAnswer(exercise, 'file', { ...flags, answerRevealed: true }).evidence,
    'revealed',
  );
  assert.equal(evaluateAnswer(exercise, 'file', { ...flags, hintUsed: true }).evidence, 'hinted');
  assert.equal(evaluateAnswer(exercise, 'file', { ...flags, isRetry: true }).evidence, 'retry');
  assert.equal(evaluateAnswer(exercise, 'wrong', flags).evidence, 'incorrect');
});

test('unsupported answer shapes are rejected rather than graded', () => {
  const exercise = { ...base, kind: 'typing-cloze', acceptedAnswers: ['file'] } satisfies Exercise;
  assert.throws(() => evaluateAnswer(exercise, ['file'], flags), TypeError);
  assert.throws(() => evaluateAnswer(exercise, null, flags), TypeError);
  assert.deepEqual(evaluateAnswer(exercise, null, { ...flags, answerRevealed: true }), {
    correct: false,
    evidence: 'revealed',
  });
});
