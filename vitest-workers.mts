import os from 'node:os';

/** Workers for a vitest run: the cores other processes leave free, never below 2 nor above cores - 1. */
export function workersFor(cores: number, load1m: number): number {
  return Math.min(Math.max(Math.floor(cores - load1m), 2), cores - 1);
}

/** The worker count for this machine right now, shared by the fast and slow vitest configs. */
export const currentWorkers = (): number => workersFor(os.cpus().length, os.loadavg()[0]);
