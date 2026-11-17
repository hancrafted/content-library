import { overOf } from './workflow-foreach.pure';
import { isOptionalTask } from './workflow-outputs.pure';
import { itemsUnder, type Item } from './workflow-run-items.pure';
import type { ForeachDef, StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * The run model: the one seam for progress. From a loaded Workflow file, what the viewer pasted (`results`) and the
 * demo flag it says every job's state, every repeated stage's rounds and every stage's count. The stepper, the
 * diagram views and the toolbar read from here and never derive progress themselves.
 *
 * Results are one flat map keyed `stage.job`, or `stage.job#k` for round k of a repeated stage. A job that hands on
 * nothing is done when its key holds any text (the checkbox writes `done`). A job's review is checked when the key
 * `stage.job.checked` (`stage.job.checked#k`) holds any text. At CLI level a repeated stage's one orchestrator keeps its
 * result and check under the bare `stage.job` keys, which count for every round.
 */

export type Results = Readonly<Record<string, string>>;

export type JobState = 'open' | 'done' | 'checked';

export interface RunInput {
  readonly results: Results;
  readonly demo: boolean;
}

export interface JobRun {
  readonly id: string;
  readonly key: string;
  readonly state: JobState;
}

export interface RoundRun {
  readonly number: number;
  readonly title: string;
  readonly item: string;
  readonly jobs: readonly JobRun[];
  readonly state: JobState;
}

export interface StageRun {
  readonly id: string;
  readonly jobs: readonly JobRun[];
  readonly rounds: readonly RoundRun[];
  readonly done: number;
  readonly total: number;
  readonly state: JobState;
}

export interface Run {
  readonly stages: readonly StageRun[];
  /** Demo mode may change only while nothing is pasted: the shape of a run never changes under the viewer. */
  readonly canChangeDemo: boolean;
}

export const resultKey = (stageId: string, jobId: string, round?: number): string =>
  `${stageId}.${jobId}${round === undefined ? '' : `#${round}`}`;

export const checkedKey = (stageId: string, jobId: string, round?: number): string =>
  `${stageId}.${jobId}.checked${round === undefined ? '' : `#${round}`}`;

export const filled = (results: Results, key: string): boolean => (results[key] ?? '').trim() !== '';

/**
 * A round of a repeated stage reads its own key, then the stage's single key: at CLI level one orchestrator runs every
 * round, so its one result and its one check stand for all of them.
 */
const keysFor = (own: string, shared: string, round: number | undefined): string[] =>
  round === undefined ? [own] : [own, shared];

function jobRun(task: TaskDef, at: { stage: string; round?: number }, results: Results): JobRun {
  const key = resultKey(at.stage, task.id, at.round);
  const result = keysFor(key, resultKey(at.stage, task.id), at.round);
  const check = keysFor(checkedKey(at.stage, task.id, at.round), checkedKey(at.stage, task.id), at.round);
  const done = result.some((each) => filled(results, each));
  const checked = done && check.some((each) => filled(results, each));
  if (checked) return { id: task.id, key, state: 'checked' };
  return { id: task.id, key, state: done ? 'done' : 'open' };
}

const RANK: Record<JobState, number> = { open: 0, done: 1, checked: 2 };

const leastOf = (jobs: readonly JobRun[]): JobState =>
  jobs.reduce<JobState>((least, each) => (RANK[each.state] < RANK[least] ? each.state : least), 'checked');

function producerOf(file: WorkflowFile, output: string) {
  return file.stages
    .flatMap((stage) => stage.jobs.map((task) => ({ stage, task })))
    .find(({ task }) => task.output === output);
}

const exampleItems = (task: TaskDef, slug: string): Item[] =>
  typeof task.details.example === 'string' ? itemsUnder(task.details.example, slug) : [];

function itemsOf(file: WorkflowFile, foreach: ForeachDef, input: RunInput): Item[] {
  const over = overOf(foreach);
  const owner = over && producerOf(file, over.output);
  if (!over || !owner) return [];
  const pasted = itemsUnder(input.results[resultKey(owner.stage.id, owner.task.id)] ?? '', over.slug);
  const shown = pasted.length > 0 ? pasted : exampleItems(owner.task, over.slug);
  return input.demo ? shown.slice(0, foreach.demo) : shown;
}

/**
 * The jobs a stage's count and state go by: its required ones. An optional job is left out entirely, so a stage is
 * done without it. In an optional stage every job is optional, so there its own jobs count.
 */
const countedRuns = (stage: StageDef, runs: readonly JobRun[]): readonly JobRun[] => {
  if (stage.optional) return runs;
  const optional = new Set(stage.jobs.filter(isOptionalTask).map((task) => task.id));
  return runs.filter((each) => !optional.has(each.id));
};

function stageRun(file: WorkflowFile, stage: StageDef, input: RunInput): StageRun {
  const { results } = input;
  const items = stage.foreach ? itemsOf(file, stage.foreach, input) : [];
  const rounds = items.map((item, at): RoundRun => {
    const jobs = stage.jobs.map((task) => jobRun(task, { stage: stage.id, round: at + 1 }, results));
    return { number: at + 1, title: item.title, item: item.text, jobs, state: leastOf(countedRuns(stage, jobs)) };
  });
  const jobs = stage.foreach ? [] : stage.jobs.map((task) => jobRun(task, { stage: stage.id }, results));
  const allRuns = [...jobs, ...rounds.flatMap((round) => round.jobs)];
  const counted = countedRuns(stage, allRuns);
  const done = counted.filter((each) => each.state !== 'open').length;
  const state = counted.length > 0 ? leastOf(counted) : 'open';
  return { id: stage.id, jobs, rounds, done, total: counted.length, state };
}

export const roundsOf = (run: Run): Record<string, number> =>
  Object.fromEntries(
    run.stages.filter((stage) => stage.rounds.length > 0).map((stage) => [stage.id, stage.rounds.length]),
  );

export function runOf(file: WorkflowFile, input: RunInput): Run {
  return {
    stages: file.stages.map((stage) => stageRun(file, stage, input)),
    canChangeDemo: !Object.keys(input.results).some((key) => filled(input.results, key)),
  };
}

interface Binding {
  readonly base: string;
  readonly marker: string;
  readonly repeated: boolean;
}

const bindingsOf = (file: WorkflowFile): Binding[] =>
  file.stages.flatMap((stage) =>
    stage.jobs.map((task) => ({
      base: resultKey(stage.id, task.id),
      marker: task.output ?? `${task.id}.done`,
      repeated: stage.foreach !== undefined && task.output !== undefined,
    })),
  );

function markerOf(bindings: readonly Binding[], key: string): string {
  const round = /^(.*)#(\d+)$/.exec(key);
  const found = bindings.find((each) => each.base === (round?.[1] ?? key));
  if (!found) return key;
  if (found.repeated) return round ? `${found.marker}_${round[2]}` : found.marker;
  return round ? key : found.marker;
}

function keyOf(bindings: readonly Binding[], marker: string): string {
  const plain = bindings.find((each) => each.marker === marker);
  if (plain) return plain.base;
  const round = /^(.*)_(\d+)$/.exec(marker);
  const repeated = bindings.find((each) => each.repeated && each.marker === round?.[1]);
  return repeated ? `${repeated.base}#${round?.[2]}` : marker;
}

export function markerValuesOf(file: WorkflowFile, results: Results): Results {
  const bindings = bindingsOf(file);
  return Object.fromEntries(Object.entries(results).map(([key, value]) => [markerOf(bindings, key), value]));
}

export function resultsOf(file: WorkflowFile, values: Results): Results {
  const bindings = bindingsOf(file);
  return Object.fromEntries(Object.entries(values).map(([marker, value]) => [keyOf(bindings, marker), value]));
}
