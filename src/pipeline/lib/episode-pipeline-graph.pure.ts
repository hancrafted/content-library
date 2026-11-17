import { waitsFor, type Job } from './episode-pipeline-definition.pure';

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

export function concurrentJobs(jobs: readonly Job[], byId: ReadonlyMap<string, Job>): Set<string> {
  const upstream = new Map(jobs.map(({ id }) => [id, ancestors(id, byId)]));
  const ordered = (a: string, b: string): boolean =>
    (upstream.get(a)?.has(b) ?? false) || (upstream.get(b)?.has(a) ?? false);
  return new Set(
    jobs.filter(({ id }) => jobs.some((other) => other.id !== id && !ordered(id, other.id))).map(({ id }) => id),
  );
}
