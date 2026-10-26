// Pins the source tree's top level (#357, spec #348): `src/` follows the product, so it holds the routes, page
// assembly, the four product areas, the content store and shared, plus the site-wide Translation files until they
// move to their owners. The old technical roots (`components/`, `lib/`, `hooks/`) are gone.

import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('source tree', () => {
  it('holds exactly the routes, page assembly, the product areas, the content store, shared and the site Translation files', () => {
    // ARRANGE
    const expected = [
      'app',
      'content-store',
      'episodes',
      'events',
      'explorable-explanations',
      'messages',
      'page-assembly',
      'pipeline',
      'shared',
    ];
    // ACT
    const found = readdirSync('src')
      .filter((name) => !name.startsWith('.'))
      .sort();
    // ASSERT
    expect(found).toEqual(expected);
  });
});
