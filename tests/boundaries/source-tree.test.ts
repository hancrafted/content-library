// decision: docs/decision-records/0017-source-tree-follows-the-product.md
import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('source tree', () => {
  it('holds exactly the routes, page assembly, the product areas, the content store and shared', () => {
    // ARRANGE
    const expected = [
      'app',
      'content-store',
      'episodes',
      'events',
      'explorables',
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
