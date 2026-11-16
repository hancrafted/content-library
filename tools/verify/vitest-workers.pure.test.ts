import os from 'node:os';
import { describe, expect, it } from 'vitest';
import { currentWorkers, idleFraction, workersFor, type CpuTimes } from './vitest-workers.pure.ts';

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

describe('currentWorkers', () => {
  it('takes every core but one on a CI runner, which no other run shares', async () => {
    // ARRANGE
    const cores = os.cpus().length;

    // ACT
    const workers = await currentWorkers({ CI: 'true' });

    // ASSERT
    expect(workers).toBe(Math.max(cores - 1, 1));
  });
});
