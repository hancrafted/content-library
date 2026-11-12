import { describe, expect, it } from 'vitest';
import { fadeStops, sliceOf, spanRange } from './spans.pure';

describe('success cases', () => {
  it('turns a span from the middle of Agents to the end of Factory into positions on the four Levels', () => {
    // ARRANGE
    const from = { level: 'agents', at: 'mid' } as const;
    const to = { level: 'factory', at: 'end' } as const;
    const range = [1.5, 4];
    // ACT
    const placed = spanRange(from, to);
    // ASSERT
    expect(placed).toEqual(range);
  });

  it("cuts a span to one Level's card, marking that it carries on into the next card", () => {
    // ARRANGE
    const range = [1.5, 4] as const;
    const agentsSlice = { left: 50, width: 50, continues: true };
    const factorySlice = { left: 0, width: 100, continues: false };
    // ACT
    const cuts = [sliceOf(range, 'agents'), sliceOf(range, 'factory')];
    // ASSERT
    expect(cuts).toEqual([agentsSlice, factorySlice]);
  });

  it('places the strength stops of a fading span on the part that is drawn', () => {
    // ARRANGE
    const stops = [
      [0, 0.2],
      [0.5, 1],
      [1, 0.4],
    ] as const;
    // The span runs 1 to 3; the Workflows card shows 2 to 3, the fading half from full strength down.
    const shown = [2, 3] as const;
    const drawn = [
      { at: 0, strength: 1 },
      { at: 100, strength: 0.4 },
    ];
    // ACT
    const placed = fadeStops(stops, [1, 3], shown);
    // ASSERT
    expect(placed).toEqual(drawn);
  });
});

describe('failure cases', () => {
  it('gives a Level outside the span no slice', () => {
    // ARRANGE
    const range = [3, 4] as const;
    // ACT
    const cut = sliceOf(range, 'prompting');
    // ASSERT
    expect(cut).toBeNull();
  });
});

describe('edge cases', () => {
  it('draws a span without stops at one even strength', () => {
    // ARRANGE
    const even = [
      { at: 0, strength: 0.6 },
      { at: 100, strength: 0.6 },
    ];
    // ACT
    const placed = fadeStops(undefined, [0, 4], [0, 4]);
    // ASSERT
    expect(placed).toEqual(even);
  });

  it('gives a span that only touches a Level at its edge no slice there', () => {
    // ARRANGE
    const range = [2, 4] as const;
    // ACT
    const cut = sliceOf(range, 'agents');
    // ASSERT
    expect(cut).toBeNull();
  });
});
