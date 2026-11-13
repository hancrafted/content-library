import { describe, expect, it } from 'vitest';
import { badOut, copyKinds, kindChancesOf, kindTargets } from './defect.pure.ts';

/* Defect origin (design-ADR 0024 §5): `customer.bad` read per kind, and written back as the file writes it. */
describe('success cases', () => {
  it('reads a kinded customer.bad as one map per kind', () => {
    // ARRANGE
    const raw = { spec: { pm: 0.5 }, code: { support: 0.4 } };
    const expected = { spec: { pm: 0.5 }, code: { support: 0.4 } };
    // ACT
    const kinds = kindChancesOf(raw);
    // ASSERT
    expect(kinds).toEqual(expected);
  });

  it('reads one flat map as the same chances for both kinds', () => {
    // ARRANGE
    const raw = { support: 0.3 };
    const expected = { spec: { support: 0.3 }, code: { support: 0.3 } };
    // ACT
    const kinds = kindChancesOf(raw);
    // ASSERT
    expect(kinds).toEqual(expected);
  });

  it('writes chances that agree as one flat map, and ones that differ per kind', () => {
    // ARRANGE
    const same = { spec: { pm: 0.2 }, code: { pm: 0.2 } };
    const apart = { spec: { pm: 0.5 }, code: { support: 0.5 } };
    const expected = [{ pm: 0.2 }, { spec: { pm: 0.5 }, code: { support: 0.5 } }];
    // ACT
    const written = [badOut(same), badOut(apart)];
    // ASSERT
    expect(written).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reads a missing or empty customer.bad as no follow-ups of either kind', () => {
    // ARRANGE
    const none = { spec: {}, code: {} };
    // ACT
    const read = [kindChancesOf(undefined), kindChancesOf({})];
    // ASSERT
    expect(read).toEqual([none, none]);
  });

  it('reads a map keyed by work centers that happen to mix in a kind name as flat', () => {
    // ARRANGE
    const raw = { spec: 0.2, support: 0.3 } as never;
    const expected = { spec: { spec: 0.2, support: 0.3 }, code: { spec: 0.2, support: 0.3 } };
    // ACT
    const kinds = kindChancesOf(raw);
    // ASSERT
    expect(kinds).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('names every work center a bad release of any kind reaches, once', () => {
    // ARRANGE
    const kinds = { spec: { pm: 0.5, support: 0.1 }, code: { support: 0.5 } };
    const expected = ['pm', 'support'];
    // ACT
    const targets = kindTargets(kinds);
    // ASSERT
    expect(targets).toEqual(expected);
  });

  it('copies per-kind chances so a change to the copy leaves the original alone', () => {
    // ARRANGE
    const original = { spec: { pm: 0.5 }, code: { support: 0.5 } };
    const expected = { spec: { pm: 0.5 }, code: { support: 0.5 } };
    // ACT
    const copy = copyKinds(original);
    copy.spec.pm = 0.9;
    // ASSERT
    expect(original).toEqual(expected);
  });
});
