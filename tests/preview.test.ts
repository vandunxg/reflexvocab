import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createClient } from '@supabase/supabase-js';
import { loadSignInPreview } from '../src/lib/preview.ts';

test('preview accepts only the public display fields and rejects malformed content', async () => {
  let body: unknown = { topic: 'Office', prompt: 'Choose', choices: ['one', 'two'] };
  const client = createClient('https://example.supabase.co', 'sb_publishable_test', {
    global: { fetch: async () => Response.json(body) },
  });
  assert.deepEqual(await loadSignInPreview(client), body);
  body = { topic: 'Office', prompt: 'Choose', choices: [null] };
  assert.equal(await loadSignInPreview(client), null);
});
