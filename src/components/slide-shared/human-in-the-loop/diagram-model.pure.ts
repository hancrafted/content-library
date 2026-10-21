import { handoffBlocks, parseHandoff } from './handoff.pure';
import { jobsOf } from './workflow-jobs.pure';
import type { Job, Workflow } from './workflow.types';

/*
 * What the diagram reads off a Workflow's data to choose how a job is drawn: no job carries a "kind", so the look
 * follows from its shape (parked pieces, parallel chats, the focal job, an output nobody uses).
 */

export type JobRole = 'pieces' | 'chats' | 'focal' | 'deliverable' | 'ai';

/** A job whose outputs no other job takes in, in the last stage: the thing handed to the boss. */
function isDeliverable(workflow: Workflow, job: Job): boolean {
  const last = workflow.stages.at(-1);
  const taken = jobsOf(workflow.stages).some((other) =>
    other.inputs.some((input) => job.outputs.some((o) => o.id === input)),
  );
  return !!last && last.jobs.includes(job) && !taken;
}

export function jobRole(workflow: Workflow, job: Job): JobRole {
  if (job.parked) return 'pieces';
  if ((job.fanOut ?? 1) > 1) return 'chats';
  if (job.id === workflow.focalJobId) return 'focal';
  return isDeliverable(workflow, job) ? 'deliverable' : 'ai';
}

/** The parked pieces either side of the one taken forward, which sits in the middle. */
export function splitParked(parked: readonly string[]): { before: string[]; after: string[] } {
  const middle = Math.ceil(parked.length / 2);
  return { before: parked.slice(0, middle), after: parked.slice(middle) };
}

/** One name per parallel chat: the title and its number. */
export function chatNames(job: Job): string[] {
  return Array.from({ length: job.fanOut ?? 1 }, (_, i) => `${job.title} ${i + 1}`);
}

/** The requirements of the spec a job's example output returns; none where it returns another kind. */
export function focalCriteria(job: Job): readonly string[] {
  for (const block of handoffBlocks(job.exampleOutput ?? '')) {
    const read = parseHandoff(block);
    if ('handoff' in read && read.handoff.kind === 'spec') return read.handoff.requirements;
  }
  return [];
}
