import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { pageFolders } from '../../src/lib/episode-folders';

/*
 * The site-wide stylesheet holds only tokens Episodes share (FE-002 §7): an
 * Episode's styling lives in its own folder, so removing an Episode never
 * leaves a stray rule behind here. It can't sit beside `globals.css` (ARCH-003
 * §4.1): a file under src/app must be plain kebab-case (FE-006 lint), which a
 * `.test.ts` name breaks. So it lives with the other boundary tests and still
 * splits into the three blocks.
 */

const GLOBALS = readFileSync(path.join(__dirname, '../../src/app/globals.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);
const ROOT = path.join(__dirname, '../..');

describe('success cases', () => {
  it('declares the shared colour tokens on the root', () => {
    // ARRANGE
    const shared = ':root {\n  --radius: 0.625rem;\n  --background:';
    // ACT
    const stylesheet = GLOBALS;
    // ASSERT
    expect(stylesheet).toContain(shared);
  });
});

describe('failure cases', () => {
  it('names no Episode in a selector', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const selectors = GLOBALS.match(/\[data-episode[^\]]*\]/g) ?? [];
    // ASSERT
    expect(selectors).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('mentions no Episode by its folder name, even outside a data-episode selector', () => {
    // ARRANGE
    const expected: string[] = [];
    const episodes = [...new Set(pageFolders(ROOT).map(({ slug }) => slug))];
    // ACT
    const named = episodes.filter((episode) => GLOBALS.includes(episode));
    // ASSERT
    expect(named).toEqual(expected);
  });
});
