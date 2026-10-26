import { producersFor } from './workflow-outputs.pure';
import { stepsOf, type TaskStep } from './workflow-prompts.pure';
import type { Runtime, TaskDef, TechniqueDef } from './workflow-schema.types';
import type { Level } from './workflow-state.pure';
import type { Job, Workflow } from './workflow.types';

/*
 * The view seam: what a stage's "Try it" modal shows for a Workflow at a level. Pure, so the modal's information
 * architecture (numbered steps on one side, details on the other) and Simple vs Technical are testable without a
 * browser. It holds no words of its own: every label is the Workflow file's, and the parts bring the chrome words.
 */

export interface ViewOptions {
  readonly level: Level;
  /** Teaching mode: the limits the prompts name take their teaching values. Default on. */
  readonly teaching?: boolean;
  /** The rounds each repeated stage plays now, by stage id (from the run); a `{{id_*}}` marker expands into as many. */
  readonly rounds?: Readonly<Record<string, number>>;
}

/** What a task shows: its steps (do, then review), and why, examples and what good looks like. */
export interface TaskModalView {
  /** The job's id: a job without an output is marked done under it. */
  readonly id: string;
  readonly steps: readonly TaskStep[];
  /** The name this task hands on: its result is saved under it (`name_K` for round K of a repeated stage). Absent: a checkbox marks it done. */
  readonly output?: string;
  /** The names earlier stages hand on: a slot with one of these ids takes a previous result. */
  readonly previous: readonly string[];
  /** The outputs of the jobs of the same stage this job needs: in a repeated stage each round takes its own. */
  readonly sameStage: readonly string[];
  readonly why: string;
  /** Markdown handoffs, drawn by the one generic markdown renderer: one, or for a repeated stage one per teaching round. */
  readonly examples: readonly string[];
  readonly goodLooksLike: readonly string[];
  /** The techniques the task's structure teaches, from the file's catalogue, shown under "why it matters". */
  readonly techniques: readonly TechniqueDef[];
}

/** One job inside a stage's modal. */
export interface JobModalView {
  readonly id: string;
  readonly title: string;
  /** The one-sentence goal of the do step (the stepper's title) and, when the job has a review, of the review. */
  readonly goal: TaskDef['goal'];
  readonly task: TaskModalView;
}

/** A stage's "Try it" modal: its jobs, in order. */
export interface StageView {
  readonly id: string;
  readonly name: string;
  /** The one-line learning goal under the title. */
  readonly goal?: string;
  /** Whether the stepper plays the jobs once per round: the stage repeats and the level is Simple. */
  readonly repeats: boolean;
  readonly jobs: readonly JobModalView[];
}

export interface WorkflowView {
  readonly title: string;
  readonly stages: readonly StageView[];
}

/** How many entries a `{{id_*}}` over each multiple slot of the job expands into: the larger of the teaching cap and the rounds played. */
function widthsOf(task: TaskDef, workflow: Workflow, at: { stage: number; rounds?: ViewOptions['rounds'] }) {
  const names = producersFor(workflow.file, at.stage, task);
  return new Map(
    task.slots.flatMap((slot): [string, number][] => {
      const producer = slot.mode === 'multiple' ? names.get(slot.id) : undefined;
      if (!producer?.stage.foreach) return [];
      return [[slot.id, Math.max(producer.stage.foreach.teaching, at.rounds?.[producer.stage.id] ?? 0)]];
    }),
  );
}

type TaskAt = { level: Level; stage: number } & Pick<ViewOptions, 'teaching' | 'rounds'>;

function taskView({ task }: Job, workflow: Workflow, at: TaskAt): TaskModalView {
  const { level, stage: stageAt } = at;
  const sameStage = (task.needs ?? []).flatMap(
    (id) => workflow.stages[stageAt]?.jobs.find((job) => job.id === id)?.task.output ?? [],
  );
  const options = { teaching: at.teaching, widths: widthsOf(task, workflow, at) };
  const runtime: Runtime = level === 'technical' ? 'technical' : 'simple';
  const { example } = task.details;
  return {
    id: task.id,
    steps: stepsOf(workflow.file, task, { runtime, ...options }),
    output: task.output,
    sameStage,
    previous: [...producersFor(workflow.file, stageAt, task).keys()],
    why: task.details.why,
    examples: typeof example === 'string' ? [example] : example,
    goodLooksLike: task.details.goodLooksLike,
    techniques: (task.details.techniques ?? []).flatMap((id) =>
      workflow.file.techniques.filter((each) => each.id === id),
    ),
  };
}

/** The view model of a Workflow for a level: one modal per stage. */
export function workflowView(workflow: Workflow, { level, teaching, rounds }: ViewOptions): WorkflowView {
  return {
    title: workflow.title,
    stages: workflow.stages.map((stage, stageAt) => ({
      id: stage.id,
      name: stage.name,
      goal: stage.goal,
      repeats: stage.foreach !== undefined && level === 'simple',
      jobs: stage.jobs.map((job) => ({
        id: job.id,
        title: job.title,
        goal: job.task.goal,
        task: taskView(job, workflow, { level, stage: stageAt, teaching, rounds }),
      })),
    })),
  };
}
