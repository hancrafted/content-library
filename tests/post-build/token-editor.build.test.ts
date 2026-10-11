import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { OUT_DIR } from './exported-pages';

// The design-system token editor is dev-only (docs/design-system/README.md): `next build` must not ship it.
// These strings occur only in its source, so any hit means its code reached the export.
const MARKERS = ['design-system-token-editor', 'Copy changed', 'Adopt these design-token changes'];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(js|html|css|txt|json)$/.test(name) ? [path] : [];
  });
}

describe('the exported site', () => {
  it('holds none of the design-system token editor', () => {
    const all = files(OUT_DIR);
    expect(all.length).toBeGreaterThan(0);
    const hits = all.flatMap((file) => {
      const text = readFileSync(file, 'utf8');
      return MARKERS.filter((marker) => text.includes(marker)).map((marker) => `${file}: ${marker}`);
    });
    expect(hits).toEqual([]);
  });
});
