import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { staleRegistryFiles } from './registry.ts';

const ROOT = path.resolve(__dirname, '..');

describe('success cases', () => {
  it('keeps the checked-in Episode and Event registries in step with the Episode folders and Event files (else run `npm run registry`)', async () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const stale = await staleRegistryFiles(ROOT);
    // ASSERT
    expect(stale).toEqual(expected);
  });
});
