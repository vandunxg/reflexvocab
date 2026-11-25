import assert from 'node:assert/strict';
import { test } from 'node:test';
import { feedbackHeading, hintItems, shuffle } from '../src/features/session/content.ts';
import type { Exercise, VocabularySense } from '../src/domain/model.ts';

const sense: VocabularySense = {
  id: 'file', lessonId: 'lesson', headword: 'file', partOfSpeech: 'verb',
  definition: 'to officially submit a document or request', viGloss: 'nộp chính thức',
  ipa: null, collocations: ['file a report'], version: 1,
};
const base = { id: 'x', senseId: 'file', contextId: 'c', prompt: 'p', explanation: 'e', version: 1, active: true };

test('a definition question hint never exposes the definition or its gloss', () => {
  const exercise: Exercise = {
    ...base, kind: 'definition-match',
    choices: [{ id: 'a', text: sense.definition }, { id: 'b', text: 'to throw away' }], correctChoiceId: 'a',
  };
  const values = hintItems(exercise, sense).map((item) => item.value);
  assert.ok(values.length > 0);
  assert.ok(values.every((value) => !value.includes(sense.definition) && !value.includes(sense.viGloss!)));
});

test('supported answers are never worded as independent recall', () => {
  assert.equal(feedbackHeading(true, 'revealed'), 'revealed');
  assert.equal(feedbackHeading(false, 'revealed'), 'revealed');
  assert.equal(feedbackHeading(true, 'hinted'), 'correctSupported');
  assert.equal(feedbackHeading(true, 'retry'), 'correctRetry');
  assert.equal(feedbackHeading(true, 'independent'), 'correct');
});

test('sentence chunks are never presented already in the correct order', () => {
  const chunks = ['a', 'b', 'c', 'd'];
  const identity = () => 0.999; // floor(0.999 * (i + 1)) === i: Fisher–Yates performs no swaps.
  assert.notDeepEqual(shuffle(chunks, identity), chunks);
  assert.deepEqual([...shuffle(chunks, identity)].sort(), chunks);
  assert.deepEqual(shuffle(['only'], identity), ['only']);
});
