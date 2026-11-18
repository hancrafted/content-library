import { describe, expect, it } from 'vitest';
import { explorableData } from './brief-or-pay-the-price-data';
import { MOVE_IDS, TRAIT_IDS } from './brief-or-pay-the-price.types';
import { cellsOf, fill, isCounter, neighbour, plain } from './matrix-data.pure';

const { counters } = explorableData('en').matrix;

describe('success cases', () => {
  it('lists exactly the filled Cells of the counters table, move by move', () => {
    // ARRANGE
    const expected = [
      'break-it-down|relentless',
      'break-it-down|every-word-billed',
      'requirements-first|probabilistic',
      'requirements-first|confident',
      'interview-yourself-with-ai|informed',
      'interview-yourself-with-ai|confident',
      'evaluate-each-step|probabilistic',
      'evaluate-each-step|relentless',
      'fresh-start-for-each-piece|probabilistic',
      'fresh-start-for-each-piece|relentless',
      'fresh-start-for-each-piece|every-word-billed',
    ];
    // ACT
    const cells = cellsOf(counters).map(({ move, trait }) => `${move}|${trait}`);
    // ASSERT
    expect([...cells].sort()).toEqual([...expected].sort());
    expect(cells).toHaveLength(expected.length);
  });

  it('knows a counter from an empty Cell', () => {
    // ARRANGE
    const filled = { move: 'break-it-down', trait: 'relentless' } as const;
    const empty = { move: 'break-it-down', trait: 'informed' } as const;
    // ACT
    const seen = [isCounter(counters, filled), isCounter(counters, empty)];
    // ASSERT
    expect(seen).toEqual([true, false]);
  });

  it('fills a template at {move} and {trait}, marking the names', () => {
    // ARRANGE
    const names = { move: 'Break it down', trait: 'Relentless' };
    // ACT
    const parts = fill('{move} counters {trait}', names);
    // ASSERT
    expect(parts).toEqual([{ bold: 'Break it down' }, ' counters ', { bold: 'Relentless' }]);
    expect(plain('{move} gegen {trait}', names)).toBe('Break it down gegen Relentless');
  });
});

describe('failure cases', () => {
  it('has no Cell outside the traits and moves the Explorable knows', () => {
    // ARRANGE
    const cells = cellsOf(counters);
    // ACT
    const strays = cells.filter(
      ({ move, trait }) =>
        !(MOVE_IDS as readonly string[]).includes(move) || !(TRAIT_IDS as readonly string[]).includes(trait),
    );
    // ASSERT
    expect(strays).toEqual([]);
  });
});

describe('edge cases', () => {
  it('steps through the Cells and wraps around at both ends', () => {
    // ARRANGE
    const cells = cellsOf(counters);
    const first = cells[0]!;
    const last = cells.at(-1)!;
    // ACT
    const seen = {
      before: neighbour(cells, first, -1),
      after: neighbour(cells, last, 1),
      next: neighbour(cells, first, 1),
    };
    // ASSERT
    expect(seen).toEqual({ before: last, after: first, next: cells[1] });
  });
});
