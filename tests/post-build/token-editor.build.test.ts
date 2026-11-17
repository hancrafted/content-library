import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { OUT_DIR } from './exported-pages';

const MARKERS = [
  'design-system-token-editor',
  'Copy changed',
  'Adopt these design-token changes',
  'Corner rounding of cards',
];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(js|html|css|txt|json)$/.test(name) ? [path] : [];
  });
}

describe('the exported site', () => {
  it('holds none of the dev-only design-system token editor, whose strings occur only in its source', () => {
    // ARRANGE
    const all = files(OUT_DIR);
    // ACT
    const hits = all.flatMap((file) => {
      const text = readFileSync(file, 'utf8');
      return MARKERS.filter((marker) => text.includes(marker)).map((marker) => `${file}: ${marker}`);
    });
    // ASSERT
    expect(all.length).toBeGreaterThan(0);
    expect(hits).toEqual([]);
  });
});
