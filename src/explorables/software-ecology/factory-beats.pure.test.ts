import { describe, expect, it } from 'vitest';
import { stepsTo } from './beat-means.pure.ts';
import { beatsOf, stepsOf } from './factory-beats.pure.ts';
import type { Preset } from './software-ecology.types';

/* The beat plan (design-ADR 0024 §10, §12): the stops and sample windows the tour and the judge share. */

const preset = (steps: object[]): Preset => ({ id: 'p', tour: steps }) as unknown as Preset;

describe('success cases', () => {
  it('starts each beat where the beat before ended, offset by the scenario start', () => {
    // ARRANGE
    const [run1, run2] = [6, 15],
      p = preset([{ run: run1, expect: { 'customer.a': '>1' } }, { run: run2 }]),
      t0k = 100;
    // ACT
    const [first, second] = beatsOf(p, t0k);
    // ASSERT
    expect(first?.start).toBe(t0k);
    expect(first?.end).toBe(t0k + stepsTo(run1));
    expect(second?.start).toBe(first?.end);
    expect(second?.end).toBe(t0k + stepsTo(run2));
  });

  it('reads the measures the expect ranges of any beat name, once, in every beat', () => {
    // ARRANGE
    const p = preset([
      { run: 6, expect: { x: '>1' } },
      { run: 12, expect: { x: '<2', y: '>0' } },
    ]);
    // ACT
    const beats = beatsOf(p, 0);
    // ASSERT
    expect(beats.map((b) => b.keys)).toEqual([
      ['x', 'y'],
      ['x', 'y'],
    ]);
  });

  it('plans a check as one beat', () => {
    // ARRANGE
    const run = 8,
      p = { id: 'c', check: { run } } as unknown as Preset;
    // ACT
    const beats = beatsOf(p, 0);
    // ASSERT
    expect(beats).toHaveLength(stepsOf(p).length);
    expect(beats[0]?.end).toBe(stepsTo(run));
  });
});

describe('failure cases', () => {
  it('plans nothing for a preset without steps', () => {
    // ARRANGE
    const p = { id: 'n' } as unknown as Preset;
    // ACT
    const beats = beatsOf(p, 0);
    // ASSERT
    expect(beats).toEqual([]);
  });
});

describe('edge cases', () => {
  it('starts the first beat on the scenario start', () => {
    // ARRANGE
    const p = preset([{ run: 1 }]),
      t0k = 7;
    // ACT
    const [first] = beatsOf(p, t0k);
    // ASSERT
    expect(first?.start).toBe(t0k);
  });
});
