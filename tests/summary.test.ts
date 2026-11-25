import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarizeSession } from '../src/domain/summary.ts';
import type { Attempt } from '../src/domain/model.ts';

const attempt = (id: string, changes: Partial<Attempt>): Attempt => ({
  id, sessionId: 's', exerciseId: 'e', senseId: 'a', contextId: 'c', exerciseVersion: 1,
  exerciseKind: 'definition-match', answer: 'x', answerRevealed: false, outcome: 'correct',
  hintUsed: false, isRetry: false, qualifiedReview: true, grade: 'good',
  attemptedAt: '2026-11-25T01:00:00Z', responseTimeMs: null, ...changes,
} as Attempt);

test('the summary separates first attempts from recovery and counts each saved attempt once', () => {
  const wrong = attempt('1', { outcome: 'incorrect', grade: 'again' });
  const attempts = [
    wrong,
    wrong, // the same acknowledged attempt applied twice (save retry) must not double-count
    attempt('2', {}),
    attempt('3', { answer: null, answerRevealed: true, outcome: 'incorrect' }),
    attempt('4', { isRetry: true }),
    attempt('5', { sessionId: 'other' }),
  ];
  assert.deepEqual(summarizeSession(attempts, 's'), { firstAttempts: 3, correct: 1, recoveryPractice: 1 });
});
