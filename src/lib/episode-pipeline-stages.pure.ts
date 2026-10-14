/*
 * The stages of a new-episode pipeline: the top-level `stages` list fixes their order, and each job names the one it
 * belongs to in `stage` (design-ADR 0008). A job waits only for jobs of its own or an earlier stage, so the stages
 * read left to right as the run moves. A stage may hold no job: a per-run pipeline whose retrieval reuses every
 * research file has an empty Research stage. Whether `stages` and `stage` are present and of the right type is the
 * field check's finding; this checks what they say.
 */

import type { Job } from './episode-pipeline-jobs.pure';

export function checkStages(stages: readonly string[], jobs: readonly Job[]): string[] {
  const position = new Map(stages.map((stage) => [stage, stages.indexOf(stage)]));
  const byId = new Map(jobs.map((job) => [job.id, job]));
  const duplicates = [...new Set(stages.filter((stage, at) => stages.indexOf(stage) !== at))];
  return [
    ...duplicates.map((stage) => `The stage "${stage}" appears twice in stages; stage ids are unique.`),
    ...jobs
      .filter(({ stage }) => stage !== undefined && !position.has(stage))
      .map(({ id, stage }) => `Job "${id}" has stage "${stage}", which stages does not list.`),
    ...jobs.flatMap((job) => laterWaits(job, byId, position)),
  ];
}

/** Each job `job` needs or wants that belongs to a later stage than its own. */
function laterWaits(job: Job, byId: ReadonlyMap<string, Job>, position: ReadonlyMap<string, number>): string[] {
  const own = job.stage === undefined ? undefined : position.get(job.stage);
  if (own === undefined) return [];
  return (['needs', 'wants'] as const).flatMap((edge) =>
    job[edge].flatMap((other) => {
      const stage = byId.get(other)?.stage;
      const at = stage === undefined ? undefined : position.get(stage);
      return at === undefined || at <= own
        ? []
        : [
            `Job "${job.id}" of stage "${job.stage}" ${edge} "${other}", a job of the later stage "${stage}"; a job waits only for jobs of its own or an earlier stage.`,
          ];
    }),
  );
}
