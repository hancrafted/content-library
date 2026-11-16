import { episodeChecks } from '@/episodes/lib/episode-checks';
import { describe, expect, it } from 'vitest';

/*
 * The Episode-level checks on this folder alone (ARCH-003 §4.7, `src/episodes/lib/episode-checks.ts`). The glob puts
 * every Slide here in this test's import graph, so `vitest --changed` runs it when one of them changes.
 */

const CHECKS = episodeChecks(import.meta.dirname, import.meta.glob('./slides/*/slide.tsx'));

describe('success cases', () => {
  it.each(CHECKS.slides)('$name', async ({ findings }) => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const found = await findings();
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it.each(CHECKS.folder)('$name', async ({ findings }) => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const found = await findings();
    // ASSERT
    expect(found).toEqual(expected);
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
