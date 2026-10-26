import type { JobModalView } from './workflow-view.pure';

type Steps = JobModalView['task']['steps'];

/** One step of the stepper: a job, with its do prompts (a fan-out's chats together) and its review prompts. */
export interface Item {
  readonly key: string;
  readonly job: JobModalView;
  readonly doSteps: Steps;
  readonly reviewSteps: Steps;
}

export function itemsOf(jobs: readonly JobModalView[]): Item[] {
  return jobs
    .map((job) => ({
      key: job.id,
      job,
      doSteps: job.task.steps.filter((s) => s.id === 'do'),
      reviewSteps: job.task.steps.filter((s) => s.id === 'review'),
    }))
    .filter((item) => item.doSteps.length + item.reviewSteps.length > 0);
}
