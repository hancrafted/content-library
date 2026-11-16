import os from 'node:os';

/** One CPU's cumulative ticks: idle, and everything else (user, nice, sys, irq). */
export type CpuTimes = { idle: number; busy: number };

/** Workers for a vitest run: the cores other processes leave free, never below 2 nor above cores - 1. */
export function workersFor(cores: number, freeCores: number): number {
  return Math.min(Math.max(Math.floor(freeCores), 2), cores - 1);
}

/** The idle share (0 to 1) of the time that passed between two samples, summed across all CPUs. */
export function idleFraction(before: CpuTimes[], after: CpuTimes[]): number {
  let idle = 0;
  let total = 0;
  after.forEach((now, i) => {
    const then = before[i];
    idle += now.idle - then.idle;
    total += now.idle - then.idle + (now.busy - then.busy);
  });
  return total > 0 ? idle / total : 1;
}

const sample = (): CpuTimes[] =>
  os.cpus().map(({ times }) => ({ idle: times.idle, busy: times.user + times.nice + times.sys + times.irq }));

const SAMPLE_MS = 200;

/**
 * The worker count for this machine right now, shared by the fast and slow vitest configs. It measures idle CPU
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
