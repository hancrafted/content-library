import { describe, expect, it } from 'vitest';
import { paperExit } from './paper-exit.pure';

describe('success cases', () => {
  it('lifts a bottom sheet over the tray rim before throwing it', () => {
    // ARRANGE
    const expected = { lift: 190, sideways: 70, hang: 0.375, throwTime: 0.875, drop: 65, spin: 5 };
    // ACT
    const exit = paperExit(0, () => 0.5);
    // ASSERT
    expect(exit).toEqual(expected);
  });
  it('lifts a sheet already above the rim only by its random margin', () => {
    // ARRANGE
    const expectedLift = 40;
    // ACT
    const exit = paperExit(40, () => 0.5);
    // ASSERT
    expect(exit.lift).toBe(expectedLift);
  });
});
describe('failure cases', () => {
  it.each([-1, 1.5, Number.NaN])('rejects pile index %s', (index) => {
    // ARRANGE
    const expected = RangeError;
    // ACT
    const exit = () => paperExit(index, () => 0.5);
    // ASSERT
    expect(exit).toThrow(expected);
  });
  it('rejects an out-of-range roll', () => {
    // ARRANGE
    const expected = RangeError;
    // ACT
    const exit = () => paperExit(0, () => 2);
    // ASSERT
    expect(exit).toThrow(expected);
  });
});
describe('edge cases', () => {
  it('keeps the throw within its bounds at both ends of the roll', () => {
    // ARRANGE
    const lowest = { lift: 20, sideways: 20, hang: 0.25, throwTime: 0.75, drop: 20, spin: -4 };
    const highest = { lift: 60, sideways: 120, hang: 0.5, throwTime: 1, drop: 110, spin: 14 };
    // ACT
    const low = paperExit(30, () => 0);
    const high = paperExit(30, () => 1);
    // ASSERT
    expect(low).toEqual(lowest);
    expect(high).toEqual(highest);
  });
});
