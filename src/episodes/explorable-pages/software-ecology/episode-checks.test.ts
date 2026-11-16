import { episodeChecks } from '@/episodes/lib/episode-checks';
import { describe, expect, it } from 'vitest';

/*
 * The Episode-level checks on this folder alone (ARCH-003 §4.7, `src/episodes/lib/episode-checks.ts`). The globs put
 * every Slide and the composition here in this test's import graph, so `vitest --changed` runs it when one changes.
 * A page folder gets this file with its copy of `src/episodes/templates/episode-template/` or of an Episode.
 */

const PAGE = import.meta.glob('./episode.ts');
const CHECKS = episodeChecks(import.meta.dirname, import.meta.glob('./slides/*/slide.tsx'), PAGE);

describe('success cases', () => {
  it.each(CHECKS.slides)('$name', async ({ findings }) => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const found = await findings();
    // ASSERT
    expect(found).toEqual(expected);
  });

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
  it('finds Slide folders to check, so an empty glob cannot pass', () => {
    // ARRANGE
    const none = 0;
    // ACT
    const checked = CHECKS.slides.length;
    // ASSERT
    expect(checked).toBeGreaterThan(none);
  });
});
