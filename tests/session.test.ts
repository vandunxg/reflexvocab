import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildQueue, addRecovery } from '../src/domain/session.ts';
import { startProgress } from '../src/domain/mastery.ts';
import type { CardProgress, Exercise, LearningSession, VocabularySense } from '../src/domain/model.ts';

const ids = ['a', 'b', 'c', 'd', 'e'];
const senses: VocabularySense[] = ids.map((id) => ({
  id, lessonId: 'lesson', headword: id, partOfSpeech: 'noun', definition: id,
  viGloss: null, ipa: null, collocations: [], version: 1,
}));
const exercises: Exercise[] = ids.map((senseId) => ({
  id: `exercise-${senseId}`, senseId, contextId: `context-${senseId}`, kind: 'definition-match',
  prompt: 'prompt', explanation: 'explanation', version: 1, active: true,
  choices: [{ id: 'one', text: 'one' }], correctChoiceId: 'one',
}));
const input = {
  config: { mode: 'daily' as const, questionBudget: 10 }, senses, exercises,
  topics: [{ id: 'topic', courseId: 'course', levelId: 'level', title: 'Topic', position: 0 }],
  lessons: [{ id: 'lesson', topicId: 'topic', title: 'Lesson', position: 0 }],
  progress: [] as CardProgress[], now: new Date('2026-11-26T17:00:00Z'), timezone: 'Asia/Ho_Chi_Minh',
  newPerDay: 3,
};
const sources = (queue: { senseId: string; source: string }[]) => queue.map((item) => [item.senseId, item.source]);

function seen(senseId: string, at: string, dueAt = '2026-12-10T00:00:00Z'): CardProgress {
  const progress = startProgress(senseId, new Date(at));
  progress.card.dueAt = dueAt;
  return progress;
}

test('a due and weak sense is selected once and due review never adds new items', () => {
  const card = seen('a', '2026-11-20T00:00:00Z', '2026-11-21T00:00:00Z');
  card.mistakeCount = 1;
  card.lastMistakeAt = '2026-11-21T00:00:00Z';
  const due = buildQueue({ ...input, config: { mode: 'due', questionBudget: 10 }, progress: [card] });
  assert.deepEqual(sources(due), [['a', 'due']]);
  const daily = buildQueue({ ...input, progress: [card] });
  assert.equal(daily.filter((item) => item.senseId === 'a').length, 1);
});

test('daily new quota is counted on the local calendar day, not the UTC date', () => {
  // 00:30 local time on the same local day, although its UTC date is the previous day.
  const exhausted = buildQueue({
    ...input, now: new Date('2026-11-27T03:00:00Z'), newPerDay: 1,
    progress: [seen('a', '2026-11-26T17:30:00Z')],
  });
  assert.deepEqual(exhausted, []);
  // 23:00 local time on the previous local day, although its UTC date is the same.
  const available = buildQueue({
    ...input, now: new Date('2026-11-27T17:30:00Z'), newPerDay: 1,
    progress: [seen('a', '2026-11-27T16:00:00Z')],
  });
  assert.deepEqual(sources(available), [['b', 'new']]);
});

test('a review backlog larger than the budget halves new intake', () => {
  const backlog = (count: number) =>
    ids.slice(0, count).map((id) => seen(id, '2026-11-01T00:00:00Z', '2026-11-20T00:00:00Z'));
  const daily = { ...input, config: { mode: 'daily' as const, questionBudget: 3 }, newPerDay: 1 };
  assert.deepEqual(sources(buildQueue({ ...daily, progress: backlog(3) })), [['a', 'due'], ['b', 'due'], ['d', 'new']]);
  assert.deepEqual(sources(buildQueue({ ...daily, progress: backlog(4) })), [['a', 'due'], ['b', 'due'], ['c', 'due']]);
});

test('filters remain strict and return an empty queue when there is no matching content', () => {
  const queue = buildQueue({
    ...input, config: { mode: 'custom', questionBudget: 10, topicId: 'topic', kinds: ['typing-cloze'] },
  });
  assert.deepEqual(queue, []);
});

test('recovery prefers another context, is spaced and stops after two retries', () => {
  const alternate: Exercise = { ...exercises[0], id: 'alternate', contextId: 'other' };
  const catalog = [...exercises, alternate];
  const queue = buildQueue({ ...input, newPerDay: 5 });
  const session: LearningSession = {
    id: 'session', config: input.config, queue, cursor: 0, revision: 0, retryCounts: {},
    status: 'current', startedAt: '2026-11-26T17:00:00Z', updatedAt: '2026-11-26T17:00:00Z',
  };
  const first = addRecovery(session, catalog);
  assert.deepEqual(first.queue[4], { exerciseId: 'alternate', exerciseVersion: 1, senseId: 'a', source: 'retry' });
  assert.deepEqual(first.queue.slice(0, 4), queue.slice(0, 4));
  // Failing the retry itself near the end of the queue still allows one shorter-spaced retry.
  const second = addRecovery({ ...first, cursor: 4 }, catalog);
  assert.equal(second.queue.at(-1)?.exerciseId, 'exercise-a');
  const third = addRecovery({ ...second, cursor: 6 }, catalog);
  assert.equal(third.retryCounts.a, 2);
  assert.equal(third.queue.filter((item) => item.source === 'retry').length, 2);
});
