import { overOf } from './workflow-foreach.pure';
import { itemsUnder, type Item } from './workflow-run-items.pure';
import type { ForeachDef, StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * The run model: the one seam for progress. From a loaded Workflow file, what the viewer pasted (`results`) and the
 * teaching flag it says every job's state, every repeated stage's rounds and every stage's count. The stepper, the
 * diagram views and the toolbar read from here and never derive progress themselves.
 *
 * Results are one flat map keyed `stage.job`, or `stage.job#k` for round k of a repeated stage. A job that hands on
 * nothing is done when its key holds any text (the checkbox writes `done`). A job's review is checked when the key
 * `stage.job.checked` (`stage.job.checked#k`) holds any text. At CLI level a repeated stage's one orchestrator keeps its
 * result and check under the bare `stage.job` keys, which count for every round.
 */

export type Results = Readonly<Record<string, string>>;

/** `open`: nothing pasted; `done`: its result is in; `checked`: its review was passed too. */
export type JobState = 'open' | 'done' | 'checked';

export interface RunInput {
  readonly results: Results;
  /** Teaching mode takes the first N rounds of a repeated stage; full mode takes every H3 pasted. */
  readonly teaching: boolean;
}

export interface JobRun {
  readonly id: string;
  /** Where the job's result is kept in `results`. */
  readonly key: string;
  readonly state: JobState;
}

/** One round of a repeated stage: the H3 it works on, and the stage's jobs run on it. */
export interface RoundRun {
  /** 1-based; the `k` of `stage.job#k`. */
  readonly number: number;
  readonly title: string;
  /** The H3 section, as `{{item}}` fills it. */
  readonly item: string;
  readonly jobs: readonly JobRun[];
  /** The least advanced state of its jobs. */
  readonly state: JobState;
}

export interface StageRun {
  readonly id: string;
  /** The jobs of a stage that does not repeat; empty for a repeated stage, whose jobs are in its rounds. */
  readonly jobs: readonly JobRun[];
  /** The rounds of a repeated stage; empty otherwise. */
  readonly rounds: readonly RoundRun[];
  /** Jobs (in every round) whose result is in, out of every job to do: "3/5". */
  readonly done: number;
  readonly total: number;
}

export interface Run {
  readonly stages: readonly StageRun[];
  /** Teaching mode may change only while nothing is pasted: the shape of a run never changes under the viewer. */
  readonly canChangeTeaching: boolean;
}

/** The key of a job's result, or of round `round` of it. */
export const resultKey = (stageId: string, jobId: string, round?: number): string =>
  `${stageId}.${jobId}${round === undefined ? '' : `#${round}`}`;

/** The key that marks the job's review passed. */
export const checkedKey = (stageId: string, jobId: string, round?: number): string =>
  `${stageId}.${jobId}.checked${round === undefined ? '' : `#${round}`}`;

/** Whether the viewer put any text under `key`: the one test of "this is set" for results and checked marks alike. */
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

/** The job that hands on `output`, with the stage it belongs to. */
function producerOf(file: WorkflowFile, output: string) {
  return file.stages
    .flatMap((stage) => stage.jobs.map((task) => ({ stage, task })))
    .find(({ task }) => task.output === output);
}

/** The items of the producing job's example, none when it has one per round instead of one text. */
const exampleItems = (task: TaskDef, slug: string): Item[] =>
  typeof task.details.example === 'string' ? itemsUnder(task.details.example, slug) : [];

/** The items a repeated stage takes from the result it repeats over, or from that job's example before any is pasted. */
function itemsOf(file: WorkflowFile, foreach: ForeachDef, input: RunInput): Item[] {
  const over = overOf(foreach);
  const owner = over && producerOf(file, over.output);
  if (!over || !owner) return [];
  const pasted = itemsUnder(input.results[resultKey(owner.stage.id, owner.task.id)] ?? '', over.slug);
  const shown = pasted.length > 0 ? pasted : exampleItems(owner.task, over.slug);
  return input.teaching ? shown.slice(0, foreach.teaching) : shown;
}

function stageRun(file: WorkflowFile, stage: StageDef, input: RunInput): StageRun {
  const { results } = input;
  const items = stage.foreach ? itemsOf(file, stage.foreach, input) : [];
  const rounds = items.map((item, at): RoundRun => {
    const jobs = stage.jobs.map((task) => jobRun(task, { stage: stage.id, round: at + 1 }, results));
    return { number: at + 1, title: item.title, item: item.text, jobs, state: leastOf(jobs) };
  });
  const jobs = stage.foreach ? [] : stage.jobs.map((task) => jobRun(task, { stage: stage.id }, results));
  const all = [...jobs, ...rounds.flatMap((round) => round.jobs)];
  return { id: stage.id, jobs, rounds, done: all.filter((each) => each.state !== 'open').length, total: all.length };
}

/** The rounds each repeated stage plays now, by stage id, as `workflowView` takes them. */
export const roundsOf = (run: Run): Record<string, number> =>
  Object.fromEntries(
    run.stages.filter((stage) => stage.rounds.length > 0).map((stage) => [stage.id, stage.rounds.length]),
  );

/** The run of a Workflow file: every stage's jobs, rounds and count, and whether teaching mode may still change. */
export function runOf(file: WorkflowFile, input: RunInput): Run {
  return {
    stages: file.stages.map((stage) => stageRun(file, stage, input)),
    canChangeTeaching: !Object.keys(input.results).some((key) => filled(input.results, key)),
  };
}

/*
 * The prompts and the context fields name values by marker: `{{plan}}`, `{{look_2}}` (round 2 of the repeated job
 * `look`), `{{final.done}}`. The run keeps them by result key. These two translate a whole map either way; a value
 * that names no job's result (a free input, a review's own field) passes through under its own name.
 */

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

/** The bare marker is the job's one result: of a plain job, or of a repeated job's single CLI orchestrator. */
function keyOf(bindings: readonly Binding[], marker: string): string {
  const plain = bindings.find((each) => each.marker === marker);
  if (plain) return plain.base;
  const round = /^(.*)_(\d+)$/.exec(marker);
  const repeated = bindings.find((each) => each.repeated && each.marker === round?.[1]);
  return repeated ? `${repeated.base}#${round?.[2]}` : marker;
}

/** The results as the prompts' markers name them. */
export function markerValuesOf(file: WorkflowFile, results: Results): Results {
  const bindings = bindingsOf(file);
  return Object.fromEntries(Object.entries(results).map(([key, value]) => [markerOf(bindings, key), value]));
}

/** Values by marker name back to the results map, keyed by result key. */
export function resultsOf(file: WorkflowFile, values: Results): Results {
  const bindings = bindingsOf(file);
  return Object.fromEntries(Object.entries(values).map(([marker, value]) => [keyOf(bindings, marker), value]));
}
