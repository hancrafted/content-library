import os from 'node:os';
import { idleFraction, IDLE_TIMEOUT_MILLISECONDS, loadFromIdle, type CpuTimes, type Load } from './workers.pure.ts';

const sample = (): CpuTimes[] =>
  os.cpus().map(({ times }) => ({ idle: times.idle, busy: times.user + times.nice + times.sys + times.irq }));

const SAMPLE_MILLISECONDS = 200;

/**
 * The load on this machine right now, shared by the fast and slow vitest configs. It measures idle CPU over a
 * 200 ms window rather than reading `os.loadavg()`: on macOS the load average overcounts (load 10.6 on a 16-core
 * machine that was 86% idle) and lags a minute behind, including the caller's own just-finished runs.
 * A CI runner runs one job alone, so there it takes every core but one and the 5 s timeout without measuring: the
 * runner's own start-up work would otherwise read as contention, and CI measures the test, not the machine.
 */
export async function currentLoad(env: Record<string, string | undefined> = process.env): Promise<Load> {
  if (env.CI)
    return { workers: Math.max(os.cpus().length - 1, 1), loadFactor: 1, testTimeout: IDLE_TIMEOUT_MILLISECONDS };
  const before = sample();
  await new Promise((resolve) => setTimeout(resolve, SAMPLE_MILLISECONDS));
  return loadFromIdle(before.length, idleFraction(before, sample()));
}
