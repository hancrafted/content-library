import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { LEARNINGS_README } from './setup.pure.ts';

const REPO_ROOT = path.resolve(import.meta.dirname, '../../..');

describe('the learnings store README', () => {
  it('is the text drive setup seeds, so the two copies cannot drift', () => {
    // ARRANGE
    const seeded = LEARNINGS_README;
    // ACT
    const repoCopy = readFileSync(path.join(REPO_ROOT, 'docs/drive/learnings/README.md'), 'utf8');
    // ASSERT
    expect(repoCopy).toBe(seeded);
  });
});
