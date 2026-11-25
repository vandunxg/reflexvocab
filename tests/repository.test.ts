import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createClient } from '@supabase/supabase-js';
import { createLearningRepository } from '../src/lib/repository.ts';

test('repository loads owner-scoped rows without turning missing settings into fake data', async () => {
  const client = createClient('https://example.supabase.co', 'sb_publishable_test', {
    global: {
      fetch: async (input) => {
        const url = new URL(String(input));
        const rows: Record<string, unknown> = {
          '/rest/v1/card_progress': [{
            sense_id: 'sense', card: { version: 1, dueAt: '2026-11-26', data: {} },
            first_seen_at: '2026-11-25', mastery_stage: 'learning',
            evidence: { reviewDays: [], contextIds: [], hasTypingSuccess: false },
            mistake_count: 0, last_mistake_at: null,
          }],
          '/rest/v1/attempts': [],
          '/rest/v1/learning_sessions': [],
          '/rest/v1/user_settings': [],
          '/rest/v1/bookmarks': [{ sense_id: 'sense' }],
        };
        const result = Number(url.searchParams.get('offset') ?? 0) > 0
          ? [] : rows[url.pathname] ?? [];
        return Response.json(result, { status: 200 });
      },
    },
  });
  const snapshot = await createLearningRepository(client).load();
  assert.equal(snapshot.cards[0].senseId, 'sense');
  assert.deepEqual(snapshot.bookmarks, [{ senseId: 'sense' }]);
  assert.equal(snapshot.settings, null);
  assert.equal(snapshot.currentSession, null);
  assert.equal(snapshot.attemptHistoryLimit, 1000);
});

test('repository loads every card and bookmark when the server limits page size', async () => {
  const client = createClient('https://example.supabase.co', 'sb_publishable_test', {
    global: {
      fetch: async (input) => {
        const url = new URL(String(input));
        const offset = Number(url.searchParams.get('offset') ?? 0);
        const id = ['one', 'two'][offset];
        if (url.pathname === '/rest/v1/card_progress' && id) {
          return Response.json([{
            sense_id: id, card: { version: 1, dueAt: '2026-11-26', data: {} },
            first_seen_at: '2026-11-25', mastery_stage: 'learning',
            evidence: { reviewDays: [], contextIds: [], hasTypingSuccess: false },
            mistake_count: 0, last_mistake_at: null,
          }]);
        }
        if (url.pathname === '/rest/v1/bookmarks' && id) {
          return Response.json([{ sense_id: id }]);
        }
        return Response.json([]);
      },
    },
  });
  const snapshot = await createLearningRepository(client).load();
  assert.deepEqual(snapshot.cards.map((card) => card.senseId), ['one', 'two']);
  assert.deepEqual(snapshot.bookmarks.map((bookmark) => bookmark.senseId), ['one', 'two']);
});

test('repository surfaces revision conflicts instead of reporting a successful save', async () => {
  const client = createClient('https://example.supabase.co', 'sb_publishable_test', {
    global: {
      fetch: async () => Response.json({ code: '40001', message: 'session conflict' }, { status: 409 }),
    },
  });
  const repository = createLearningRepository(client);
  await assert.rejects(repository.setBookmark('sense', true), { code: 'conflict' });
});

test('attempt history reaches its declared limit even when the server returns short pages', async () => {
  const client = createClient('https://example.supabase.co', 'sb_publishable_test', {
    global: {
      fetch: async (input) => {
        const url = new URL(String(input));
        const offset = Number(url.searchParams.get('offset') ?? 0);
        if (url.pathname !== '/rest/v1/attempts' || offset >= 2) return Response.json([]);
        return Response.json([{
          id: `attempt-${offset}`, session_id: 'session', exercise_id: 'exercise', sense_id: 'sense',
          context_id: 'context', exercise_kind: 'typing-cloze', exercise_version: 1, answer: 'word',
          outcome: 'correct', hint_used: false, answer_revealed: false, is_retry: false,
          qualified_review: true, grade: 'good', attempted_at: '2026-11-25', response_time_ms: null,
        }]);
      },
    },
  });
  const snapshot = await createLearningRepository(client).load();
  assert.deepEqual(snapshot.attempts.map((attempt) => attempt.id), ['attempt-0', 'attempt-1']);
});
