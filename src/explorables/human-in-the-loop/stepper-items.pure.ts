import { roundStep } from './workflow-prompts.pure';
import type { JobState, RoundRun, StageRun } from './workflow-run.pure';
import { checkedKey } from './workflow-run.pure';
import type { JobModalView, StageView } from './workflow-view.pure';

type Steps = JobModalView['task']['steps'];

export interface Item {
  readonly key: string;
  readonly job: JobModalView;
  readonly doSteps: Steps;
  readonly reviewSteps: Steps;
  readonly round?: Pick<RoundRun, 'number' | 'title'>;
  readonly state: JobState;
  readonly checkedAs: string;
}

const split = (job: JobModalView) => ({
  doSteps: job.task.steps.filter((s) => s.id === 'do'),
  reviewSteps: job.task.steps.filter((s) => s.id === 'review'),
});

function roundItems(job: JobModalView, round: RoundRun, at: { stage: string; state: JobState }): Item {
  const share = { previous: job.task.previous, output: job.task.output, sameStage: job.task.sameStage };
  const { doSteps, reviewSteps } = split(job);
  const make = (step: Steps[number]) => roundStep(step, round, share);
  return {
    key: `${job.id}#${round.number}`,
    job,
    doSteps: doSteps.map(make),
    reviewSteps: reviewSteps.map(make),
    round: { number: round.number, title: round.title },
    state: at.state,
    checkedAs: checkedKey(at.stage, job.id, round.number),
  };
}

const RANK: Record<JobState, number> = { open: 0, done: 1, checked: 2 };

function sharedState(id: string, run: StageRun): JobState {
  const states = run.rounds.map((round) => round.jobs.find((each) => each.id === id)?.state ?? 'open');
  return states.reduce<JobState>((least, each) => (RANK[each] < RANK[least] ? each : least), states[0] ?? 'open');
}

export function itemsOf(stage: StageView, run: StageRun): Item[] {
  const stateOf = (id: string, jobs: StageRun['jobs']): JobState =>
    jobs.find((each) => each.id === id)?.state ?? sharedState(id, run);
  const items = stage.repeats
    ? run.rounds.flatMap((round) =>
        stage.jobs.map((job) => roundItems(job, round, { stage: stage.id, state: stateOf(job.id, round.jobs) })),
      )
    : stage.jobs.map((job) => ({
        key: job.id,
        job,
        ...split(job),
        state: stateOf(job.id, run.jobs),
        checkedAs: checkedKey(stage.id, job.id),
      }));
  return items.filter((item) => item.doSteps.length + item.reviewSteps.length > 0);
}

export function openItemOf(items: readonly Item[], jobId: string | null, round: number | null = null): string {
  const own = items.findIndex((item) => item.job.id === jobId && item.round?.number === round);
  const at = own >= 0 ? own : items.findIndex((item) => item.job.id === jobId);
  return String(Math.max(at, 0));
}
