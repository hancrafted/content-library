import { describe, expect, it } from 'vitest';
import { trustLevel } from './trust.pure';

describe('success cases', () => {
  it('moves a high-need task to on the loop once its trust is earned', () => {
    // ARRANGE
    const expected = 'on';
    // ACT
    const actual = trustLevel({ needed: 3, earned: 3 });
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('lets a low-need task step out of the loop once its trust is earned', () => {
    // ARRANGE
    const expected = 'out';
    // ACT
    const actual = trustLevel({ needed: 1, earned: 1 });
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('failure cases', () => {
  it('keeps a person in the loop while the trust earned is short of the trust needed', () => {
    // ARRANGE
    const expected = 'in';
    // ACT
    const actual = trustLevel({ needed: 3, earned: 1 });
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('edge cases', () => {
  it('keeps a person in the loop one step short of the trust needed', () => {
    // ARRANGE
    const expected = 'in';
    // ACT
    const actual = trustLevel({ needed: 3, earned: 2 });
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('never steps a task out beyond on the loop while its need is above the lowest', () => {
    // ARRANGE
    const expected = ['on', 'on'];
    // ACT
    const actual = [trustLevel({ needed: 2, earned: 2 }), trustLevel({ needed: 3, earned: 3 })];
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
