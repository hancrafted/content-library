/** One CPU's cumulative ticks: idle, and everything else (user, nice, sys, irq). */
export interface CpuTimes {
  idle: number;
  busy: number;
}

/** Workers for a run: the cores other processes leave free, never below 2 nor above cores - 1. */
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
