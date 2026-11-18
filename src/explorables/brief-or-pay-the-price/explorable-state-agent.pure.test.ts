import { describe, expect, it } from 'vitest';
import {
  currentMirror,
  rowAt,
  start,
  step,
  type CellKey,
  type ExplorableEvent,
  type ExplorableState,
} from './explorable-state.pure';

const REST = start({ price: 5, brief: 5, brace: 5 });
const run = (events: readonly ExplorableEvent[], from: ExplorableState = REST) => events.reduce(step, from);
const BREAK_RELENTLESS: CellKey = { move: 'break-it-down', trait: 'relentless' };
const REQUIREMENTS_CONFIDENT: CellKey = { move: 'requirements-first', trait: 'confident' };

describe('success cases', () => {
  it('starts on the Define level with no Cell open and nothing lit', () => {
    // ARRANGE
    const expected = { level: 'define', cell: null, lit: null, arrival: null, restore: null };
    // ACT
    const seen = REST;
    // ASSERT
    expect(seen).toMatchObject(expected);
  });

  it('zooms to the Agent level from the definition on show, which the matrix assembles from', () => {
    // ARRANGE
    const onBrief = run([{ type: 'view', view: 'brief' }]);
    // ACT
    const agent = step(onBrief, { type: 'zoom', level: 'agent' });
    // ASSERT
    expect(agent).toMatchObject({ level: 'agent', view: 'brief', arrival: 'brief', cell: null });
  });

  it('returns to a definition with its tab, dropping the open Cell and the arrival', () => {
    // ARRANGE
    const inCell = run([
      { type: 'zoom', level: 'agent' },
      { type: 'openCell', cell: BREAK_RELENTLESS },
    ]);
    // ACT
    const back = step(inCell, { type: 'view', view: 'price' });
    // ASSERT
    expect(back).toMatchObject({ level: 'define', view: 'price', cell: null, arrival: null });
  });

  it('opens a Cell with both of its rows shown and not looping, and swaps it for the next one with fresh rows', () => {
    // ARRANGE
    const opened = run([{ type: 'openCell', cell: BREAK_RELENTLESS }]);
    const turned = run([{ type: 'turn', row: 0, side: 'ai' }], opened);
    const expected = {
      opened: [
        { shown: true, looping: false },
        { shown: true, looping: false },
      ],
      stepped: [{ turned: { freelancer: false, ai: false } }],
    };
    // ACT
    const stepped = step(turned, { type: 'openCell', cell: REQUIREMENTS_CONFIDENT });
    // ASSERT
    expect([rowAt(opened, 0), rowAt(opened, 1)]).toMatchObject(expected.opened);
    expect(rowAt(turned, 0).turned.ai).toBe(true);
    expect([rowAt(stepped, 0)]).toMatchObject(expected.stepped);
    expect(stepped.cell).toEqual(REQUIREMENTS_CONFIDENT);
  });

  it('plays the pointed row of the Cell, as it does in a definition', () => {
    // ARRANGE
    const opened = run([{ type: 'openCell', cell: BREAK_RELENTLESS }]);
    const secondPass = 2;
    // ACT
    const looping = step(opened, { type: 'open', target: 1 });
    // ASSERT
    expect(currentMirror(looping).open).toBe(1);
    expect(rowAt(looping, 1)).toMatchObject({ looping: true, pass: secondPass });
  });

  it('closes the Cell and remembers which one, until focus has been returned to it', () => {
    // ARRANGE
    const inCell = run([
      { type: 'zoom', level: 'agent' },
      { type: 'openCell', cell: REQUIREMENTS_CONFIDENT },
    ]);
    // ACT
    const closed = step(inCell, { type: 'closeCell' });
    const focused = step(closed, { type: 'focused' });
    // ASSERT
    expect(closed).toMatchObject({ level: 'agent', cell: null, restore: REQUIREMENTS_CONFIDENT });
    expect(focused.restore).toBeNull();
  });

  it('lights the row or column of a heading and unlights it', () => {
    // ARRANGE
    const lit = run([{ type: 'light', lit: { kind: 'trait', id: 'informed' } }]);
    // ACT
    const unlit = step(lit, { type: 'unlight' });
    // ASSERT
    expect(lit.lit).toEqual({ kind: 'trait', id: 'informed' });
    expect(unlit.lit).toBeNull();
  });
});

describe('failure cases', () => {
  it('ignores closing, stepping focus and unlighting when there is nothing to close, restore or unlight', () => {
    // ARRANGE
    const events: ExplorableEvent[] = [{ type: 'closeCell' }, { type: 'focused' }, { type: 'unlight' }];
    // ACT
    const after = run(events);
    // ASSERT
    expect(after).toBe(REST);
  });

  it('keeps the same state for the same Cell or the same lit heading', () => {
    // ARRANGE
    const inCell = run([{ type: 'openCell', cell: BREAK_RELENTLESS }]);
    const lit = run([{ type: 'light', lit: { kind: 'move', id: 'evaluate-each-step' } }]);
    // ACT
    const again = {
      cell: step(inCell, { type: 'openCell', cell: { ...BREAK_RELENTLESS } }),
      lit: step(lit, { type: 'light', lit: { kind: 'move', id: 'evaluate-each-step' } }),
    };
    // ASSERT
    expect(again).toEqual({ cell: inCell, lit });
  });
});

describe('edge cases', () => {
  it('keeps the definition it came from when it zooms to the Agent level twice', () => {
    // ARRANGE
    const first = run([
      { type: 'view', view: 'brace' },
      { type: 'zoom', level: 'agent' },
    ]);
    // ACT
    const second = step(first, { type: 'zoom', level: 'agent' });
    // ASSERT
    expect(second).toBe(first);
  });

  it('leaves the Cell for the matrix when the Agent level is chosen while a Cell is open', () => {
    // ARRANGE
    const inCell = run([{ type: 'openCell', cell: BREAK_RELENTLESS }]);
    // ACT
    const matrix = step(inCell, { type: 'zoom', level: 'agent' });
    // ASSERT
    expect(matrix).toMatchObject({ level: 'agent', cell: null, restore: null });
  });

  it('does not assemble the matrix again after a Cell was opened and closed', () => {
    // ARRANGE
    const events: ExplorableEvent[] = [
      { type: 'zoom', level: 'agent' },
      { type: 'openCell', cell: BREAK_RELENTLESS },
      { type: 'closeCell' },
    ];
    // ACT
    const after = run(events);
    // ASSERT
    expect(after.arrival).toBeNull();
  });
});
