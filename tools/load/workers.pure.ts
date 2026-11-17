export interface CpuTimes {
  idle: number;
  busy: number;
}

export function workersFor(cores: number, freeCores: number): number {
  return Math.min(Math.max(Math.floor(freeCores), 2), cores - 1);
}

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

export const IDLE_TIMEOUT_MILLISECONDS = 5_000;
/** However loaded the machine, a fast test that needs longer than this is broken, not slowed down. */
const MAX_TIMEOUT_MILLISECONDS = 20_000;

const IDLE_DEADBAND = 1.5;

export function timeoutFor(loadFactor: number): number {
  return Math.min(
    Math.round(IDLE_TIMEOUT_MILLISECONDS * Math.max(loadFactor / IDLE_DEADBAND, 1)),
    MAX_TIMEOUT_MILLISECONDS,
  );
}

export interface Load {
  workers: number;
  loadFactor: number;
  testTimeout: number;
}

export function loadFromIdle(cores: number, idle: number): Load {
  // A saturated machine reads 0 idle: the floor keeps the factor finite, the cap in timeoutFor does the rest.
  const loadFactor = 1 / Math.max(idle, 0.01);
  return { workers: workersFor(cores, cores * idle), loadFactor, testTimeout: timeoutFor(loadFactor) };
}
