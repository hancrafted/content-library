import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { staleRegistryFiles, type SiteLoader } from './registry.ts';

const ROOT = path.resolve(__dirname, '../..');

const load: SiteLoader = (repoPath) => import(path.join(ROOT, repoPath));

describe('success cases', () => {
  it('keeps the checked-in registries and Episode routes in step with the Episode folders, record files and page catalogue (else run `npm run registry`)', async () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const stale = await staleRegistryFiles(ROOT, load);
    // ASSERT
    expect(stale).toEqual(expected);
  }, 60_000);
});
