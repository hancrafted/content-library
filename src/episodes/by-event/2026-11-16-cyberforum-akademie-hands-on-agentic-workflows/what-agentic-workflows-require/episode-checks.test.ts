import { episodeChecks } from '@/episodes/lib/episode-checks';
import { describe, expect, it } from 'vitest';

// decision: ARCH-003 §4.7
const PAGE = import.meta.glob('./episode.ts');
const CHECKS = episodeChecks(import.meta.dirname, {}, PAGE);

describe('success cases', () => {
  it.each(CHECKS.folder)('$name', async ({ findings }) => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const found = await findings();
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reads the composition, so a folder checked without its episode.ts fails', () => {
    // ARRANGE
    const composition = './episode.ts';
    // ACT
    const files = Object.keys(PAGE);
    // ASSERT
    expect(files).toContain(composition);
  });
});

describe('edge cases', () => {
  it('runs folder checks, so an empty list cannot pass', () => {
    // ARRANGE
    const none = 0;
    // ACT
    const checked = CHECKS.folder.length;
    // ASSERT
    expect(checked).toBeGreaterThan(none);
  });
});
