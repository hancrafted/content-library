/*
 * The `needs` and `wants` graph of a new-episode pipeline: which jobs a job
 * waits for through others, and which jobs may run at the same time. Whether
 * the waiting ever loops back is the Pipeline definition's `jobGraph`. A job
 * waits for a job it wants as for one it needs; only a blocked need blocks it.
 */

import { waitsFor, type Job } from './episode-pipeline-definition.pure';

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
