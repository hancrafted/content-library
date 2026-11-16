import { slidePoolChecks } from '@/episodes/lib/episode-checks';
import { describe, expect, it } from 'vitest';

/*
 * The Episode-level checks on the Slide pool's folders (ARCH-003 §4.7, `src/episodes/lib/episode-checks.ts`). The glob puts
 * every pool Slide in this test's import graph, so `vitest --changed` runs it when one of them changes.
 */

const CHECKS = slidePoolChecks(import.meta.dirname, import.meta.glob('./*/slide.tsx'));

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
  it('checks each Slide folder for its server entry, so a folder holding a Slide under another name fails', () => {
    // ARRANGE
    const entryCheck = 'gives every Slide folder a slide.tsx, so no folder holds a Slide under another name';
    // ACT
    const names = CHECKS.folder.map(({ name }) => name);
    // ASSERT
    expect(names).toContain(entryCheck);
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
