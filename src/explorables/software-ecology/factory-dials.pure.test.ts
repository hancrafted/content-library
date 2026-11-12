import { describe, expect, it } from 'vitest';
import { catches, passShareOf, pressureOf, RED } from './factory-dials.pure.ts';
import type { FactoryNode } from './factory.types';
import { constOf } from './mechanics.pure.ts';
import type { CenterDef, Settings } from './software-ecology.types';

/*
 * How a filling backlog bites (design-ADR 0024 §5): an inspection passes more unread as its pile fills, and a station
 * with `escalate` passes tickets on only once it is drowning, its pile red (grill 11 Q227).
 */
const S = { strength: { rework: 0.4 }, consts: {} } as unknown as Settings;
/** `mechanics.pressure` at its default. */
const PRESSURE = constOf(S, 'pressure');

/** A station with `weeks` of work waiting, its pressure read from `Ws`. */
const station = (weeks: number, def: Partial<CenterDef> = {}): FactoryNode => ({ Ws: weeks, def }) as never;

describe('success cases', () => {
  it('bites by mechanics.pressure times the strength times the pile’s pressure', () => {
    // ARRANGE
    const strength = 0.5,
      expected = PRESSURE * strength * 0.5,
      digits = 9;
    // ACT
    const p = pressureOf(S, station(1), strength);
    // ASSERT
    expect(p).toBeCloseTo(expected, digits);
  });

  it('passes nothing on below the drowning mark, where the pile turns red', () => {
    // ARRANGE
    const weeks = [0, 1, RED - 0.01, RED];
    // ACT
    const shares = weeks.map((w) => passShareOf(S, station(w), 0.8));
    // ASSERT
    expect(shares).toEqual([0, 0, 0, 0]);
  });

  it('passes on a share that rises with the weeks waiting past the mark, by the same pressure term', () => {
    // ARRANGE
    const strength = 0.5,
      expected = PRESSURE * strength * 0.5,
      digits = 9;
    // ACT
    const share = passShareOf(S, station(RED * 1.5), strength);
    // ASSERT
    expect(share).toBeCloseTo(expected, digits);
  });

  it('can catch a kind its station’s catch names, and none it leaves out', () => {
    // ARRANGE
    const qa = station(0, { catch: { code: 0.6 } });
    // ACT
    const can = [catches(S, qa, 'code'), catches(S, qa, 'spec')];
    // ASSERT
    expect(can).toEqual([true, false]);
  });
});

describe('failure cases', () => {
  it('passes nothing on at a strength of 0, however deep the pile', () => {
    // ARRANGE
    const deep = station(RED * 10);
    // ACT
    const share = passShareOf(S, deep, 0);
    // ASSERT
    expect(share).toBe(0);
  });
});

describe('edge cases', () => {
  it('caps the bite and the pass-on share at all of it', () => {
    // ARRANGE
    const deep = station(RED * 10);
    // ACT
    const both = [pressureOf(S, deep, 2), passShareOf(S, deep, 2)];
    // ASSERT
    expect(both).toEqual([1, 1]);
  });

  it('catches every kind at a station without a catch while the rework strength is on', () => {
    // ARRANGE
    const plain = station(0);
    // ACT
    const can = [catches(S, plain, 'code'), catches(S, plain, 'spec')];
    // ASSERT
    expect(can).toEqual([true, true]);
  });
});
