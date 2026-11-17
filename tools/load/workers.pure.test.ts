import { describe, expect, it } from 'vitest';
import { idleFraction, loadFromIdle, timeoutFor, workersFor, type CpuTimes } from './workers.pure.ts';

const cpu = (idle: number, busy: number): CpuTimes => ({ idle, busy });

describe('workersFor', () => {
  it('gives an idle machine every core but one', () => {
    expect(workersFor(16, 16)).toBe(15);
  });

  it('shares the free cores on a partly busy machine', () => {
    expect(workersFor(16, 9.6)).toBe(9);
  });

  it('keeps the floor of 2 on a saturated machine', () => {
    expect(workersFor(16, 0.5)).toBe(2);
    expect(workersFor(16, 0)).toBe(2);
  });

  it('caps a small machine at cores minus one', () => {
    expect(workersFor(4, 4)).toBe(3);
    expect(workersFor(4, 0.5)).toBe(2);
  });
});

describe('idleFraction', () => {
  it('is the idle share of the time that passed across all CPUs', () => {
    const before = [cpu(100, 100), cpu(100, 100)];
    const after = [cpu(190, 110), cpu(170, 130)];
    // idle +160 of +200 total
    expect(idleFraction(before, after)).toBeCloseTo(0.8);
  });

  it('counts a machine with no elapsed ticks as fully idle', () => {
    expect(idleFraction([cpu(5, 5)], [cpu(5, 5)])).toBe(1);
  });
});

describe('timeoutFor', () => {
  it('keeps the 5 s default up to the deadband, where a quiet machine reads 1.1 to 1.4', () => {
    // ARRANGE
    const quiet = [1, 1.1, 1.4, 1.5];
    // ACT
    const timeouts = quiet.map(timeoutFor);
    // ASSERT
    expect(timeouts).toEqual([5_000, 5_000, 5_000, 5_000]);
  });

  it('scales the timeout with the load factor above the deadband', () => {
    // ARRANGE
    const busy = [3, 4.5];
    // ACT
    const timeouts = busy.map(timeoutFor);
    // ASSERT
    expect(timeouts).toEqual([10_000, 15_000]);
  });

  it('caps the timeout at 20 s however loaded the machine is', () => {
    // ARRANGE
    const saturated = 100;
    // ACT
    const timeout = timeoutFor(saturated);
    // ASSERT
    expect(timeout).toBe(20_000);
  });
});

describe('loadFromIdle', () => {
  it('gives a normally idle machine the 5 s timeout', () => {
    // ARRANGE: 16 cores, 80% idle over the sample window (load factor 1.25)
    const before = Array.from({ length: 16 }, () => cpu(1_000, 1_000));
    const after = Array.from({ length: 16 }, () => cpu(1_080, 1_020));
    // ACT
    const load = loadFromIdle(16, idleFraction(before, after));
    // ASSERT
    expect(load.loadFactor).toBeCloseTo(1.25);
    expect(load.testTimeout).toBe(5_000);
    expect(load.workers).toBe(12);
  });

  it('lengthens the timeout on a machine a quarter idle', () => {
    // ARRANGE
    const idle = 0.25;
    // ACT
    const load = loadFromIdle(16, idle);
    // ASSERT
    expect(load.testTimeout).toBe(13_333);
  });

  it('keeps a saturated machine finite and capped', () => {
    // ARRANGE
    const idle = 0;
    // ACT
    const load = loadFromIdle(16, idle);
    // ASSERT
    expect(load.testTimeout).toBe(20_000);
    expect(load.workers).toBe(2);
  });
});
