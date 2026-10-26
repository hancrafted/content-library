import { roundStep } from './workflow-prompts.pure';
import type { JobState, RoundRun, StageRun } from './workflow-run.pure';
import type { JobModalView, StageView } from './workflow-view.pure';

type Steps = JobModalView['task']['steps'];

/** One step of the stepper: a job, with its do prompt and its review prompt; in a repeated stage, one per round. */
export interface Item {
  readonly key: string;
  readonly job: JobModalView;
  readonly doSteps: Steps;
  readonly reviewSteps: Steps;
  /** The round this item plays, titled by its H3. */
  readonly round?: Pick<RoundRun, 'number' | 'title'>;
  /** Where the run says the job stands. */
  readonly state: JobState;
}

const split = (job: JobModalView) => ({
  doSteps: job.task.steps.filter((s) => s.id === 'do'),
  reviewSteps: job.task.steps.filter((s) => s.id === 'review'),
});

function roundItems(job: JobModalView, round: RoundRun, state: JobState): Item {
  const share = { previous: job.task.previous, output: job.task.output, sameStage: job.task.sameStage };
  const { doSteps, reviewSteps } = split(job);
  const make = (step: Steps[number]) => roundStep(step, round, share);
  return {
    key: `${job.id}#${round.number}`,
    job,
    doSteps: doSteps.map(make),
    reviewSteps: reviewSteps.map(make),
    round: { number: round.number, title: round.title },
    state,
  };
}

/** The items of a stage's stepper, in order, each with the state the run gives its job. */
export function itemsOf(stage: StageView, run: StageRun): Item[] {
  const stateOf = (id: string, jobs: StageRun['jobs']): JobState =>
    jobs.find((each) => each.id === id)?.state ?? 'open';
  const items = stage.repeats
    ? run.rounds.flatMap((round) => stage.jobs.map((job) => roundItems(job, round, stateOf(job.id, round.jobs))))
    : stage.jobs.map((job) => ({ key: job.id, job, ...split(job), state: stateOf(job.id, run.jobs) }));
  return items.filter((item) => item.doSteps.length + item.reviewSteps.length > 0);
}

/** The accordion value of the item to open: the first item of the job whose card was pressed, else the first item. */
export function openItemOf(items: readonly Item[], jobId: string | null): string {
  const at = items.findIndex((item) => item.job.id === jobId);
  return String(Math.max(at, 0));
}
