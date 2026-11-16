import os from 'node:os';
import { idleFraction, workersFor, type CpuTimes } from './workers.pure.ts';

const sample = (): CpuTimes[] =>
  os.cpus().map(({ times }) => ({ idle: times.idle, busy: times.user + times.nice + times.sys + times.irq }));

const SAMPLE_MS = 200;

/**
 * The worker count for this machine right now, shared by the fast and slow vitest configs and the art bake. It measures idle CPU
 * over a 200 ms window rather than reading `os.loadavg()`: on macOS the load average overcounts (load 10.6 on a
 * 16-core machine that was 86% idle) and lags a minute behind, including the caller's own just-finished runs.
 * A CI runner runs one job alone, so there it takes every core but one without measuring: the runner's own
 * start-up work would otherwise read as contention and shrink the pool.
 */
export async function currentWorkers(env: Record<string, string | undefined> = process.env): Promise<number> {
  if (env.CI) return Math.max(os.cpus().length - 1, 1);
  const before = sample();
  await new Promise((resolve) => setTimeout(resolve, SAMPLE_MS));
  const cores = before.length;
  return workersFor(cores, cores * idleFraction(before, sample()));
}
