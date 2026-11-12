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
  it('puts the tire swing Customer in the first column and each work center in its factory column and row', () => {
    // ARRANGE (the reference build's grid columns and rows, read from flow.html in Swing)
    const m = factoryOf('tire');
    const size = { cols: 4, rows: 3 };
    const cells = {
      customer: [1, 2],
      sales: [2, 1],
      pm: [2, 2],
      support: [2, 3],
      ba: [3, 1],
      eng: [3, 3],
      qa: [4, 3],
      ops: [4, 1],
    };
    // ACT
    const g = gridOf(m);
    // ASSERT
    expect({ cols: g.cols, rows: g.rows }).toEqual(size);
    expect(g.at).toEqual(cells);
  });

  it('fills the empty cells with Documentation and Billing, and puts what the customer really needed under the Customer in Swing', () => {
    // ARRANGE
    const m = factoryOf('tire');
    const expected = [
      { id: 'doc', at: [3, 2] },
      { id: 'billing', at: [4, 2] },
      { id: 'needed', at: [1, 3] },
    ];
    // ACT
    const tiles = tilesOf(m, 'swing');
    // ASSERT
    expect(tiles).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('shows no cartoon tiles for a use case without the cartoon', () => {
    // ARRANGE
    const m = factoryOf('gate');
    // ACT
    const tiles = tilesOf(m, 'swing');
    // ASSERT
    expect(tiles).toEqual([]);
  });
});

describe('edge cases', () => {
  it('leaves what the customer really needed out of Roles', () => {
    // ARRANGE
    const m = factoryOf('tire');
    const expected = ['doc', 'billing'];
    // ACT
    const ids = tilesOf(m, 'roles').map((t) => t.id);
    // ASSERT
    expect(ids).toEqual(expected);
  });

  it('gives quality assurance no cartoon panel, so it sits out Swing', () => {
    // ARRANGE
    const m = factoryOf('tire');
    const out = ['qa'];
    // ACT
    const g = gridOf(m);
    // ASSERT
    expect(g.outOfSwing).toEqual(out);
  });
});
