import { describe, expect, it } from 'vitest';
import { stripSegments, stripTotals, type StripInput } from './attention-strip.pure';

/** A small chat: instructions, two turns in the middle, the newest reply. */
const STEPS = [
  { id: 'm1', kind: 'start' },
  { id: 'm2', kind: 'you' },
  { id: 'm3', kind: 'tool' },
  { id: 'm4', kind: 'you' },
  { id: 'm5', kind: 'ai' },
];
const INPUT: StripInput = {
  steps: STEPS,
  units: { m1: 20, m2: 10, m3: 15, m4: 25, m5: 30 },
  start: ['m1'],
  newest: ['m5'],
};

describe('success cases', () => {
  it('keeps chat order, groups each step and marks the middle’s largest share as the spike', () => {
    // ARRANGE
    const expected = [
      { id: 'm1', units: 20, group: 'start', kind: 'start', spike: false },
      { id: 'm2', units: 10, group: 'middle', kind: 'you', spike: false },
      { id: 'm3', units: 15, group: 'middle', kind: 'tool', spike: false },
      { id: 'm4', units: 25, group: 'middle', kind: 'you', spike: true },
      { id: 'm5', units: 30, group: 'newest', kind: 'ai', spike: false },
    ];
    // ACT
    const segments = stripSegments(INPUT);
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('totals each group and says where the spike starts', () => {
    // ARRANGE
    const expected = { start: 20, middle: 50, newest: 30, beforeSpike: 45 };
    // ACT
    const totals = stripTotals(stripSegments(INPUT));
    // ASSERT
    expect(totals).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses units that do not add up to a hundred', () => {
    // ARRANGE
    const input = { ...INPUT, units: { ...INPUT.units, m5: 29 } };
    const expected = 'the units add up to 99, not 100';
    // ACT
    const build = () => stripSegments(input);
    // ASSERT
    expect(build).toThrow(expected);
  });

  it('refuses a step that is no message, such as a compaction', () => {
    // ARRANGE
    const input = { ...INPUT, steps: [...STEPS.slice(0, 4), { id: 'm5', kind: 'compact' }] };
    const expected = 'step "m5" is a compact';
    // ACT
    const build = () => stripSegments(input);
    // ASSERT
    expect(build).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('leaves out a step the attention table gives no units', () => {
    // ARRANGE
    const input = { ...INPUT, steps: [...STEPS, { id: 'm6', kind: 'tool' }] };
    const expected = ['m1', 'm2', 'm3', 'm4', 'm5'];
    // ACT
    const ids = stripSegments(input).map(({ id }) => id);
    // ASSERT
    expect(ids).toEqual(expected);
  });

  it('starts the spike at the strip’s start when the middle is empty', () => {
    // ARRANGE
    const input = { ...INPUT, units: { m1: 70, m5: 30 } };
    const expected = { start: 70, middle: 0, newest: 30, beforeSpike: 0 };
    // ACT
    const totals = stripTotals(stripSegments(input));
    // ASSERT
    expect(totals).toEqual(expected);
  });
});
