import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPrivateAuth } from '../src/lib/auth.ts';

test('missing browser config is reported without creating a client', () => {
  assert.deepEqual(createPrivateAuth({}), { ok: false, code: 'missing-config' });
});

test('a privileged key cannot initialize the browser client', () => {
  assert.deepEqual(
    createPrivateAuth({ url: 'https://example.supabase.co', publishableKey: 'sb_secret_test' }),
    { ok: false, code: 'invalid-config' },
  );
});

test('a local Supabase URL and publishable key initialize the browser client', () => {
  assert.equal(
    createPrivateAuth({ url: 'http://127.0.0.1:54321', publishableKey: 'sb_publishable_test' }).ok,
    true,
  );
});
