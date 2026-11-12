import { describe, expect, it } from 'vitest';
import { CHIP_ORDER, OPENING_ROWS, gridLine, toggleRow, trackPercent } from './rows.pure';

describe('success cases', () => {
  it('stacks the shown rows top to bottom, Explain last, whichever is switched on first', () => {
    // ARRANGE
    const shown = toggleRow(['explain', 'oversight'], 'effort');
    const order = ['effort', 'adoption', 'oversight', 'explain'];
    // ACT
    const all = toggleRow(shown, 'adoption');
    // ASSERT
    expect(all).toEqual(order);
  });

  it('lists the chips with Explain first, then the rows in stacking order', () => {
    // ARRANGE
    const chips = ['explain', 'effort', 'productivity', 'adoption', 'disciplines', 'oversight'];
    // ACT
    const listed = [...CHIP_ORDER];
    // ASSERT
    expect(listed).toEqual(chips);
  });

  it('opens with Explain on and no other row', () => {
    // ARRANGE
    const opening = ['explain'];
    // ACT
    const rows = [...OPENING_ROWS];
    // ASSERT
    expect(rows).toEqual(opening);
  });

  it('puts a shown row on the grid line under the rail stop, the card and the rows above it', () => {
    // ARRANGE
    const shown = ['effort', 'disciplines', 'explain'] as const;
    // Line 1 holds the rail stops, line 2 the cards, line 3 Managing effort.
    const disciplinesLine = 4;
    // ACT
    const line = gridLine(shown, 'disciplines');
    // ASSERT
    expect(line).toBe(disciplinesLine);
  });

  it('takes a shown row out again', () => {
    // ARRANGE
    const shown = ['effort', 'productivity'] as const;
    const left = ['productivity'];
    // ACT
    const after = toggleRow(shown, 'effort');
    // ASSERT
    expect(after).toEqual(left);
  });

  it('places 1× at the start of the productivity track and the 20× promise near its end, on a log scale', () => {
    // ARRANGE
    const promise = 20;
    // log(20) / log(30), the track running from 1× to 30×
    const promiseAt = 88.08;
    // ACT
    const placed = [trackPercent(1), trackPercent(promise)];
    // ASSERT
    expect(placed[0]).toBe(0);
    expect(placed[1]).toBeCloseTo(promiseAt, 1);
  });
});

describe('failure cases', () => {
  it('gives a row that is not shown no grid line', () => {
    // ARRANGE
    const shown = ['explain'] as const;
    // ACT
    const line = gridLine(shown, 'oversight');
    // ASSERT
    expect(line).toBeNull();
  });

  it('puts a multiplier below 1× on the start of the track, never before it', () => {
    // ARRANGE
    const slower = 0.8;
    // ACT
    const placed = trackPercent(slower);
    // ASSERT
    expect(placed).toBe(0);
  });
});

describe('edge cases', () => {
  it('keeps a multiplier past the end of the track on its end', () => {
    // ARRANGE
    const beyond = 100;
    const end = 100;
    // ACT
    const placed = trackPercent(beyond);
    // ASSERT
    expect(placed).toBe(end);
  });
});
