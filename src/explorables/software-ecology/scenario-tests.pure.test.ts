import { describe, expect, it } from 'vitest';
import { judge, parseTest, validTest } from './scenario-tests.pure.ts';

/* The tests a scenario's `expect:` and `settles:` hold its readings to (design-ADR 0024 §10). */
describe('success cases', () => {
  it('parses a comparison, a range with an en dash or a hyphen, and a trend', () => {
    // ARRANGE
    const tests = ['>=1', '0.9–1.1', '0.9-1.1', 'rises'];
    const expected = [
      { kind: 'compare', op: '>=', k: 1 },
      { kind: 'range', lo: 0.9, hi: 1.1 },
      { kind: 'range', lo: 0.9, hi: 1.1 },
      { kind: 'rises' },
    ];
    // ACT
    const parsed = tests.map(parseTest);
    // ASSERT
    expect(parsed).toEqual(expected);
  });

  it('judges a value against a bound, a range and a trend against the beat before', () => {
    // ARRANGE
    const expected = [true, true, true, true];
    // ACT
    const held = [judge(3, '>2'), judge(0.4, '<=0.4'), judge(1, '0.95–1.05'), judge(0.2, 'falls', 0.5)];
    // ASSERT
    expect(held).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a test it cannot read, naming it', () => {
    // ARRANGE
    const message = /unknown test "lots"/;
    // ACT
    const run = () => judge(1, 'lots');
    // ASSERT
    expect(run).toThrow(message);
  });

  it('reads no test from words', () => {
    // ARRANGE
    const tests = ['lots', '> two', ''];
    // ACT
    const valid = tests.map(validTest);
    // ASSERT
    expect(valid).toEqual([false, false, false]);
  });
});

describe('edge cases', () => {
  it('fails a trend with nothing before it, and a value that does not move', () => {
    // ARRANGE
    const value = 0.5;
    // ACT
    const held = [judge(value, 'rises'), judge(value, 'rises', value), judge(value, 'falls', value)];
    // ASSERT
    expect(held).toEqual([false, false, false]);
  });

  it('holds a range at both of its ends', () => {
    // ARRANGE
    const lo = 0.9,
      hi = 1.1;
    // ACT
    const held = [judge(lo, '0.9–1.1'), judge(hi, '0.9–1.1')];
    // ASSERT
    expect(held).toEqual([true, true]);
  });
});
