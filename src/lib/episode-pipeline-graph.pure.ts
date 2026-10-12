/*
 * The `needs` graph of a new-episode pipeline: which jobs a job waits for,
 * directly or through others, and whether the waiting ever loops back.
 */

/** A pipeline job as the graph sees it: its id, the jobs it needs, and the staging paths it writes. */
export interface Job {
  id: string;
  needs: string[];
  outputs: string[];
}

/** Every job `id` needs, directly or through another job, guarded against cycles. */
export function ancestors(id: string, byId: ReadonlyMap<string, Job>): Set<string> {
  const seen = new Set<string>();
  const visit = (current: string): void => {
    for (const need of byId.get(current)?.needs ?? []) {
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
    const needs = byId.get(id)?.needs ?? [];
    const cycle = needs.reduce<string[] | null>((found, need) => found ?? walk(need, [...path, id]), null);
    done.add(id);
    return cycle;
  };
  return jobs.reduce<string[] | null>((found, { id }) => found ?? walk(id, []), null);
}
