import { describe, expect, it } from 'vitest';
import { idealSettings } from './factory-dials.pure.ts';
import { gridOf, tilesOf } from './factory-grid.pure.ts';
import { createFactory, DEFAULT_SEED } from './factory-model.pure.ts';
import { builtinBundle } from './use-case-data.ts';

const factoryOf = (id: string) => {
  const B = builtinBundle(id);
  return createFactory(B, idealSettings(B.data.company ?? 'service'), DEFAULT_SEED).topology;
};

describe('success cases', () => {
  it('lays the tire swing out as ten cards in two rows of five, in the cartoon order, the Customer first', () => {
    // ARRANGE (the cartoon: Customer, Product management, Analysis, Engineering, Sales / Documentation, Operations, Billing, Support, what the customer needed)
    const m = factoryOf('tire');
    const size = { cols: 5, rows: 2 };
    const cells = {
      customer: [1, 1],
      pm: [2, 1],
      ba: [3, 1],
      eng: [4, 1],
      sales: [5, 1],
      ops: [2, 2],
      support: [4, 2],
    };
    // ACT
    const g = gridOf(m);
    // ASSERT
    const seen = { cols: g.cols, rows: g.rows };
    expect(seen).toEqual(size);
    expect(g.at).toEqual(cells);
  });

  it('fills the cartoon cells that are no work center with Documentation, Billing and what the customer really needed', () => {
    // ARRANGE
    const m = factoryOf('tire');
    const expected = [
      { id: 'doc', at: [1, 2] },
      { id: 'billing', at: [3, 2] },
      { id: 'needed', at: [5, 2] },
    ];
    // ACT
    const tiles = tilesOf(m);
    // ASSERT
    expect(tiles).toEqual(expected);
  });

  it('keeps a use case without the cartoon at its factory columns and rows', () => {
    // ARRANGE
    const m = factoryOf('gate');
    const expected = {
      customer: [1, 2],
      sales: [2, 1],
      pm: [2, 2],
      lspec: [3, 2],
      e1: [4, 1],
      e2: [4, 2],
      e3: [4, 3],
      lrev: [5, 2],
      ops: [5, 1],
    };
    // ACT
    const g = gridOf(m);
    // ASSERT
    expect(g.at).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('shows no cartoon tiles for a use case without the cartoon', () => {
    // ARRANGE
    const m = factoryOf('gate');
    // ACT
    const tiles = tilesOf(m);
    // ASSERT
    expect(tiles).toEqual([]);
  });
});

describe('edge cases', () => {
  it('leaves quality assurance, which has no cartoon panel, out of the tire swing roles view', () => {
    // ARRANGE
    const m = factoryOf('tire');
    // ACT
    const g = gridOf(m);
    // ASSERT
    expect(g.at.qa).toBeUndefined();
  });
});
