import assert from 'node:assert/strict';
import { test } from 'node:test';
import { attemptMetrics, recentAttempts } from '../src/domain/progress.ts';
import type { Attempt } from '../src/domain/model.ts';

const attempt = (id: string, changes: Partial<Attempt> = {}) => ({
  id, sessionId: 's', senseId: 'a', exerciseId: 'e', contextId: 'c', exerciseVersion: 1,
  exerciseKind: 'definition-match', answer: 'x', outcome: 'correct', hintUsed: false,
  answerRevealed: false, isRetry: false, qualifiedReview: false, grade: null,
  attemptedAt: '2026-11-25T01:00:00Z', responseTimeMs: null, ...changes,
} as Attempt);

test('progress distinguishes unassisted first attempts from qualified independent reviews', () => {
  const initial = attempt('1');
  const attempts = [
    initial, initial,
    attempt('2', { hintUsed: true, qualifiedReview: true }),
    attempt('3', { answerRevealed: true, outcome: 'incorrect' }),
    attempt('4', { isRetry: true }),
    attempt('5', { qualifiedReview: true, outcome: 'incorrect' }),
    attempt('6', { qualifiedReview: true }),
  ];
  assert.deepEqual(attemptMetrics(attempts), {
    attempts: 6, firstUnassisted: 3, firstCorrect: 2,
    assisted: 2, retries: 1, reviews: 2, reviewCorrect: 1,
  });
});

test('history limit includes newly saved attempts without overstating the loaded window', () => {
  const older = attempt('old', { attemptedAt: '2026-11-24T00:00:00Z' });
  const newer = attempt('new', { attemptedAt: '2026-11-25T00:00:00Z' });
  assert.deepEqual(recentAttempts([older, newer, newer], 1).map((item) => item.id), ['new']);
});
