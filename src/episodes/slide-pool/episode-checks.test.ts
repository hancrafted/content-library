import { slidePoolChecks } from '@/episodes/lib/episode-checks';
import { describe, expect, it } from 'vitest';

// decision: ARCH-003 §4.7
const CHECKS = slidePoolChecks(
  import.meta.dirname,
  import.meta.glob('./*/slide.tsx'),
  import.meta.glob('../*/episode.ts'),
);

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
  it('reads the Base Episodes, so an empty glob cannot pass a pool Slide as shared', () => {
    // ARRANGE
    const bases = Object.keys(import.meta.glob('../*/episode.ts'));
    const none = 0;
    // ACT
    const read = bases.length;
    // ASSERT
    expect(read).toBeGreaterThan(none);
  });
});
