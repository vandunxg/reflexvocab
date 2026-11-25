import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCard, scheduleRecall } from '../src/domain/fsrs.ts';

test('first exposure can initialize a card without recording a review', () => {
  const initial = createCard(new Date('2026-11-25T10:00:00Z'));
  assert.equal(initial.data.reps, 0);
  assert.equal(initial.dueAt, '2026-11-25T10:00:00.000Z');
});

test('scheduler cards survive JSON serialization and can be reviewed again', () => {
  const first = scheduleRecall(undefined, 'good', new Date('2026-11-25T10:00:00Z'));
  const saved = JSON.parse(JSON.stringify(first));
  const next = scheduleRecall(saved, 'good', new Date(first.dueAt));
  assert.equal(first.version, 1);
  assert.equal(typeof first.dueAt, 'string');
  assert.ok(new Date(next.dueAt).getTime() > new Date(first.dueAt).getTime());
  assert.equal(next.version, 1);
});

test('scheduler refuses an unsupported saved card instead of resetting it', () => {
  assert.throws(() => scheduleRecall(
    { version: 99, dueAt: '2026-11-25T00:00:00Z', data: {} },
    'good', new Date('2026-11-25T00:00:00Z'),
  ));
});

test('scheduler rejects corrupt card counters', () => {
  const saved = scheduleRecall(undefined, 'good', new Date('2026-11-25T10:00:00Z'));
  saved.data.reps = -1;
  assert.throws(() => scheduleRecall(saved, 'good', new Date(saved.dueAt)));
});
