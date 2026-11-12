import { describe, expect, it } from 'vitest';
import { AMBER, RED } from './factory-dials.pure.ts';
import { level, waitState } from './factory-wait.pure.ts';
import type { FactoryNode } from './factory.types';

/*
 * A pile's wait state (design-ADR 0024 §5): `waitState` is the one writer of a work center's waiting time and its
 * level, which the pressure it puts on its station is read from.
 */
const LEVEL_RED = 2;
const pile = (lvl: number): FactoryNode => ({ Ws: 0, lvl }) as unknown as FactoryNode;

describe('success cases', () => {
  it('sets the weeks waiting and the level they read from the pile’s current level', () => {
    // ARRANGE
    const n = pile(1),
      weeks = RED + 1;

    // ACT
    waitState(n, weeks);

    // ASSERT
    expect([n.Ws, n.lvl]).toEqual([weeks, LEVEL_RED]);
  });

  it('turns amber from one week and red from two', () => {
    // ARRANGE
    const below = AMBER - 0.01,
      red = LEVEL_RED;

    // ACT
    const levels = [level(0, below), level(0, AMBER), level(1, RED)];

    // ASSERT
    expect(levels).toEqual([0, 1, red]);
  });
});

describe('failure cases', () => {
  it('leaves the level alone for a pile that is not a work center’s yet (weeks 0)', () => {
    // ARRANGE
    const n = pile(0);

    // ACT
    waitState(n, 0);

    // ASSERT
    expect([n.Ws, n.lvl]).toEqual([0, 0]);
  });
});

describe('edge cases', () => {
  it('keeps a level with a gap so it never blinks', () => {
    // ARRANGE
    const amber = AMBER * 0.9,
      red = RED * 0.95,
      held = LEVEL_RED;

    // ACT
    const levels = [level(1, amber), level(2, red), level(1, AMBER * 0.8), level(2, RED * 0.85)];

    // ASSERT
    expect(levels).toEqual([1, held, 0, 1]);
  });
});
