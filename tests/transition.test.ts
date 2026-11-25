import assert from 'node:assert/strict';
import { test } from 'node:test';
import { submitAnswer, type AnswerSubmission } from '../src/domain/transition.ts';
import type { Exercise, LearningSession } from '../src/domain/model.ts';

const choice = (id: string, senseId: string, contextId: string): Exercise => ({
  id, senseId, contextId, kind: 'definition-match', prompt: 'prompt', explanation: 'explanation',
  version: 1, active: true, choices: [{ id: 'right', text: 'right' }, { id: 'wrong', text: 'wrong' }],
  correctChoiceId: 'right',
});
const exercises = [choice('a-1', 'a', 'first'), choice('a-2', 'a', 'second'), choice('b-1', 'b', 'only')];
const session: LearningSession = {
  id: 'session', config: { mode: 'daily', questionBudget: 2 },
  queue: [
    { exerciseId: 'a-1', exerciseVersion: 1, senseId: 'a', source: 'new' },
    { exerciseId: 'b-1', exerciseVersion: 1, senseId: 'b', source: 'new' },
  ],
  cursor: 0, revision: 3, retryCounts: {}, status: 'current',
  startedAt: '2026-11-25T01:00:00Z', updatedAt: '2026-11-25T01:00:00Z',
};
const submission: AnswerSubmission = {
  session, exercise: exercises[0], progress: undefined, exercises, answer: 'wrong',
  hintUsed: false, answerRevealed: false, attemptId: 'attempt-1',
  attemptedAt: new Date('2026-11-25T01:01:00Z'), responseTimeMs: 2400, timezone: 'Asia/Ho_Chi_Minh',
};

test('one wrong first answer yields feedback and a complete, consistent commit payload', () => {
  const before = structuredClone(submission);
  const result = submitAnswer(submission);
  assert.ok(result.ok);
  assert.equal(result.correct, false);
  const { attempt, progress, session: next, expectedRevision } = result.commit;
  assert.equal(expectedRevision, 3);
  assert.deepEqual(
    [attempt.outcome, attempt.isRetry, attempt.qualifiedReview, attempt.grade, attempt.contextId],
    ['incorrect', false, false, null, 'first'],
  );
  // First exposure initializes the card and records the mistake without a scheduler review.
  assert.deepEqual([progress.senseId, progress.mistakeCount, progress.masteryStage], ['a', 1, 'learning']);
  assert.deepEqual([next.cursor, next.revision, next.status, next.retryCounts.a], [1, 4, 'current', 1]);
  assert.deepEqual(next.queue.at(-1), { exerciseId: 'a-2', exerciseVersion: 1, senseId: 'a', source: 'retry' });
  assert.deepEqual(submission, before);
});

test('answering the final item completes the session', () => {
  const last = { ...session, cursor: 1 };
  const result = submitAnswer({ ...submission, session: last, exercise: exercises[2], answer: 'right' });
  assert.ok(result.ok);
  assert.deepEqual([result.commit.session.cursor, result.commit.session.status], [2, 'completed']);
});

test('mismatched, closed or malformed submissions are rejected without a payload', () => {
  assert.deepEqual(submitAnswer({ ...submission, exercise: exercises[2] }), { ok: false, code: 'exercise-mismatch' });
  assert.deepEqual(
    submitAnswer({ ...submission, exercise: { ...exercises[0], version: 2 } }),
    { ok: false, code: 'exercise-mismatch' },
  );
  assert.deepEqual(
    submitAnswer({ ...submission, session: { ...session, status: 'completed', cursor: 2 } }),
    { ok: false, code: 'session-closed' },
  );
  assert.deepEqual(submitAnswer({ ...submission, answer: ['right'] }), { ok: false, code: 'invalid-answer' });
  assert.deepEqual(submitAnswer({ ...submission, answer: null }), { ok: false, code: 'invalid-answer' });
});
