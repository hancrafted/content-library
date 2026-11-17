import { EPISODE_CHECKS_TEST as CHECKS_TEST, pageFolders, slideFolders } from '@/episodes/lib/episode-folders';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const SLIDE_POOL = path.join(ROOT, 'src/episodes/slide-pool');

describe('success cases', () => {
  it('gives every page folder its own Episode-level checks test', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const unchecked = pageFolders(ROOT)
      .filter(({ dir }) => !existsSync(path.join(dir, CHECKS_TEST)))
      .map(
        ({ folder }) => `${folder} has no ${CHECKS_TEST}: copy src/episodes/templates/episode-template/${CHECKS_TEST}`,
      );
    // ASSERT
    expect(unchecked).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('gives the Slide pool its own Episode-level checks test', () => {
    // ARRANGE
    const expected = path.join(SLIDE_POOL, CHECKS_TEST);
    // ACT
    const found = existsSync(expected) ? expected : 'none';
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('finds Slide folders, so an empty walk cannot pass', () => {
    // ARRANGE
    const none = 0;
    // ACT
    const walked = slideFolders(ROOT).length;
    // ASSERT
    expect(walked).toBeGreaterThan(none);
  });
});
