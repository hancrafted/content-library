import { describe, expect, it } from 'vitest';
import type { PlacedBlock } from './context.pure';
import { loupeFrame, loupePlacement, loupeRows } from './loupe.pure';

const WINDOW = 120;
const blocks: PlacedBlock[] = Array.from({ length: 12 }, (_, i) => ({
  key: `m${i}@user`,
  id: `m${i}`,
  cat: 'user',
  tokens: 10,
  start: i * 10,
}));
const BAR = { barHeight: 600, height: 288 };

describe('success cases', () => {
  it('shows the hovered block with two before and two after', () => {
    // ARRANGE
    const expected = { ids: ['m4', 'm5', 'm6', 'm7', 'm8'], cursor: 'm6@user' };
    // ACT
    const { rows, cursor } = loupeRows(blocks, { at: 65 / WINDOW, windowTokens: WINDOW });
    // ASSERT
    expect({ ids: rows.map((b) => b.id), cursor }).toEqual(expected);
  });

  it('shows as many blocks before and after as asked', () => {
    // ARRANGE
    const expected = ['m5', 'm6', 'm7', 'm8', 'm9', 'm10'];
    // ACT
    const { rows } = loupeRows(blocks, { at: 65 / WINDOW, windowTokens: WINDOW }, { before: 1, after: 4 });
    // ASSERT
    expect(rows.map((b) => b.id)).toEqual(expected);
  });

  it('frames exactly the blocks the zoom lists, as pixels down the bar', () => {
    // ARRANGE
    const { rows } = loupeRows(blocks, { at: 65 / WINDOW, windowTokens: WINDOW });
    const expected = { top: (40 / WINDOW) * BAR.barHeight, height: (50 / WINDOW) * BAR.barHeight };
    // ACT
    const frame = loupeFrame(rows, WINDOW, BAR.barHeight);
    // ASSERT
    expect(frame).toEqual(expected);
  });

  it('frames the two pixels a tiny block really takes, not its share of the window', () => {
    // ARRANGE
    const minHeight = 2;
    const tiny: PlacedBlock[] = [{ key: 't@user', id: 't', cat: 'user', tokens: 1, start: 0 }];
    // ACT
    const frame = loupeFrame(tiny, 1_000_000, BAR.barHeight);
    // ASSERT
    expect(frame).toEqual({ top: 0, height: minHeight });
  });

  it('puts the pointer-tracking tail at the hovered height inside the zoom', () => {
    // ARRANGE
    const pointer = BAR.barHeight / 2;
    const expected = { y: pointer - BAR.height / 2, tail: BAR.height / 2 };
    // ACT
    const place = loupePlacement({ at: 0.5, ...BAR });
    // ASSERT
    expect(place).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('frames nothing when the zoom lists no block', () => {
    // ARRANGE
    const none: PlacedBlock[] = [];
    // ACT
    const frame = loupeFrame(none, WINDOW, BAR.barHeight);
    // ASSERT
    expect(frame).toBeNull();
  });
});

describe('edge cases', () => {
  it.each([
    ['first', 0, ['m0', 'm1', 'm2']],
    ['second', 15, ['m0', 'm1', 'm2', 'm3']],
    ['second-to-last', 105, ['m8', 'm9', 'm10', 'm11']],
    ['last', 115, ['m9', 'm10', 'm11']],
  ])('clamps at the %s block instead of shifting the window', (_name, tokenAt, expected) => {
    // ARRANGE
    const at = tokenAt / WINDOW;
    // ACT
    const { rows } = loupeRows(blocks, { at, windowTokens: WINDOW });
    // ASSERT
    expect(rows.map((b) => b.id)).toEqual(expected);
  });

  it('clamps a custom window at both ends', () => {
    // ARRANGE
    const around = { before: 0, after: 1 };
    // ACT
    const last = loupeRows(blocks, { at: 1, windowTokens: WINDOW }, around);
    const first = loupeRows(blocks, { at: 0, windowTokens: WINDOW }, { before: 3, after: 0 });
    // ASSERT
    expect([last.rows.map((b) => b.id), first.rows.map((b) => b.id)]).toEqual([['m11'], ['m0']]);
  });

  it('keeps the tail inside the zoom when the zoom is pushed against the top of the bar', () => {
    // ARRANGE
    const edge = 18;
    // ACT
    const place = loupePlacement({ at: 0, ...BAR });
    // ASSERT
    expect(place).toEqual({ y: 0, tail: edge });
  });

  it('keeps the tail inside the zoom at the bottom of the bar', () => {
    // ARRANGE
    const edge = 18;
    const expected = { y: BAR.barHeight - BAR.height, tail: BAR.height - edge };
    // ACT
    const place = loupePlacement({ at: 1, ...BAR });
    // ASSERT
    expect(place).toEqual(expected);
  });
});
