import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { staleRegistryFiles } from './episode-registry.ts';

const ROOT = path.resolve(__dirname, '..');

describe('success cases', () => {
  it('keeps the checked-in Episode registry in step with the Episode folders (else run `npm run episodes:registry`)', async () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const stale = await staleRegistryFiles(ROOT);
    // ASSERT
    expect(stale).toEqual(expected);
  });
});
