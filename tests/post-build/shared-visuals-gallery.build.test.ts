import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { OUT_DIR } from './exported-pages';

// The Shared visuals gallery is dev-only (docs/features/context-window.md): `next build` must not ship it. These
// strings occur only in the gallery's source, so any hit means it reached the export.
const MARKERS = ['Shared visuals · context window', 'Sample call', 'id="shared-visuals"'];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(js|html|txt)$/.test(name) ? [path] : [];
  });
}

describe('the exported site', () => {
  it('holds none of the dev-only Shared visuals gallery', () => {
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
