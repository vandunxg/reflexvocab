import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createClient } from '@supabase/supabase-js';
import { loadCatalog } from '../src/lib/catalog.ts';

test('catalog loads every row when the server returns short pages', async () => {
  const client = createClient('https://example.supabase.co', 'sb_publishable_test', {
    global: {
      fetch: async (input) => {
        const url = new URL(String(input));
        const offset = Number(url.searchParams.get('offset') ?? 0);
        return Response.json(offset < 2 ? [{ id: `${url.pathname}-${offset}`, payload: {} }] : []);
      },
    },
  });
  const catalog = await loadCatalog(client);
  for (const rows of Object.values(catalog)) {
    assert.equal(rows.length, 2);
  }
});
