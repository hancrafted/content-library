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
  it('shows the hovered block with three before and three after', () => {
    // ARRANGE
    const expected = { ids: ['m3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'], cursor: 'm6@user' };
    // ACT
    const { rows, cursor } = loupeRows(blocks, 65 / WINDOW, WINDOW);
    // ASSERT
    expect({ ids: rows.map((b) => b.id), cursor }).toEqual(expected);
  });

  it('frames exactly the blocks the zoom lists, as percents of the window', () => {
    // ARRANGE
    const { rows } = loupeRows(blocks, 65 / WINDOW, WINDOW);
    const expected = { start: (30 / WINDOW) * 100, size: (70 / WINDOW) * 100 };
    // ACT
    const frame = loupeFrame(rows, WINDOW);
    // ASSERT
    expect(frame).toEqual(expected);
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
    const frame = loupeFrame(none, WINDOW);
    // ASSERT
    expect(frame).toBeNull();
  });
});

describe('edge cases', () => {
  it('slides the window at the top and bottom so seven rows still show', () => {
    // ARRANGE
    const rowCount = 7;
    // ACT
    const top = loupeRows(blocks, 0, WINDOW);
    const bottom = loupeRows(blocks, 1, WINDOW);
    // ASSERT
    expect([top.rows[0]?.id, top.rows.length, bottom.rows.at(-1)?.id, bottom.cursor]).toEqual([
      'm0',
      rowCount,
      'm11',
      'm11@user',
    ]);
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
