import { describe, expect, it } from 'vitest';
import {
  currentMirror,
  isWiping,
  nextTimer,
  rowAt,
  start,
  step,
  type ExplorableEvent,
  type ExplorableState,
} from './explorable-state.pure';

const BEATS = [2600, 3600, 3600, 2900, 9900];
const REST = start({ price: BEATS.length });
const run = (events: readonly ExplorableEvent[], from: ExplorableState = REST) => events.reduce(step, from);
const shownRows = (state: ExplorableState) => BEATS.map((_, row) => rowAt(state, row).shown);

describe('success cases', () => {
  it('shows only the chips at rest, then both cards of a row once its chip is entered, playing their first pass', () => {
    // ARRANGE
    const entered = run([{ type: 'open', target: 2 }]);
    const expected = {
      rest: { shown: false, pass: 0, looping: false, blank: false, turned: { freelancer: false, ai: false } },
      entered: { shown: true, pass: 1, looping: true, blank: false, turned: { freelancer: false, ai: false } },
    };
    // ACT
    const seen = { rest: rowAt(REST, 2), entered: rowAt(entered, 2) };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('keeps a row shown after its chip is left, and replays it when entered again', () => {
    // ARRANGE
    const left = run([
      { type: 'open', target: 1 },
      { type: 'leave', target: 1 },
    ]);
    const reentered = step(left, { type: 'open', target: 1 });
    const expected = {
      left: { shown: true, pass: 1, looping: false },
      reentered: { shown: true, pass: 2, looping: true },
    };
    // ACT
    const seen = { left: rowAt(left, 1), reentered: rowAt(reentered, 1) };
    // ASSERT
    expect(seen).toMatchObject(expected);
  });

  it('loops the pointed row: each beat and hold later the timer replays it', () => {
    // ARRANGE
    const open = run([{ type: 'open', target: 0 }]);
    const expected = { timer: { milliseconds: 4100, event: { type: 'replay', row: 0 } }, pass: 2 };
    // ACT
    const timer = nextTimer(currentMirror(open), BEATS);
    const pass = rowAt(step(open, timer!.event), 0).pass;
    // ASSERT
    expect({ timer, pass }).toEqual(expected);
  });

  it('turns a shown card and turns it back, each side on its own', () => {
    // ARRANGE
    const confident = 3;
    const shown = run([{ type: 'open', target: confident }]);
    const expected = [
      { freelancer: false, ai: true },
      { freelancer: false, ai: false },
    ];
    // ACT
    const turned = step(shown, { type: 'turn', row: confident, side: 'ai' });
    const back = step(turned, { type: 'turn', row: confident, side: 'ai' });
    // ASSERT
    expect([rowAt(turned, confident).turned, rowAt(back, confident).turned]).toEqual(expected);
  });

  it('wipes every row, entered or skipped: shows all, blanks them after a beat, and holds until the line is left', () => {
    // ARRANGE
    const wiping = run([
      { type: 'open', target: 1 },
      { type: 'open', target: 'closing' },
    ]);
    const expected = {
      shown: [true, true, true, true, true],
      timer: { milliseconds: 900, event: { type: 'blank' } },
      blank: [false, true],
      held: null,
    };
    // ACT
    const blanked = step(wiping, { type: 'blank' });
    const seen = {
      shown: shownRows(wiping),
      timer: nextTimer(currentMirror(wiping), BEATS),
      blank: [rowAt(wiping, 0).blank, rowAt(blanked, 0).blank],
      held: nextTimer(currentMirror(blanked), BEATS),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('keeps every row shown, unblanked, after the closing line is left', () => {
    // ARRANGE
    const left = run([{ type: 'open', target: 'closing' }, { type: 'blank' }, { type: 'leave', target: 'closing' }]);
    const expected = { shown: [true, true, true, true, true], blank: false, wiping: false };
    // ACT
    const seen = { shown: shownRows(left), blank: rowAt(left, 0).blank, wiping: isWiping(left) };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('shows and plays every row on Show all, and resets memory to rest on Reset', () => {
    // ARRANGE
    const all = run([{ type: 'open', target: 0 }, { type: 'turn', row: 0, side: 'ai' }, { type: 'showAll' }]);
    const expected = { shown: [true, true, true, true, true], passes: [2, 1, 1, 1, 1], reset: REST };
    // ACT
    const seen = {
      shown: shownRows(all),
      passes: BEATS.map((_, row) => rowAt(all, row).pass),
      reset: step(all, { type: 'reset' }),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('ignores a turn on a row whose cards are not shown yet', () => {
    // ARRANGE
    const expected = REST;
    // ACT
    const found = step(REST, { type: 'turn', row: 0, side: 'freelancer' });
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('ignores a leave of a row that is not the open one, and a replay of a row that is not open', () => {
    // ARRANGE
    const open = run([{ type: 'open', target: 0 }]);
    // ACT
    const left = step(open, { type: 'leave', target: 1 });
    const replayed = step(open, { type: 'replay', row: 4 });
    // ASSERT
    expect([left, replayed]).toEqual([open, open]);
  });

  it('keeps the wipe from blanking a row that was never wiped', () => {
    // ARRANGE
    const expected = REST;
    // ACT
    const found = step(REST, { type: 'blank' });
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('returns the same state when the open row is entered again, so a hover that flickers does not replay', () => {
    // ARRANGE
    const open = run([{ type: 'open', target: 2 }]);
    // ACT
    const again = step(open, { type: 'open', target: 2 });
    // ASSERT
    expect(again).toBe(open);
  });

  it('does not time anything when nothing is open', () => {
    // ARRANGE
    const expected = null;
    // ACT
    const timer = nextTimer(currentMirror(REST), BEATS);
    // ASSERT
    expect(timer).toBe(expected);
  });

  it('dismisses the open row and leaves what it showed', () => {
    // ARRANGE
    const lastRow = 4;
    const open = run([{ type: 'open', target: lastRow }]);
    // ACT
    const dismissed = step(open, { type: 'dismiss' });
    // ASSERT
    expect(rowAt(dismissed, lastRow)).toMatchObject({ shown: true, looping: false });
  });
});
