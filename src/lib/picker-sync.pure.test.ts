import { describe, expect, it } from 'vitest';
import { settleValue } from './picker-sync.pure';

describe('success cases', () => {
  it('takes the newest value it emitted as its own, leaving nothing pending', () => {
    // ARRANGE
    const pending = ['oklch(0.5 0.1 20)', 'oklch(0.4 0.1 20)'];
    const arrived = 'oklch(0.4 0.1 20)';
    // ACT
    const settled = settleValue(pending, arrived);
    // ASSERT
    expect(settled).toEqual({ pending: [], external: false });
  });

  it('takes a lagging value as its own and keeps the newer emissions pending', () => {
    // ARRANGE
    const pending = ['oklch(0.5 0.1 20)', 'oklch(0.4 0.1 20)', 'oklch(0.3 0.1 20)'];
    const arrived = 'oklch(0.5 0.1 20)';
    // ACT
    const settled = settleValue(pending, arrived);
    // ASSERT
    expect(settled).toEqual({ pending: ['oklch(0.4 0.1 20)', 'oklch(0.3 0.1 20)'], external: false });
  });
});

describe('failure cases', () => {
  it('reports a value the picker never emitted as external and forgets what was pending', () => {
    // ARRANGE
    const pending = ['oklch(0.5 0.1 20)'];
    const arrived = 'oklch(0.9 0 0)';
    // ACT
    const settled = settleValue(pending, arrived);
    // ASSERT
    expect(settled).toEqual({ pending: [], external: true });
  });
});

describe('edge cases', () => {
  it('reports the first value, with nothing emitted yet, as external', () => {
    // ARRANGE
    const arrived = 'oklch(0.9 0 0)';
    // ACT
    const settled = settleValue([], arrived);
    // ASSERT
    expect(settled).toEqual({ pending: [], external: true });
  });

  it('does not mutate the pending list it was given', () => {
    // ARRANGE
    const pending = ['a', 'b'];
    const before = [...pending];
    // ACT
    settleValue(pending, 'a');
    // ASSERT
    expect(pending).toEqual(before);
  });
});
