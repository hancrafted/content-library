import { describe, expect, it } from 'vitest';
import { cells, fi, KIND_CELLS, NF_ } from './flow-cells.pure.ts';

/* The flow-cell index (design-ADR 0024 §4): one slot per defect kind, quality, failure demand, times sent back and content. */

describe('success cases', () => {
  it('lays a belt out as one spec half and one code half', () => {
    // ARRANGE
    const spec = { q: 0, f: 0, b: 0, mn: 0 },
      halves = 2;
    // ACT
    const specFirst = fi({ kind: 'spec', ...spec }),
      codeFirst = fi({ kind: 'code', ...spec });
    // ASSERT
    expect(KIND_CELLS).toBe(NF_ / halves);
    expect(specFirst).toBe(0);
    expect(codeFirst).toBe(KIND_CELLS);
  });

  it('counts a good document as spec', () => {
    // ARRANGE
    const c = { q: 1, f: 0, b: 1, mn: 2 };
    // ACT
    const index = fi(c);
    // ASSERT
    expect(index).toBe(fi({ kind: 'spec', ...c }));
  });

  it('orders the index by quality, failure demand, times sent back, then content', () => {
    // ARRANGE
    const base = { kind: 'spec' as const, q: 0, f: 0, b: 0, mn: 0 },
      expected = [1, 3, 9, 18];
    // ACT
    const steps = [{ mn: 1 }, { b: 1 }, { f: 1 }, { q: 1 }].map((d) => fi({ ...base, ...d }));
    // ASSERT
    expect(steps).toEqual(expected);
  });

  it('gives the last code cell the last index of the belt', () => {
    // ARRANGE
    const last = { kind: 'code' as const, q: 1, f: 1, b: 2, mn: 2 };
    // ACT
    const index = fi(last);
    // ASSERT
    expect(index).toBe(NF_ - 1);
  });

  it('lists every cell once, each carrying its own index', () => {
    // ARRANGE
    const mns = [0, 1, 2];
    // ACT
    const all = cells(mns);
    // ASSERT
    expect(all).toHaveLength(NF_);
    expect(all.map((c) => c.i).sort((a, b) => a - b)).toEqual(Array.from({ length: NF_ }, (_, i) => i));
    expect(all.every((c) => c.i === fi(c))).toBe(true);
  });

  it('lists only the cells that carry something when given contents 1 and 2', () => {
    // ARRANGE
    const mns = [1, 2],
      contents = 3;
    // ACT
    const carrying = cells(mns);
    // ASSERT
    expect(carrying).toHaveLength((NF_ * mns.length) / contents);
    expect(carrying.every((c) => c.mn !== 0)).toBe(true);
  });
});

describe('edge cases', () => {
  it('keeps a good document with a code-sized request in the spec half', () => {
    // ARRANGE
    const good = { q: 1, f: 1, b: 2, mn: 2 };
    // ACT
    const index = fi(good);
    // ASSERT
    expect(index).toBeLessThan(KIND_CELLS);
  });
});

describe('failure cases', () => {
  it('lists no cell when no content is asked for', () => {
    // ARRANGE
    const mns: number[] = [];
    // ACT
    const none = cells(mns);
    // ASSERT
    expect(none).toEqual([]);
  });
});
