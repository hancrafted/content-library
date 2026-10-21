import { describe, expect, it } from 'vitest';
import { CLOSED, flip, nextTimer, rowAt, type FlipEvent, type FlipState } from './trait-flip.pure';

const run = (events: readonly FlipEvent[], from: FlipState = CLOSED) => events.reduce(flip, from);

describe('success cases', () => {
  it('shows only the chips at rest, then both cards of a row once its chip is entered, playing their first pass', () => {
    // ARRANGE
    const entered = run([{ type: 'open', target: 'relentless' }]);
    const expected = {
      rest: { shown: false, pass: 0, looping: false, blank: false, turned: { freelancer: false, ai: false } },
      entered: { shown: true, pass: 1, looping: true, blank: false, turned: { freelancer: false, ai: false } },
    };
    // ACT
    const seen = { rest: rowAt(CLOSED, 'relentless'), entered: rowAt(entered, 'relentless') };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('keeps a row shown after its chip is left, its last pass running out, and replays it when entered again', () => {
    // ARRANGE
    const left = run([
      { type: 'open', target: 'informed' },
      { type: 'leave', target: 'informed' },
    ]);
    const reentered = flip(left, { type: 'open', target: 'informed' });
    const expected = {
      left: { shown: true, pass: 1, looping: false },
      reentered: { shown: true, pass: 2, looping: true },
    };
    // ACT
    const seen = { left: rowAt(left, 'informed'), reentered: rowAt(reentered, 'informed') };
    // ASSERT
    expect(seen).toMatchObject(expected);
  });

  it('loops the pointed row: each beat and hold later the timer replays it', () => {
    // ARRANGE: Probabilistic's beat runs 2.6 s and holds 1.5 s, so it replays every 4.1 s.
    const open = run([{ type: 'open', target: 'probabilistic' }]);
    const replayEvery = 4100;
    const expected = { timer: { ms: replayEvery, event: { type: 'replay', target: 'probabilistic' } }, pass: 2 };
    // ACT
    const timer = nextTimer(open);
    const pass = rowAt(flip(open, timer!.event), 'probabilistic').pass;
    // ASSERT
    expect({ timer, pass }).toEqual(expected);
  });

  it('wipes every row, entered or skipped: shows all, then blanks them, and holds until the line is left', () => {
    // ARRANGE: Relentless was entered, Informed skipped; the blank lands 900 ms after the line opens.
    const wiping = run([
      { type: 'open', target: 'relentless' },
      { type: 'open', target: 'closing' },
    ]);
    const blankAfter = 900;
    const expected = {
      timer: { ms: blankAfter, event: { type: 'blank' } },
      wiping: [
        { shown: true, blank: false },
        { shown: true, blank: false },
      ],
      blank: [
        { shown: true, blank: true },
        { shown: true, blank: true },
      ],
      after: null,
    };
    // ACT
    const timer = nextTimer(wiping);
    const blank = flip(wiping, timer!.event);
    const seen = {
      timer,
      wiping: [rowAt(wiping, 'relentless'), rowAt(wiping, 'informed')],
      blank: [rowAt(blank, 'relentless'), rowAt(blank, 'informed')],
      after: nextTimer(blank),
    };
    // ASSERT
    expect(seen).toMatchObject(expected);
  });

  it('turns a shown card to its text on a click and back on the next, one side at a time', () => {
    // ARRANGE
    const shown = run([{ type: 'open', target: 'confident' }]);
    const turn: FlipEvent = { type: 'turn', target: 'confident', side: 'ai' };
    const expected = { once: { freelancer: false, ai: true }, twice: { freelancer: false, ai: false } };
    // ACT
    const once = flip(shown, turn);
    const seen = { once: rowAt(once, 'confident').turned, twice: rowAt(flip(once, turn), 'confident').turned };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps the newly opened row when the previous chip blurs after the next one took focus', () => {
    // ARRANGE
    const state = run([
      { type: 'open', target: 'informed' },
      { type: 'open', target: 'every-word-billed' },
    ]);
    // ACT
    const next = flip(state, { type: 'leave', target: 'informed' });
    // ASSERT
    expect(next).toBe(state);
  });

  it('ignores a late replay for a row no longer pointed at, so a left row only finishes its pass', () => {
    // ARRANGE
    const left = run([
      { type: 'open', target: 'relentless' },
      { type: 'leave', target: 'relentless' },
    ]);
    // ACT
    const next = flip(left, { type: 'replay', target: 'relentless' });
    // ASSERT
    expect(next).toBe(left);
  });

  it('does not turn a card that is not shown yet', () => {
    // ARRANGE
    const turn: FlipEvent = { type: 'turn', target: 'informed', side: 'freelancer' };
    // ACT
    const next = flip(CLOSED, turn);
    // ASSERT
    expect(next).toBe(CLOSED);
  });
});

describe('edge cases', () => {
  it('returns to rest, every card hidden and unturned, when the Slide leaves active', () => {
    // ARRANGE
    const state = run([
      { type: 'open', target: 'informed' },
      { type: 'turn', target: 'informed', side: 'ai' },
    ]);
    // ACT
    const next = flip(state, { type: 'reset' });
    // ASSERT
    expect(next).toEqual(CLOSED);
  });

  it("turns a skipped row's card the wipe is showing", () => {
    // ARRANGE
    const wiping = run([{ type: 'open', target: 'closing' }]);
    const expected = { freelancer: true, ai: false };
    // ACT
    const seen = rowAt(flip(wiping, { type: 'turn', target: 'confident', side: 'freelancer' }), 'confident').turned;
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('returns the same state when an open row is pointed at again, so nothing restarts', () => {
    // ARRANGE
    const state = run([{ type: 'open', target: 'relentless' }]);
    // ACT
    const next = flip(state, { type: 'open', target: 'relentless' });
    // ASSERT
    expect(next).toBe(state);
  });

  it('hides a skipped row again once the wipe is dismissed, and keeps an entered one shown', () => {
    // ARRANGE
    const dismissed = run([
      { type: 'open', target: 'relentless' },
      { type: 'open', target: 'closing' },
      { type: 'blank' },
      { type: 'dismiss' },
    ]);
    const expected = {
      entered: { shown: true, blank: false },
      skipped: { shown: false, blank: false },
      timer: null,
    };
    // ACT
    const seen = {
      entered: rowAt(dismissed, 'relentless'),
      skipped: rowAt(dismissed, 'informed'),
      timer: nextTimer(dismissed),
    };
    // ASSERT
    expect(seen).toMatchObject(expected);
  });
});
