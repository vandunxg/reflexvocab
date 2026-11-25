import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildPath, nextLesson } from '../src/domain/curriculum.ts';
import type { CardProgress, Exercise, VocabularySense } from '../src/domain/model.ts';

const topics = [
  { id: 't2', courseId: 'c', levelId: 'foundation', title: 'Travel', position: 1 },
  { id: 't1', courseId: 'c', levelId: 'foundation', title: 'Office', position: 0 },
];
const lessons = [{ id: 'l1', topicId: 't1', title: 'Requests', position: 0 }, { id: 'l2', topicId: 't2', title: 'Trips', position: 0 }];
const sense = (id: string, lessonId: string) => ({ id, lessonId, headword: id } as VocabularySense);
const senses = [sense('a', 'l1'), sense('b', 'l1'), sense('draft', 'l1'), sense('c', 'l2')];
const exercises = ['a', 'b', 'c'].map((senseId) => ({ id: `e-${senseId}`, senseId, active: true } as Exercise));
const card = (senseId: string, masteryStage: CardProgress['masteryStage'] = 'learning') => ({ senseId, masteryStage } as CardProgress);

test('lesson completion requires committed coverage of every lesson sense', () => {
  const untouched = buildPath({ topics, lessons, senses, exercises, cards: [] });
  assert.deepEqual(untouched[0].lessons.map((item) => [item.lesson.id, item.status, item.covered, item.senses.length]),
    [['l1', 'untouched', 0, 3], ['l2', 'untouched', 0, 1]]);
  assert.equal(nextLesson(untouched)?.lesson.id, 'l1');

  const partial = buildPath({ topics, lessons, senses, exercises, cards: [card('a')] });
  assert.equal(partial[0].lessons[0].status, 'partial');

  const unavailable = buildPath({ topics, lessons, senses, exercises, cards: [card('a'), card('b', 'mastered')] });
  assert.equal(unavailable[0].lessons[0].status, 'partial');
  const complete = buildPath({ topics, lessons, senses, exercises, cards: [card('a'), card('b', 'mastered'), card('draft')] });
  assert.deepEqual([complete[0].lessons[0].status, complete[0].lessons[0].mastered], ['complete', 1]);
  assert.equal(nextLesson(complete)?.lesson.id, 'l2');
});

test('unavailable senses stay visible without making an impossible lesson the recommendation', () => {
  const path = buildPath({ topics, lessons, senses, exercises: exercises.filter((exercise) => exercise.senseId === 'c'), cards: [] });
  assert.deepEqual(path[0].lessons.map((item) => [item.lesson.id, item.unavailable]), [['l1', 3], ['l2', 0]]);
  assert.equal(nextLesson(path)?.lesson.id, 'l2');
});
