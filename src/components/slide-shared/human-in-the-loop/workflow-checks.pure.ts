import { jobGraph, type Job as PipelineJob } from '@/lib/episode-pipeline-definition.pure';
import { ancestors } from '@/lib/episode-pipeline-graph.pure';
import { checkStages } from '@/lib/episode-pipeline-stages.pure';
import { handoffProblems, type HandoffKind } from './handoff.pure';
import { jobsOf } from './workflow-jobs.pure';
import type { Job, Stage } from './workflow.types';

/*
 * The checks of a read Workflow: its graph (reusing the pipeline graph checks), the inputs each prompt pastes, and the
 * examples against their handoff kinds. Each answers one sentence per problem.
 */

/** The pipeline graph checks read a job as a pipeline job: `dependsOn` is its `needs`. */
function asPipelineJobs(stages: readonly Stage[]): PipelineJob[] {
  return stages.flatMap((stage) =>
    stage.jobs.map((job) => ({
      id: job.id,
      stage: stage.id,
      needs: [...job.dependsOn],
      wants: [],
      outputs: [],
      checks: [],
      gate: false,
      retries: 0,
      agents: [],
    })),
  );
}

export interface Graph {
  readonly problems: string[];
  readonly byId: ReadonlyMap<string, PipelineJob>;
}

/** Repeated ids, unknown dependencies, cycles and dependencies on a later stage. */
export function graphProblems(stages: readonly Stage[]): Graph {
  const jobs = asPipelineJobs(stages);
  const graph = jobGraph(jobs);
  const stageIds = stages.map((stage) => stage.id);
  return {
    byId: graph.byId,
    problems: [
      ...graph.duplicates.map((id) => `The job id "${id}" appears twice; job ids are unique.`),
      ...graph.missing.map(({ job, other }) => `Job "${job}" depends on "${other}", which is not a job.`),
      ...(graph.cycle ? [`The jobs depend on each other in a cycle: ${graph.cycle.join(' -> ')}.`] : []),
      ...checkStages(stageIds, jobs),
    ],
  };
}

function producedTwice(jobs: readonly Job[]): string[] {
  const seen = new Set<string>();
  return jobs
    .flatMap((job) => job.outputs.map(({ id }) => id))
    .filter((id) => seen.has(id) || !seen.add(id))
    .map((id) => `The output id "${id}" is produced twice; output ids are unique.`);
}

/** Every prompt text of a job, by the words key it came from. */
function promptTexts(job: Job): [string, string | undefined][] {
  return [
    ['run.prompt', job.run.prompt],
    ['run.short', job.run.short],
    ['run.shortCommand', job.run.shortCommand],
    ['command', job.command],
    ['check.prompt', job.check?.prompt],
    ['page.simple', job.page?.simple],
    ['page.technical', job.page?.technical],
  ];
}

/** A prompt is complete as pasted: an earlier result is inlined, so a `{{slot}}` is a problem. */
function slotProblems(job: Job): string[] {
  return promptTexts(job)
    .filter(([, value]) => value?.includes('{{'))
    .map(([key]) => `The words.${key} of job "${job.id}" holds a {{slot}}; inline the example handoff instead.`);
}

/** The sign-off card, which the focal job's stage must carry. */
export function cardProblems(stages: readonly Stage[], focal: string | undefined): string[] {
  const stage = stages.find((each) => each.jobs.some((job) => job.id === focal));
  return stage && !stage.card ? [`The stage "${stage.id}" holds the focal job but has no card.`] : [];
}

/** Inputs no earlier job produces, outputs produced twice, and prompts that still hold a `{{slot}}`. */
export function inputProblems(stages: readonly Stage[], byId: ReadonlyMap<string, PipelineJob>): string[] {
  const jobs = jobsOf(stages);
  const producer = new Map(jobs.flatMap((job) => job.outputs.map((output): [string, string] => [output.id, job.id])));
  const unfed = jobs.flatMap((job) => {
    const before = ancestors(job.id, byId);
    return job.inputs
      .filter((input) => !before.has(producer.get(input) ?? ''))
      .map((input) => `Job "${job.id}" takes the input "${input}", which no earlier job it depends on produces.`);
  });
  return [...producedTwice(jobs), ...unfed, ...jobs.flatMap(slotProblems)];
}

/** An input a fan-out job produces arrives once per chat, so its example holds that many blocks. */
function arrivals(jobs: readonly Job[]): Map<string, HandoffKind[]> {
  const entries = jobs.flatMap((job) =>
    job.outputs.map((out): [string, HandoffKind[]] => [out.id, Array<HandoffKind>(job.fanOut ?? 1).fill(out.kind)]),
  );
  return new Map(entries);
}

function exampleOf(job: Job, field: 'exampleInput' | 'exampleOutput', expected: readonly HandoffKind[]): string[] {
  const example = job[field];
  return example === undefined
    ? []
    : handoffProblems(example, expected).map((problem) => `Job "${job.id}" ${field}: ${problem}.`);
}

/** Examples that are missing where a job has inputs or outputs, or do not parse as the kinds they stand for. */
export function exampleProblems(stages: readonly Stage[]): string[] {
  const jobs = jobsOf(stages);
  const arrives = arrivals(jobs);
  return jobs.flatMap((job) => [
    ...(job.inputs.length > 0 && !job.exampleInput ? [`Job "${job.id}" takes inputs but has no exampleInput.`] : []),
    ...(job.outputs.length > 0 && !job.exampleOutput ? [`Job "${job.id}" has outputs but no exampleOutput.`] : []),
    ...exampleOf(
      job,
      'exampleInput',
      job.inputs.flatMap((input) => arrives.get(input) ?? []),
    ),
    ...exampleOf(
      job,
      'exampleOutput',
      job.outputs.map((output) => output.kind),
    ),
  ]);
}
