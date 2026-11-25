import assert from 'node:assert/strict';
import { test } from 'node:test';
import { en } from '../src/locales/en.ts';
import { vi } from '../src/locales/vi.ts';

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Map<string, string> {
  const entries = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') entries.set(path, value);
    else for (const [nested, text] of flatten(value, path)) entries.set(nested, text);
  }
  return entries;
}

const placeholders = (text: string) => [...text.matchAll(/{{\s*(\w+)/g)].map((match) => match[1]).sort();

test('en and vi catalogs have the same keys, non-empty text and matching interpolation variables', () => {
  const english = flatten(en);
  const vietnamese = flatten(vi as Tree);
  assert.deepEqual([...vietnamese.keys()].sort(), [...english.keys()].sort());
  for (const [key, text] of english) {
    const translated = vietnamese.get(key)!;
    assert.ok(text.trim() && translated.trim(), `empty text for ${key}`);
    assert.deepEqual(placeholders(translated), placeholders(text), `placeholders differ for ${key}`);
  }
});
