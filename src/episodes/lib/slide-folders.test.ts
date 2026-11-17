import { EPISODE_CHECKS_TEST as CHECKS_TEST, pageFolders, slideFolders } from '@/episodes/lib/episode-folders';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * The cross-Episode half of the Slide-folder checks. A Slide is one folder `slides/<slide>/` named after its slug (#51,
 * FE-002); whether each folder holds the one Slide it is named after, its Speaker-note keys, and an Episode's missing
 * `parts/` or `client/` folders are Episode-level checks (`episode-checks.ts`), run by each page folder's own
 * `episode-checks.test.ts` and the Slide pool's. This test reads only folder names, never a Slide module: it holds
 * that every page folder, an Event's copies, the Templates and the Slide pool included, carries that test, so no folder
 * goes unchecked.
 */

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
