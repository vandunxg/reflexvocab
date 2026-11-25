// Data API integration check against the authorized hosted development project.
// Requires VITE_SUPABASE_* and TEST_EMAIL_1/2, TEST_PASSWORD_1/2 from .env.local; writes learning
// data for test account 1. Reset afterwards with scripts/reset-test-accounts.sql.
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { loadCatalog } from '../src/lib/catalog.ts';
import { createLearningRepository } from '../src/lib/repository.ts';
import { buildQueue } from '../src/domain/session.ts';
import { submitAnswer } from '../src/domain/transition.ts';
import type { Exercise, LearningSession } from '../src/domain/model.ts';
const env = process.env;
async function signIn(i: 1 | 2) {
  const client = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email: env['TEST_EMAIL_' + i]!, password: env['TEST_PASSWORD_' + i]! });
  if (error) throw error;
  return client;
}
const wrong = (e: Exercise) => e.kind === 'typing-cloze' ? 'zzz' : e.kind === 'sentence-build' ? [...e.correctOrder].reverse()
  : e.choices.find((c) => c.id !== e.correctChoiceId)!.id;
const errorCode = (p: Promise<unknown>) => p.then(() => 'resolved', (e) => e.code);

const a = await signIn(1);
const catalog = await loadCatalog(a);
assert.equal(new Set(catalog.exercises.filter((e) => e.active).map((e) => e.kind)).size, 5);
console.log('catalog:', catalog.topics.length, 'topics,', catalog.senses.length, 'senses,', catalog.exercises.length, 'exercises, 5 kinds');
const repoA = createLearningRepository(a);
const snap = await repoA.load();
const now = new Date();
const config = { mode: 'daily' as const, questionBudget: 3 };
const queue = buildQueue({ config, ...catalog, progress: snap.cards, now,
  timezone: snap.settings?.timezone ?? 'Asia/Ho_Chi_Minh', newPerDay: snap.settings?.newPerDay ?? 8 });
assert.ok(queue.length > 0, 'empty queue');
const session: LearningSession = { id: randomUUID(), config, queue, cursor: 0, revision: 0, retryCounts: {},
  status: 'current', startedAt: now.toISOString(), updatedAt: now.toISOString() };
await repoA.startSession(session);
await repoA.startSession(session);
const exercise = catalog.exercises.find((e) => e.id === queue[0].exerciseId)!;
const t = submitAnswer({ session, exercise, progress: snap.cards.find((c) => c.senseId === exercise.senseId),
  exercises: catalog.exercises, answer: wrong(exercise), hintUsed: false, answerRevealed: false,
  attemptId: randomUUID(), attemptedAt: new Date(), responseTimeMs: 1500, timezone: 'Asia/Ho_Chi_Minh' });
assert.ok(t.ok);
await Promise.all([repoA.commitAttempt(t.commit), repoA.commitAttempt(t.commit)]);
const after = await repoA.load();
assert.equal(after.attempts.filter((x) => x.id === t.commit.attempt.id).length, 1);
assert.deepEqual([after.currentSession?.id, after.currentSession?.cursor, after.currentSession?.revision], [session.id, 1, 1]);
assert.deepEqual(after.currentSession?.queue, t.commit.session.queue);
assert.ok(after.cards.some((c) => c.senseId === exercise.senseId));
console.log('saved one wrong answer; two concurrent deliveries stored one attempt; retry queued:', t.commit.session.queue.length > queue.length);
const stale = submitAnswer({ session, exercise, progress: undefined, exercises: catalog.exercises, answer: wrong(exercise),
  hintUsed: false, answerRevealed: false, attemptId: randomUUID(), attemptedAt: new Date(), responseTimeMs: null, timezone: 'UTC' });
assert.ok(stale.ok);
assert.equal(await errorCode(repoA.commitAttempt(stale.commit)), 'conflict');
assert.equal(await errorCode(repoA.commitAttempt(t.commit)), 'resolved');
console.log('fresh stale write -> conflict; exact replay after advance -> acknowledged');
await a.auth.signOut();

const b = await signIn(2);
const repoB = createLearningRepository(b);
const other = await repoB.load();
assert.ok(other.currentSession?.id !== session.id && !other.attempts.some((x) => x.id === t.commit.attempt.id));
const direct = await b.from('attempts').select('id').eq('id', t.commit.attempt.id);
assert.equal(direct.data?.length, 0);
assert.equal(await errorCode(repoB.commitAttempt(t.commit)), 'conflict');
assert.equal((await repoB.load()).attempts.length, other.attempts.length);
console.log("account 2 cannot read account 1's session/attempt; replaying account 1's payload is rejected");
await b.auth.signOut();
