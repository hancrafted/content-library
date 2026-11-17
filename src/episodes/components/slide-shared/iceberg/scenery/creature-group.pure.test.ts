import { describe, expect, it } from 'vitest';
import { placeTransform } from './creature-group.pure';

describe('success cases', () => {
  it('moves a member to its spot and draws it at its own size times the group scale', () => {
    // ARRANGE
    const member = { x: 12, y: -8, s: 0.5 };
    const expected = 'translate(12 -8) scale(0.75 0.75)';
    // ACT
    const transform = placeTransform(member, 1.5);
    // ASSERT
    expect(transform).toBe(expected);
  });

  it('mirrors a member across, keeping its height, when the group faces left', () => {
    // ARRANGE
    const member = { x: -20, y: 4, s: 2 };
    const expected = 'translate(-20 4) scale(-2.5 2.5)';
    // ACT
    const transform = placeTransform(member, 1.25, true);
    // ASSERT
    expect(transform).toBe(expected);
  });
});

describe('failure cases', () => {
  it('refuses a group scale of zero or less, which would hide or silently mirror every member', () => {
    // ARRANGE
    const member = { x: 0, y: 0, s: 1 };
    const expected = [/positive group scale, got 0/, /positive group scale, got -1/];
    // ACT
    const seen = [0, -1].map((scale) => () => placeTransform(member, scale));
    // ASSERT
    expect(seen[0]).toThrow(expected[0]);
    expect(seen[1]).toThrow(expected[1]);
  });
});

describe('edge cases', () => {
  it('leaves a full-size member at the centre of a group at scale 1 exactly where the group stands', () => {
    // ARRANGE
    const member = { x: 0, y: 0, s: 1 };
    const expected = 'translate(0 0) scale(1 1)';
    // ACT
    const transform = placeTransform(member, 1);
    // ASSERT
    expect(transform).toBe(expected);
  });
});
