import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * The site-wide stylesheet holds only tokens Episodes share (FE-002 §7): an
 * Episode's styling lives in its own folder, so removing an Episode never
 * leaves a stray rule behind here.
 */

const GLOBALS = readFileSync(path.join(__dirname, '../../src/app/globals.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

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
