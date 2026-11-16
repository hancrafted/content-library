import os from 'node:os';
import { describe, expect, it } from 'vitest';
import { currentWorkers } from './workers.ts';

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
