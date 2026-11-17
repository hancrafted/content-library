// decision: docs/decision-records/0008-pipeline-jobs-belong-to-stages.md
import type { Job } from './episode-pipeline-definition.pure';
import { repeated } from './finding.pure';

export function checkStages(stages: readonly string[], jobs: readonly Job[]): string[] {
  const position = new Map(stages.map((stage, at) => [stage, at]));
  const byId = new Map(jobs.map((job) => [job.id, job]));
  return [
    ...repeated(stages).map((stage) => `The stage "${stage}" appears twice in stages; stage ids are unique.`),
    ...jobs
      .filter(({ stage }) => stage !== undefined && !position.has(stage))
      .map(({ id, stage }) => `Job "${id}" has stage "${stage}", which stages does not list.`),
    ...jobs.flatMap((job) => laterWaits(job, byId, position)),
  ];
}

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
