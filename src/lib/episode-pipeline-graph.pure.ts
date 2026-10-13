/*
 * The `needs` and `wants` graph of a new-episode pipeline: which jobs a job
 * waits for, directly or through others, whether the waiting ever loops
 * back, and which jobs may run at the same time. A job waits for a job it
 * wants as for one it needs; only a blocked need blocks it.
 */

import type { Job } from './episode-pipeline-jobs.pure';

/** Every job `id` waits for directly: the ones it needs, then the ones it wants. */
export function waitsFor(id: string, byId: ReadonlyMap<string, Job>): string[] {
  const job = byId.get(id);
  return job === undefined ? [] : [...job.needs, ...job.wants];
}

/** Every job `id` waits for, directly or through another job, guarded against cycles. */
export function ancestors(id: string, byId: ReadonlyMap<string, Job>): Set<string> {
  const seen = new Set<string>();
  const visit = (current: string): void => {
    for (const need of waitsFor(current, byId)) {
      if (seen.has(need)) continue;
      seen.add(need);
      visit(need);
    }
  };
  visit(id);
  return seen;
}

/** The first cycle in the needs graph, as the ids along it, or null. */
export function findCycle(jobs: readonly Job[], byId: ReadonlyMap<string, Job>): string[] | null {
  const done = new Set<string>();
  const walk = (id: string, path: readonly string[]): string[] | null => {
    if (path.includes(id)) return [...path.slice(path.indexOf(id)), id];
    if (done.has(id)) return null;
    const needs = waitsFor(id, byId);
    const cycle = needs.reduce<string[] | null>((found, need) => found ?? walk(need, [...path, id]), null);
    done.add(id);
    return cycle;
  };
  return jobs.reduce<string[] | null>((found, { id }) => found ?? walk(id, []), null);
}

/**
 * The jobs that may run at the same time as another: neither waits for the
 * other, directly or through another job.
 */
export function concurrentJobs(jobs: readonly Job[], byId: ReadonlyMap<string, Job>): Set<string> {
  const upstream = new Map(jobs.map(({ id }) => [id, ancestors(id, byId)]));
  const ordered = (a: string, b: string): boolean =>
    (upstream.get(a)?.has(b) ?? false) || (upstream.get(b)?.has(a) ?? false);
  return new Set(
    jobs.filter(({ id }) => jobs.some((other) => other.id !== id && !ordered(id, other.id))).map(({ id }) => id),
  );
}
