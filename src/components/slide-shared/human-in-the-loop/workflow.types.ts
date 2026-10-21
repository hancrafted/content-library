import type { HandoffKind } from './handoff.pure';

/*
 * The Workflow model: what a Workflow YAML pair loads into (design: issue #266, "Workflow model"). Every word is
 * already resolved for one locale, so a part renders it as it stands. Nothing here executes: no retries, timeouts
 * or conditions.
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

/** The criteria written down before the step, and the prompt that checks a result against them in a fresh chat. */
export interface JobCheck {
  readonly criteria: readonly string[];
  readonly prompt: string;
}

/**
 * One Workflow job: one chat, or `fanOut` parallel chats from one template. `prompt` carries `{{outputId}}` paste
 * slots, one per entry of `inputs`, and ends by asking for fenced `handoff` blocks, one per output.
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
  /** Output ids pasted into this job's prompt slots; each is produced by a job this one depends on, directly or not. */
  readonly inputs: readonly string[];
  readonly outputs: readonly JobOutput[];
  /** N parallel chats from this one template; absent for a single chat. */
  readonly fanOut?: number;
  readonly skills: readonly SkillRef[];
  /** Simple: the long copy-ready prompt. */
  readonly prompt: string;
  /** Technical: the `/skill ...` one-liner; absent when no skill covers the job. */
  readonly command?: string;
  /** Handoff blocks to start from, one per input in input order; absent for a first job. */
  readonly exampleInput?: string;
  /** Handoff blocks the job returns, one per output in output order. */
  readonly exampleOutput?: string;
  readonly check?: JobCheck;
  /** The "Make it a page" prompt, if the result is worth a page. */
  readonly page?: string;
  /** Labels of the other parts of the task, drawn dimmed beside this job (the party's parked pieces). */
  readonly parked?: readonly string[];
}

export interface Stage {
  readonly id: string;
  readonly name: string;
  /** The move's own words, e.g. "Break it down". */
  readonly moveLabel?: string;
  readonly move?: Move;
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
