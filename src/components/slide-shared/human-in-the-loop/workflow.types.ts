import type { HandoffKind } from './handoff.pure';

/*
 * The Workflow model: what a Workflow YAML pair loads into (design: issue #266, "Workflow model"). Every word is
 * already resolved for one locale, so a part renders it as it stands. Nothing here executes: no retries, timeouts
 * or conditions. The types `Stage` and `Job` are the glossary's Workflow stage and Workflow job, never a Run's
 * Stage or Job.
 */

/** The BRIEF move a Workflow stage makes, by its first letter; the initials are highlighted from it. */
export type Move = 'B' | 'R' | 'I' | 'E' | 'F';

/** A Matt Pocock skill, read from `group/name`; its docs live at `https://github.com/mattpocock/skills/tree/main/skills/<group>/<name>`. */
export interface SkillRef {
  readonly group: string;
  readonly name: string;
}

/** What a job hands on: `id` is what a later job lists in `inputs`, `kind` is the handoff kind the example output must parse as. */
export interface JobOutput {
  readonly id: string;
  readonly kind: HandoffKind;
}

/** The first step of a job: one line saying what to do, the complete prompt, and for an interview the short variant. */
export interface JobRun {
  readonly todo: string;
  /** Complete and usable as pasted: a result of an earlier job is inlined as its example handoff, never a `{{slot}}`. */
  readonly prompt: string;
  /** The short grill (the most load-bearing questions per round); interview jobs only. */
  readonly short?: string;
  /** The short variant of the Technical `command`, for the same interview job. */
  readonly shortCommand?: string;
}

/** The "Make it a page" step: Simple asks for one self-contained HTML file; Technical serves a temp file on localhost. */
export interface JobPage {
  readonly todo: string;
  readonly simple: string;
  readonly technical: string;
}

/** The check step: what to do, the criteria written down before the step, and the prompt that checks in a fresh chat. */
export interface JobCheck {
  readonly todo: string;
  readonly criteria: readonly string[];
  readonly prompt: string;
}

/**
 * One Workflow job: one chat, or `fanOut` parallel chats from one template. Its prompts are complete as pasted (an
 * earlier result is inlined as the example handoff) and end by asking for fenced `handoff` blocks, one per output.
 */
export interface Job {
  readonly id: string;
  readonly title: string;
  /** The line under the title on the card, if any. */
  readonly detail?: string;
  readonly description: string;
  /** Whether the job opens a fresh chat or continues the one before. */
  readonly chat: 'new' | 'continue';
  /** Jobs of the same or an earlier stage that must be done first; acyclic. */
  readonly dependsOn: readonly string[];
  /** Output ids this job takes in; each is produced by a job this one depends on, directly or not. */
  readonly inputs: readonly string[];
  readonly outputs: readonly JobOutput[];
  /** N parallel chats from this one template; absent for a single chat. */
  readonly fanOut?: number;
  readonly skills: readonly SkillRef[];
  /** Simple: the copy-ready prompt of the first step. */
  readonly run: JobRun;
  /** Technical: the `/skill ...` one-liner; absent when no skill covers the job. Pasted as written: a slot it has to fill is a bracketed placeholder. */
  readonly command?: string;
  /** Handoff blocks to start from, one per input in input order; absent for a first job. */
  readonly exampleInput?: string;
  /** Handoff blocks the job returns, one per output in output order. */
  readonly exampleOutput?: string;
  readonly check?: JobCheck;
  /** The "Make it a page" step, one prompt per level, if the result is worth a page. */
  readonly page?: JobPage;
  /** Labels of the other parts of the task, drawn dimmed beside this job (the party's parked pieces). */
  readonly parked?: readonly string[];
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
  /** The BRIEF letters this stage applies, in BRIEF order. */
  readonly moves: readonly StageMove[];
  /** The sign-off card, on the stage that holds the focal job. */
  readonly card?: GateCard;
  /** Gate number when a human signs off this stage before the next starts. */
  readonly gate?: number;
  readonly jobs: readonly Job[];
}

export interface Workflow {
  readonly id: string;
  readonly title: string;
  /** The scenario in one sentence. */
  readonly scenario: string;
  /** Technical level only: the one-time setup block. */
  readonly setup?: string;
  /** The job drawn as the bordered focal card. */
  readonly focalJobId?: string;
  readonly stages: readonly Stage[];
}

/** What `loadWorkflow` answers: the Workflow, or every problem found, one sentence each. */
export type LoadResult = { readonly workflow: Workflow } | { readonly problems: readonly string[] };
