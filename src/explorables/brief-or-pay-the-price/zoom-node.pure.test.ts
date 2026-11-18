import { describe, expect, it } from 'vitest';
import { explorableData } from './brief-or-pay-the-price-data';
import { start, step, type ExplorableEvent } from './explorable-state.pure';
import { cellsIn, format, markOf } from './matrix-data.pure';
import { enterOrder, entriesOf, flipFrom, isNarrow, originOf } from './zoom-geometry.pure';

const data = explorableData('en');
const { scenario, words } = data.scenarios.drive!;
const { counters } = data.matrix;
const node = (id: string) => scenario.nodes.find((each) => each.id === id)!;
const run = (events: readonly ExplorableEvent[]) =>
  events.reduce(step, start({ price: 5, brief: 5, brace: 5 }, 'drive'));

describe('success cases', () => {
  it('keeps the node it was entered from while a Cell opens, steps and closes (Seam 1)', () => {
    // ARRANGE
    const cell = { move: 'break-it-down', trait: 'relentless' } as const;
    const next = { move: 'requirements-first', trait: 'confident' } as const;
    // ACT
    const opened = run([
      { type: 'zoom', level: 'workflow' },
      { type: 'node', node: 'verify' },
      { type: 'openCell', cell },
      { type: 'openCell', cell: next },
    ]);
    const closed = step(opened, { type: 'closeCell' });
    // ASSERT
    expect(opened).toMatchObject({ level: 'agent', node: 'verify', cell: next });
    expect(closed).toMatchObject({ level: 'agent', node: 'verify', cell: null });
  });

  it('marks exactly the node’s Cells, dims the other counters and outlines a non-counter Cell as in context', () => {
    // ARRANGE
    const verify = node('verify');
    const cells = [
      { move: 'evaluate-each-step', trait: 'relentless' },
      { move: 'evaluate-each-step', trait: 'probabilistic' },
      { move: 'break-it-down', trait: 'relentless' },
      { move: 'break-it-down', trait: 'informed' },
    ] as const;
    // ACT
    const marks = cells.map((cell) => markOf(counters, verify, cell));
    // ASSERT
    expect(marks).toEqual(['mark', 'mark', 'dim', 'none']);
    expect(verify.cells.filter((cell) => markOf(counters, verify, cell) === 'context')).toHaveLength(1);
  });

  it('shows the plain counters table when no node is kept', () => {
    // ARRANGE
    const cell = { move: 'break-it-down', trait: 'relentless' } as const;
    // ACT
    const marks = [markOf(counters, null, cell), markOf(counters, null, { move: 'break-it-down', trait: 'informed' })];
    // ASSERT
    expect(marks).toEqual(['on', 'none']);
  });

  it('steps through the node’s Cells, not the whole table', () => {
    // ARRANGE
    const verify = node('verify');
    // ACT
    const cells = cellsIn(counters, verify);
    // ASSERT
    expect(cells).toHaveLength(verify.cells.length);
    expect(cellsIn(counters, null).length).toBeGreaterThan(cells.length);
  });

  it('gives every node of every scenario its example in both locales', () => {
    // ARRANGE
    const both = ['en', 'de'].map((locale) => explorableData(locale).scenarios);
    // ACT
    const missing = both.flatMap((scenarios) =>
      Object.values(scenarios).flatMap(({ scenario: each, words: said }) =>
        each.nodes.flatMap((one) =>
          one.cells.filter((cell) => !said.cells[cell.id]?.freelancer || !said.cells[cell.id]?.ai),
        ),
      ),
    );
    // ASSERT
    expect(missing).toEqual([]);
    expect(words.cells[node('verify').cells[0]!.id]!.ai).not.toBe('');
  });

  it('fills a template with named values', () => {
    // ARRANGE
    // ACT
    const said = format('{count} Cells in play, {stage}', { count: 2, stage: 'Verify' });
    // ASSERT
    expect(said).toBe('2 Cells in play, Verify');
  });

  it('flips from a chip letter to its heading from the top-left corner', () => {
    // ARRANGE
    const first = { left: 100, top: 40, width: 20, height: 40 };
    const last = { left: 10, top: 200, width: 10, height: 20 };
    const expected = { dx: 90, dy: -160, scale: 2 };
    // ACT
    const flip = flipFrom(first, last);
    // ASSERT
    expect(flip).toEqual(expected);
  });

  it('takes the origin of a node or the goal from the layout in use, so the vertical layout differs', () => {
    // ARRANGE
    const { horizontal, vertical } = scenario.layouts;
    // ACT
    const wide = originOf(horizontal, 'goal')!;
    const tall = originOf(vertical, 'goal')!;
    const middle = 50;
    // ASSERT
    expect(wide.x).toBeGreaterThan(middle);
    expect(tall.y).toBeGreaterThan(middle);
    expect(originOf(horizontal, 'verify')).not.toEqual(originOf(vertical, 'verify'));
  });

  it('enters the node closest to the goal first, in both layouts', () => {
    // ARRANGE
    const { horizontal, vertical } = scenario.layouts;
    // ACT
    const wide = enterOrder(horizontal, scenario.nodes);
    const tall = enterOrder(vertical, scenario.nodes);
    // ASSERT
    for (const order of [wide, tall]) {
      expect(order).toHaveLength(scenario.nodes.length);
      expect(order.at(-1)).toBe(scenario.nodes[0]!.id);
    }
  });

  it('reflows vertically below 48rem', () => {
    // ARRANGE
    const rem = 16;
    // ACT
    const seen = [isNarrow(390, rem), isNarrow(800, rem), isNarrow(700, rem)];
    // ASSERT
    expect(seen).toEqual([true, false, true]);
  });

  it('flies each badge copy from its resting place to the goal, nearest node first, in both layouts', () => {
    // ARRANGE
    const { horizontal, vertical } = scenario.layouts;
    // ACT
    const wide = entriesOf(horizontal, scenario.nodes);
    const tall = entriesOf(vertical, scenario.nodes);
    // ASSERT
    expect(wide.map(({ id }) => id)).toEqual(enterOrder(horizontal, scenario.nodes));
    expect(tall).toHaveLength(scenario.nodes.length);
    expect(wide[0]!.toGoal.dx).toBeLessThan(wide.at(-1)!.toGoal.dx);
    expect(tall[0]!.toGoal).not.toEqual(wide[0]!.toGoal);
  });
});

describe('failure cases', () => {
  it('has no origin for a node the layout does not know', () => {
    // ARRANGE
    const { horizontal } = scenario.layouts;
    // ACT
    const origin = originOf(horizontal, 'nowhere');
    // ASSERT
    expect(origin).toBeNull();
  });
});

describe('edge cases', () => {
  it('keeps the scale at one when the heading has no height yet, and treats exactly 48rem as wide', () => {
    // ARRANGE
    const first = { left: 0, top: 0, width: 10, height: 10 };
    const hidden = { left: 0, top: 0, width: 0, height: 0 };
    const exactly48Rem = 768;
    const rem = 16;
    // ACT
    const { scale } = flipFrom(first, hidden);
    // ASSERT
    expect(scale).toBe(1);
    expect(isNarrow(exactly48Rem, rem)).toBe(false);
  });
});
