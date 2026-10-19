import { describe, expect, it } from 'vitest';
import { CLOSED, flip, nextChangeIn, rowAt, wipeAt } from './trait-flip.pure';

describe('success cases', () => {
  it('opens the row whose chip is pointed at, and only that row', () => {
    // ARRANGE
    const state = flip(CLOSED, { type: 'open', target: 'relentless' });
    // ACT
    const next = flip(state, { type: 'open', target: 'informed' });
    // ASSERT
    expect(next).toEqual({ open: 'informed' });
  });

  it('flips the row back when its chip is left or blurred', () => {
    // ARRANGE
    const state = flip(CLOSED, { type: 'open', target: 'confident' });
    // ACT
    const next = flip(state, { type: 'leave', target: 'confident' });
    // ASSERT
    expect(next).toEqual(CLOSED);
  });

  it('plays the back after the flip, holds its last frame 1.5 s, then replays it', () => {
    // ARRANGE: Probabilistic's beat runs 2.6 s and the card turns for 350 ms first, so a pass is 2.6 + 1.5 = 4.1 s.
    const times = [0, 349, 350, 4449, 4450, 8550];
    const expected = [
      { playing: false, pass: 0 },
      { playing: false, pass: 0 },
      { playing: true, pass: 0 },
      { playing: true, pass: 0 },
      { playing: true, pass: 1 },
      { playing: true, pass: 2 },
    ];
    // ACT
    const seen = times.map((ms) => rowAt('probabilistic', ms));
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('wipes every row once: flip, then blank the backs and retract the arrows, and holds while the line stays open', () => {
    // ARRANGE: the flip at 0 ms, the blank from 900 ms; nothing returns until the line is left.
    const times = [0, 899, 900, 4100, 60000];
    const expected = [
      { flipped: true, blank: false },
      { flipped: true, blank: false },
      { flipped: true, blank: true },
      { flipped: true, blank: true },
      { flipped: true, blank: true },
    ];
    // ACT
    const seen = times.map((ms) => wipeAt(ms));
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('wakes the clock at the next change only: the turn, each replay, the wipe blanking', () => {
    // ARRANGE: a Confident pass is 2.9 + 1.5 = 4.4 s after the 350 ms turn; the wipe blanks at 900 ms, then holds with no timer.
    const asked = [
      ['confident', 0],
      ['confident', 350],
      ['confident', 5000],
      ['closing', 0],
      ['closing', 2000],
    ] as const;
    const expected = [350, 4400, 4150, 900, null];
    // ACT
    const seen = asked.map(([target, ms]) => nextChangeIn(target, ms));
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps the newly opened row when the previous chip blurs after the next one took focus', () => {
    // ARRANGE
    const state = flip(CLOSED, { type: 'open', target: 'every-word-billed' });
    // ACT
    const next = flip(state, { type: 'leave', target: 'informed' });
    // ASSERT
    expect(next).toEqual({ open: 'every-word-billed' });
  });
});

describe('edge cases', () => {
  it('closes the wipe on a tap elsewhere, Escape or the Slide leaving active', () => {
    // ARRANGE
    const state = flip(CLOSED, { type: 'open', target: 'closing' });
    // ACT
    const next = flip(state, { type: 'dismiss' });
    // ASSERT
    expect(next).toEqual(CLOSED);
  });

  it('returns the same state when an open row is pointed at again, so nothing restarts', () => {
    // ARRANGE
    const state = flip(CLOSED, { type: 'open', target: 'relentless' });
    // ACT
    const next = flip(state, { type: 'open', target: 'relentless' });
    // ASSERT
    expect(next).toBe(state);
  });
});
