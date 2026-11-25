import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCard } from '../src/domain/fsrs.ts';
import { applyReview, startProgress } from '../src/domain/mastery.ts';
import type { CardProgress } from '../src/domain/model.ts';

const initial = (): CardProgress => ({
  senseId: 'sense', card: createCard(new Date('2026-11-25T16:30:00Z')),
  firstSeenAt: '2026-11-25T16:30:00Z', masteryStage: 'learning',
  evidence: { reviewDays: [], contextIds: [], hasTypingSuccess: false },
  mistakeCount: 0, lastMistakeAt: null,
});
const review = {
  correct: true, hintUsed: false, answerRevealed: false, isRetry: false,
  contextId: 'context', exerciseKind: 'typing-cloze' as const,
  now: new Date('2026-11-25T17:30:00Z'), timezone: 'Asia/Ho_Chi_Minh',
};

test('a due review schedules learning but introduction day is not mastery evidence', () => {
  const result = applyReview(initial(), { ...review, now: new Date('2026-11-25T16:45:00Z') });
  assert.equal(result.grade, 'good');
  assert.equal(result.qualifiedReview, true);
  assert.equal(result.progress.card.data.reps, 1);
  assert.deepEqual(result.progress.evidence.reviewDays, []);
});

test('a later local calendar day adds evidence only once even for due learning steps', () => {
  const first = applyReview(initial(), { ...review, now: new Date('2026-11-26T17:00:00Z') });
  assert.deepEqual(first.progress.evidence.reviewDays, ['2026-11-27']);
  assert.equal(first.progress.evidence.hasTypingSuccess, true);
  const next = applyReview(first.progress, { ...review, now: new Date('2026-11-26T17:11:00Z') });
  assert.equal(next.progress.card.data.reps, 2);
  assert.deepEqual(next.progress.evidence.reviewDays, ['2026-11-27']);
});

test('a due lapse clears mastery evidence and a retry cannot advance scheduling', () => {
  const previous = initial();
  previous.masteryStage = 'mastered';
  previous.evidence = { reviewDays: ['2026-11-26'], contextIds: ['old'], hasTypingSuccess: true };
  const failure = applyReview(previous, { ...review, correct: false });
  assert.equal(failure.grade, 'again');
  assert.equal(failure.progress.masteryStage, 'learning');
  assert.deepEqual(failure.progress.evidence, { reviewDays: [], contextIds: [], hasTypingSuccess: false });
  const retry = applyReview(failure.progress, {
    ...review, isRetry: true, now: new Date('2026-11-25T18:00:00Z'),
  });
  assert.equal(retry.grade, null);
  assert.deepEqual(retry.progress.card, failure.progress.card);
  assert.equal(retry.progress.mistakeCount, 1);
});

test('early practice and hinted or revealed answers do not add independent evidence', () => {
  const card = initial();
  const early = applyReview(card, { ...review, now: new Date('2026-11-25T16:00:00Z') });
  assert.equal(early.grade, null);
  assert.deepEqual(early.progress.card, card.card);
  const hinted = applyReview(card, { ...review, hintUsed: true });
  assert.equal(hinted.grade, 'hard');
  assert.deepEqual(hinted.progress.evidence.reviewDays, []);
  const revealed = applyReview(card, { ...review, answerRevealed: true });
  assert.equal(revealed.grade, 'again');
});

test('first exposure initializes without a scheduler review', () => {
  const progress = startProgress('sense', new Date('2026-11-25T10:00:00Z'));
  assert.equal(progress.card.data.reps, 0);
  assert.deepEqual(progress.evidence.reviewDays, []);
});

test('mastery requires distinct days, contexts, typing, and sufficient stability', () => {
  let progress = initial();
  for (const [date, context, kind] of [
    ['2026-12-26T17:00:00Z', 'one', 'typing-cloze'],
    ['2027-01-26T17:00:00Z', 'two', 'definition-match'],
    ['2027-02-26T17:00:00Z', 'two', 'definition-match'],
    ['2027-03-26T17:00:00Z', 'two', 'definition-match'],
  ] as const) {
    progress = applyReview(progress, { ...review, now: new Date(date), contextId: context, exerciseKind: kind }).progress;
  }
  assert.equal(progress.masteryStage, 'mastered');
  assert.ok(Number(progress.card.data.stability) >= 14);
  assert.ok(progress.evidence.reviewDays.length >= 3);
});

test('three review days alone cannot confer mastery without context and typing evidence', () => {
  const progress = initial();
  progress.evidence = {
    reviewDays: ['2026-11-26', '2026-11-27'], contextIds: ['context'], hasTypingSuccess: false,
  };
  const result = applyReview(progress, {
    ...review, now: new Date('2026-11-28T17:00:00Z'), exerciseKind: 'definition-match',
  });
  assert.equal(result.progress.evidence.reviewDays.length, 3);
  assert.notEqual(result.progress.masteryStage, 'mastered');
});
