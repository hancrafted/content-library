import os from 'node:os';
import { idleFraction, IDLE_TIMEOUT_MILLISECONDS, loadFromIdle, type CpuTimes, type Load } from './workers.pure.ts';

const sample = (): CpuTimes[] =>
  os.cpus().map(({ times }) => ({ idle: times.idle, busy: times.user + times.nice + times.sys + times.irq }));

const SAMPLE_MILLISECONDS = 200;

export async function currentLoad(env: Record<string, string | undefined> = process.env): Promise<Load> {
  if (env.CI)
    return { workers: Math.max(os.cpus().length - 1, 1), loadFactor: 1, testTimeout: IDLE_TIMEOUT_MILLISECONDS };
  const before = sample();
  await new Promise((resolve) => setTimeout(resolve, SAMPLE_MILLISECONDS));
  return loadFromIdle(before.length, idleFraction(before, sample()));
}
