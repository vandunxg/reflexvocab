import assert from 'node:assert/strict';
import { test } from 'node:test';
import { studyActivity } from '../src/domain/activity.ts';
import type { Attempt } from '../src/domain/model.ts';

const attempt = (id: string, attemptedAt: string) => ({ id, attemptedAt } as Attempt);

test('activity and streak follow local calendar days across a timezone boundary', () => {
  const attempts = [
    attempt('a', '2026-11-24T17:30:00Z'),
    attempt('b', '2026-11-25T17:30:00Z'),
    attempt('b', '2026-11-25T17:30:00Z'),
  ];
  const now = new Date('2026-11-25T18:00:00Z');
  const activity = studyActivity(attempts, 1000, now, 'Asia/Ho_Chi_Minh');
  assert.equal(activity.today, '2026-11-26');
  assert.equal(activity.todayAttempts, 1);
  assert.equal(activity.streak, 2);
  assert.deepEqual(activity.days.slice(-2).map((day) => day.status), ['active', 'active']);
  assert.equal(studyActivity(attempts, 1000, now, 'UTC').today, '2026-11-25');
});

test('limited history does not imply older days were inactive or a streak ended', () => {
  const activity = studyActivity([attempt('a', '2026-11-25T12:00:00Z')], 1, new Date('2026-11-25T18:00:00Z'), 'UTC');
  assert.equal(activity.streak, 1);
  assert.equal(activity.streakLowerBound, true);
  assert.equal(activity.days[0].status, 'unknown');
});

test('yesterday keeps a streak and calendar dates stay consecutive across daylight saving', () => {
  const activity = studyActivity(
    [attempt('a', '2026-03-07T17:00:00Z'), attempt('b', '2026-03-08T16:00:00Z')],
    1000, new Date('2026-03-09T16:00:00Z'), 'America/New_York',
  );
  assert.equal(activity.streak, 2);
  assert.deepEqual(activity.days.slice(-3).map(({ day, status }) => [day, status]), [
    ['2026-03-07', 'active'], ['2026-03-08', 'active'], ['2026-03-09', 'inactive'],
  ]);
  assert.equal(studyActivity([], 1000, new Date('2026-03-09T16:00:00Z'), 'America/New_York').streak, 0);
});
