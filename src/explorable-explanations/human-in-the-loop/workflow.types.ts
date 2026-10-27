import type { ForeachDef, MoveLetter, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * The Workflow model the diagram draws, made from a loaded Workflow file by `workflowOf`. Every word is already
 * written for one language, so a part renders it as it stands. Nothing here executes: no retries, timeouts or
 * conditions. The types `Stage` and `Job` are the glossary's Workflow stage and Workflow job, never a Run's Stage or
 * Job. The prompts, samples and examples stay in the file (`Workflow.file`, `Job.task`).
 */

/** The BRIEF move a Workflow stage makes, by its first letter; the initials are highlighted from it. */
export type Move = MoveLetter;

/** One Workflow job: one chat, or, in a repeated stage, one chat per round. */
export interface Job {
  readonly id: string;
  readonly title: string;
  /** The line under the title on the card, if any. */
  readonly detail?: string;
  /** Jobs of an earlier stage that must be done first: the producers of this job's slots. */
  readonly dependsOn: readonly string[];
  /** Jobs of the same stage that run first, as the file's `needs` names them; the Detailed view draws them in this order. */
  readonly needs: readonly string[];
  /** The slot ids this job takes in, each an output id of a job it depends on. */
  readonly inputs: readonly string[];
  /** What the job hands on: its output id. */
  readonly outputs: readonly { readonly id: string }[];
  /** Whether the job has a review in a fresh chat; the diagram ticks each chat then. */
  readonly reviewed: boolean;
  /** Labels of the other parts of the task, drawn dimmed beside this job (the party's parked pieces). */
  readonly parked?: readonly string[];
  /** The task of the file this job was made from; the popover renders from it. */
  readonly task: TaskDef;
}

/** One BRIEF letter a stage applies, with the stage's own reason why it applies here (the circle's tooltip). */
export interface StageMove {
  readonly letter: Move;
  readonly why: string;
}

/** The sign-off card of a gate stage: what is signed off, its lines and its status. */
export interface GateCard {
  readonly label: string;
  readonly lines: readonly string[];
  readonly status: string;
}

export interface Stage {
  readonly id: string;
  readonly name: string;
  /** The one-line learning goal under the title of the stage's popover. */
  readonly goal: string;
  /** The Presentation card's text, at most eight words. */
  readonly summary?: string;
  /** The BRIEF letters this stage applies, in BRIEF order. */
  readonly moves: readonly StageMove[];
  /** The sign-off card, on the stage that holds the focal job. */
  readonly card?: GateCard;
  /** Gate number when a human signs off this stage before the next starts. */
  readonly gate?: number;
  /** The stage repeats once per H3 of an earlier output; its jobs run once per round. */
  readonly foreach?: ForeachDef;
  readonly jobs: readonly Job[];
}

export interface Workflow {
  readonly id: string;
  readonly title: string;
  /** The one sentence the use case picker shows under the title; absent for a file that has none. */
  readonly description?: string;
  /** The scenario in one sentence. */
  readonly scenario: string;
  /** The job drawn as the bordered focal card. */
  readonly focalJobId?: string;
  readonly stages: readonly Stage[];
  /** The file this Workflow was made from. */
  readonly file: WorkflowFile;
}
