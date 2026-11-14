import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { animatedProperties, blursAndShadows, globalsRead } from '../iceberg/scenery/fable-contract.test-support';

/*
 * The ship's CSS module, read from disk, against its frozen interface (decisions 15–17 and 19 of feedback 2): it
 * mixes only from the tokens its JSDoc names and moves only by transform or opacity, with no blur, filter or shadow.
 * It reads the CSS rather than importing it, so the slow lane names it as a rerun trigger (vitest.slow.config.mts).
 */

const css = () => readFileSync(path.join(import.meta.dirname, 'ship.module.css'), 'utf8');

describe('success cases', () => {
  it('mixes the ship only from the tokens its interface names', () => {
    // ARRANGE
    const tokens = ['--info', '--brand-accent', '--bulb', '--on-brand-accent', '--overlay'];
    // ACT
    const strays = globalsRead(css()).filter((token) => !tokens.includes(token));
    // ASSERT
    expect(strays).toEqual([]);
  });
});

describe('failure cases', () => {
  it('gives the ship no blur, filter or shadow', () => {
    // ARRANGE
    const stylesheet = css();
    // ACT
    const found = blursAndShadows(stylesheet);
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('edge cases', () => {
  it('rocks the ship and flutters its pennant only by transform or opacity', () => {
    // ARRANGE
    const allowed = ['transform', 'opacity'];
    // ACT
    const others = animatedProperties(css()).filter((property) => !allowed.includes(property));
    // ASSERT
    expect(others).toEqual([]);
  });
});
