import os from 'node:os';
import { describe, expect, it } from 'vitest';
import { currentLoad } from './workers.ts';

describe('currentLoad', () => {
  it('keeps the 5 s timeout on a CI runner, so CI measures the test and not the machine', async () => {
    // ARRANGE
    const env = { CI: 'true' };
    // ACT
    const load = await currentLoad(env);
    // ASSERT
    expect(load.testTimeout).toBe(5_000);
    expect(load.loadFactor).toBe(1);
  });

  it('takes every core but one on a CI runner, which no other run shares', async () => {
    // ARRANGE
    const cores = os.cpus().length;
    // ACT
    const { workers } = await currentLoad({ CI: 'true' });
    // ASSERT
    expect(workers).toBe(Math.max(cores - 1, 1));
  });
});

describe('the vitest configs', () => {
  it('lets the fast config take the load-aware timeout and log its slow tests, while the slow config keeps its own', async () => {
    // ARRANGE
    const slowLaneTimeout = 60_000;
    const { SlowTestsLog } = await import('./slow-tests.mts');
    // ACT
    const fast = (await import('../../vitest.config.mts')).default;
    const slow = (await import('../../vitest.slow.config.mts')).default;
    // ASSERT
    expect(fast.test?.testTimeout).toBeGreaterThanOrEqual(5_000);
    expect(fast.test?.testTimeout).toBeLessThanOrEqual(20_000);
    expect(fast.test?.reporters).toContainEqual(expect.any(SlowTestsLog));
    expect(slow.test?.testTimeout).toBe(slowLaneTimeout);
  });
});
