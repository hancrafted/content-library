/** One CPU's cumulative ticks: idle, and everything else (user, nice, sys, irq). */
export interface CpuTimes {
  idle: number;
  busy: number;
}

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

/** The fast suite's test timeout on an idle machine, and Vitest's own default: a fast test passes well inside it. */
export const IDLE_TIMEOUT_MILLISECONDS = 5_000;
/** However loaded the machine, a fast test that needs longer than this is broken, not slowed down. */
const MAX_TIMEOUT_MILLISECONDS = 20_000;

/**
 * The load factor a machine still counts as idle at. A quiet desktop reads 1.1 to 1.4 (background apps keep a
 * share of the CPU busy), so a deadband at 1.5 keeps it on the 5 s default.
 */
const IDLE_DEADBAND = 1.5;

/**
 * The fast suite's test timeout under a load factor (all the CPU time there is over the idle share of it: 1 on an
 * idle machine, 4 when a quarter is idle): 5 s up to the deadband, scaled by the factor over the deadband above
 * it, capped at 20 s, so a loaded run finishes.
 */
export function timeoutFor(loadFactor: number): number {
  return Math.min(
    Math.round(IDLE_TIMEOUT_MILLISECONDS * Math.max(loadFactor / IDLE_DEADBAND, 1)),
    MAX_TIMEOUT_MILLISECONDS,
  );
}

/** What a vitest run sizes itself by: the workers it may start, the load factor it measured and the timeout that gives. */
export interface Load {
  workers: number;
  loadFactor: number;
  testTimeout: number;
}

/** The load a machine with this many cores and this idle share (0 to 1) is under. */
export function loadFromIdle(cores: number, idle: number): Load {
  // A saturated machine reads 0 idle: the floor keeps the factor finite, the cap in timeoutFor does the rest.
  const loadFactor = 1 / Math.max(idle, 0.01);
  return { workers: workersFor(cores, cores * idle), loadFactor, testTimeout: timeoutFor(loadFactor) };
}
