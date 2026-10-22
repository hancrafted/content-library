import { stepsOf, type TaskStep } from './workflow-prompts.pure';
import type { Runtime } from './workflow-schema.types';
import type { Level } from './workflow-state.pure';
import type { Job, Workflow } from './workflow.types';

/*
 * The view seam: what a stage's "Try it" modal shows for a Workflow at a level. Pure, so the modal's information
 * architecture (numbered steps on one side, details on the other) and Simple vs Technical are testable without a
 * browser. It holds no words of its own: every label is the Workflow file's, and the parts bring the chrome words.
 */

export interface ViewOptions {
  readonly level: Level;
}

/** What a task shows: its steps (do, then review), and why, examples and what good looks like. */
export interface TaskModalView {
  readonly steps: readonly TaskStep[];
  readonly why: string;
  /** Markdown handoffs, drawn by the one generic markdown renderer: one, or for a fan-out one per chat. */
  readonly examples: readonly string[];
  readonly goodLooksLike: readonly string[];
}

/** One job inside a stage's modal. */
export interface JobModalView {
  readonly id: string;
  readonly title: string;
  readonly task: TaskModalView;
}

/** A stage's "Try it" modal: its jobs, in order. */
export interface StageView {
  readonly id: string;
  readonly name: string;
  /** The one-line learning goal under the title. */
  readonly goal?: string;
  readonly jobs: readonly JobModalView[];
}

export interface WorkflowView {
  readonly title: string;
  readonly stages: readonly StageView[];
}

function taskView({ task }: Job, workflow: Workflow, level: Level): TaskModalView {
  const runtime: Runtime = level === 'technical' ? 'technical' : 'simple';
  const { example } = task.details;
  return {
    steps: stepsOf(workflow.file, task, runtime),
    why: task.details.why,
    examples: typeof example === 'string' ? [example] : example,
    goodLooksLike: task.details.goodLooksLike,
  };
}

/** The view model of a Workflow for a level: one modal per stage. */
export function workflowView(workflow: Workflow, { level }: ViewOptions): WorkflowView {
  return {
    title: workflow.title,
    stages: workflow.stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      goal: stage.goal,
      jobs: stage.jobs.map((job) => ({ id: job.id, title: job.title, task: taskView(job, workflow, level) })),
    })),
  };
}
