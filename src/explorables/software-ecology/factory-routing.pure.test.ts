import { describe, expect, it } from 'vitest';
import { RED } from './factory-dials.pure.ts';
import { passesOn } from './factory-routing.pure.ts';
import type { Belt, FactoryNode, SpawnRule } from './factory.types';
import { constOf } from './mechanics.pure.ts';
import type { Settings } from './software-ecology.types';

/*
 * Pass-on under pressure (design-ADR 0024 §5, grill 11 Q220, Q227): a station with `escalate` passes a ticket it takes
 * up on unanswered, at a share that rises past the drowning mark; Ideal takes turns, Realistic rolls.
 */
const BELT = {} as Belt;
const IDEAL = { consts: {}, reality: 0 } as unknown as Settings;
const REALISTIC = { consts: {}, reality: 100 } as unknown as Settings;

/** A station `weeks` of work deep, passing on at `under`, its routing dice fixed to `roll`. */
const station = (weeks: number, x: { under?: number; roll?: number } = {}) => {
  const draws = { n: 0 };
  const spawns: SpawnRule[] = [
    { e: BELT, n: 1, ...(x.under === undefined ? {} : { pass: { e: BELT, under: x.under } }) },
  ];
  const n = {
    Ws: weeks,
    spawns,
    rr: () => {
      draws.n++;
      return x.roll ?? 0;
    },
  } as unknown as FactoryNode;
  return { n, draws };
};

/** Whether each of `times` tickets taken up in a row is passed on. */
const takeUp = (s: Settings, n: FactoryNode, times: number): boolean[] =>
  Array.from({ length: times }, () => passesOn(s, n));

/** Weeks of work waiting where the pass-on share is `share` at strength 1, `mechanics.pressure` at its default. */
const weeksFor = (share: number): number => RED + (share / constOf(IDEAL, 'pressure')) * RED;

describe('success cases', () => {
  it('takes turns in Ideal: every other ticket at a share of a half', () => {
    // ARRANGE
    const { n } = station(weeksFor(0.5), { under: 1 });
    // ACT
    const passed = takeUp(IDEAL, n, 4);
    // ASSERT
    expect(passed).toEqual([false, true, false, true]);
  });

  it('rolls in Realistic: a ticket is passed on when the roll falls under the share', () => {
    // ARRANGE
    const low = station(weeksFor(0.5), { under: 1, roll: 0.4 }).n,
      high = station(weeksFor(0.5), { under: 1, roll: 0.6 }).n;
    // ACT
    const passed = [passesOn(REALISTIC, low), passesOn(REALISTIC, high)];
    // ASSERT
    expect(passed).toEqual([true, false]);
  });

  it('passes on by the first spawn only: a pass-on on a later spawn never fires', () => {
    // ARRANGE
    const { n, draws } = station(RED * 10);
    n.spawns.push({ e: BELT, n: 1, pass: { e: BELT, under: 1 } });
    // ACT
    const passed = takeUp(REALISTIC, n, 3);
    // ASSERT
    expect(passed).toEqual([false, false, false]);
    expect(draws.n).toBe(0);
  });
});

describe('failure cases', () => {
  it('never passes on at a station without escalate, however deep its pile', () => {
    // ARRANGE
    const { n, draws } = station(RED * 10);
    // ACT
    const passed = takeUp(REALISTIC, n, 3);
    // ASSERT
    expect(passed).toEqual([false, false, false]);
    expect(draws.n).toBe(0);
  });
});

describe('edge cases', () => {
  it('draws nothing and carries nothing over below the drowning mark, so its routing is unchanged', () => {
    // ARRANGE
    const { n, draws } = station(RED, { under: 1 });
    // ACT
    const passed = [...takeUp(REALISTIC, n, 3), ...takeUp(IDEAL, n, 3)];
    // ASSERT
    expect(passed.some(Boolean)).toBe(false);
    expect(draws.n).toBe(0);
    expect(n.spawns[0]?.pacc).toBeUndefined();
  });
});
