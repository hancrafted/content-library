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
    expect({ cols: g.cols, rows: g.rows }).toEqual(size);
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
    // ACT
    const g = gridOf(m);
    // ASSERT
    expect(g.at.customer).toEqual([1, expect.any(Number)]);
    expect(Object.values(g.at).every((c) => c[0] >= 1 && c[1] >= 1)).toBe(true);
    expect(Object.keys(g.at)).toContain('lspec');
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
