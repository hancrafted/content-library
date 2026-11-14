import { describe, expect, it } from 'vitest';
import { MASTHEAD, PENNANT_ROWS, RAIL_ROWS, specDeckY } from './ship-facets.pure';

/*
 * The research ship's facet table in the Spec's own units (stern at x = 0, waterline at y = 0, bow to the right): the
 * deck line every figure stands on, the rails along it, and the pennant flying from the masthead above the radar,
 * streaming aft in the wind.
 */

/** The flat `x, y, x, y, …` list of a facet row as points. */
const pointsOf = (flat: readonly number[]) =>
  Array.from({ length: flat.length / 2 }, (_, index) => ({ x: flat[2 * index]!, y: flat[2 * index + 1]! }));

describe('success cases', () => {
  it('runs the deck from the stern up to the bow, rising 8 units over its length', () => {
    // ARRANGE
    const expected = { stern: -29, amidships: -33, bow: -37 };
    // ACT
    const seen = { stern: specDeckY(-4), amidships: specDeckY(143), bow: specDeckY(290) };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('flies the pennant from the masthead above the radar: a staff, a lit upper half and a shaded lower half', () => {
    // ARRANGE
    const expected = {
      masthead: { x: 193, y: -179 },
      tones: ['hull', 'pennant-lit', 'pennant'],
      staff: [
        { x: -0.6, y: 0 },
        { x: 0.6, y: 0 },
        { x: 0.6, y: 15 },
        { x: -0.6, y: 15 },
      ],
    };
    // ACT
    const seen = {
      masthead: MASTHEAD,
      tones: PENNANT_ROWS.map(([tone]) => tone),
      staff: pointsOf(PENNANT_ROWS[0]![1]),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('stands every rail post on the deck, a post every 16 units aft and on the foredeck', () => {
    // ARRANGE
    const expected = { bars: 2, posts: 7 + 2, floating: [] };
    // ACT
    const bars = RAIL_ROWS.filter(([tone]) => tone === 'house-lit');
    const posts = RAIL_ROWS.filter(([tone]) => tone === 'house-shade');
    const floating = posts.map(([, flat]) => pointsOf(flat)[3]!).filter(({ x, y }) => y !== specDeckY(x));
    // ASSERT
    expect({ bars: bars.length, posts: posts.length, floating }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never lets the pennant blow forward of its staff, since it streams aft in the wind', () => {
    // ARRANGE
    const staffHalfWidth = 0.6;
    // ACT
    const forward = PENNANT_ROWS.flatMap(([, flat]) => pointsOf(flat)).filter(({ x }) => x > staffHalfWidth);
    // ASSERT
    expect(forward).toEqual([]);
  });
});

describe('edge cases', () => {
  it('cuts a notch at the fly: the flag reaches 26 units aft at its edges but only 21 at its middle', () => {
    // ARRANGE
    const expected = { reach: -26, notch: [{ x: -21, y: 4.2 }] };
    // ACT
    const fly = PENNANT_ROWS.slice(1).flatMap(([, flat]) => pointsOf(flat));
    const reach = Math.min(...fly.map(({ x }) => x));
    const notch = [...new Map(fly.filter(({ x }) => x > reach && x < 0).map((p) => [`${p.x}:${p.y}`, p])).values()];
    // ASSERT
    expect({ reach, notch }).toEqual(expected);
  });
});
