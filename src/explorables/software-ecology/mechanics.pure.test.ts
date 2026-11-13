import { describe, expect, it } from 'vitest';
import { constOf, fileMechanics, MECH_KEYS, strengthDefault } from './mechanics.pure.ts';
import type { Bundle } from './software-ecology.types';
import { builtinBundle } from './use-case-data.ts';

/* A use-case file's `mechanics` (design-ADR 0024 §5): strengths and constants, each in its own settings field. */
const withMechanics = (mechanics: Bundle['data']['mechanics']): Bundle => {
  const B = builtinBundle('tire');
  return { ...B, data: { ...B.data, mechanics } };
};

describe('success cases', () => {
  it('splits a file’s mechanics into strengths and constants, the defaults filling the rest', () => {
    // ARRANGE
    const B = withMechanics({ rework: 0.5, redo: 0.6 });
    const expected = {
      strength: { rework: 0.5, churn: 1.2 },
      consts: { inspect: 2.4, redo: 0.6, keepExtra: 0.3, maxBounces: 2, pressure: 1.4 },
    };
    // ACT
    const m = fileMechanics(B);
    // ASSERT
    expect(m).toEqual(expected);
  });

  it('reads a constant from the settings, else its default', () => {
    // ARRANGE
    const pressure = 0.8,
      byDefault = 2.4;
    // ACT
    const read = [constOf({ consts: { pressure } }, 'pressure'), constOf({ consts: {} }, 'inspect')];
    // ASSERT
    expect(read).toEqual([pressure, byDefault]);
  });
});

describe('failure cases', () => {
  it('reads the defaults for a file without mechanics', () => {
    // ARRANGE
    const B = withMechanics(undefined);
    const expected = { rework: 0.4, churn: 1.2 };
    // ACT
    const m = fileMechanics(B);
    // ASSERT
    expect(m.strength).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lists the strengths before the constants, as a file names them', () => {
    // ARRANGE
    const expected = ['rework', 'churn', 'inspect', 'redo', 'keepExtra', 'maxBounces', 'pressure'];
    // ACT
    const keys = MECH_KEYS;
    // ASSERT
    expect(keys).toEqual(expected);
  });

  it('gives a slider without a value its strength’s default', () => {
    // ARRANGE
    const churn = 1.2;
    // ACT
    const v = strengthDefault('churn');
    // ASSERT
    expect(v).toBe(churn);
  });
});
