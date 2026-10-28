import type { Job } from './workflow.types';

/*
 * The order a stage's jobs are drawn in: after the jobs they `needs`, else in file order. The loader refuses unknown
 * ids and cycles, so here a bad `needs` only costs order, never a job: each job is drawn once.
 */

/** The jobs with each placed after the jobs it needs; jobs that need nothing of each other keep their file order. */
export function orderedJobs(jobs: readonly Job[]): Job[] {
  const byId = new Map(jobs.map((each) => [each.id, each]));
  const placed = new Set<string>();
  const out: Job[] = [];
  const place = (each: Job) => {
    if (placed.has(each.id)) return;
    placed.add(each.id);
    for (const id of each.needs) {
      const needed = byId.get(id);
      if (needed) place(needed);
    }
    out.push(each);
  };
  jobs.forEach(place);
  return out;
}
