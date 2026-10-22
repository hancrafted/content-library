/*
 * PROPOSAL (issue #281, spec #279): the new Workflow file schema, one language per file. Nothing imports this yet; it
 * replaces `workflow.types.ts` once Han approves the shape. The proposal YAML next to it is the Research stage of
 * summer-party written in this shape. Names carry a `Def` suffix or a distinct noun so they sit beside the old ones.
 */

/** The BRIEF move a stage makes, by its first letter. A move may repeat across stages and may be absent (Review). */
export type MoveLetter = 'B' | 'R' | 'I' | 'E' | 'F';

/** What a prompt section teaches. A typed enum, so a typo fails the loader. */
export const PURPOSES = ['role', 'context', 'task', 'steps', 'template', 'scope'] as const;
export type Purpose = (typeof PURPOSES)[number];

/** The two runtimes: a text-only chat, and a coding harness with skills installed. Each carries a full prompt. */
export const RUNTIMES = ['simple', 'technical'] as const;
export type Runtime = (typeof RUNTIMES)[number];

/** `single` takes one value as `{{id}}`; `multiple` takes `{{id_1}}` … `{{id_N}}`, one input per marker, plus button capped at N. */
export type SlotMode = 'single' | 'multiple';

/**
 * Markers a section's `text` may hold:
 * - `{{<slot id>}}` and `{{<slot id>_K}}`: a slot's value, or the Kth entry of a `multiple` slot;
 * - `{{n}}`: the index of a fan-out chat (1…fanOut);
 * - `{{template}}`: the task's handoff template;
 * and in `reviewer` sections only:
 * - `{{checks}}`: the task's tailored checks; `{{inputs}}`: the task's review slots, each under its label.
 * An unknown marker is a load problem.
 */
export const BUILT_IN_MARKERS = ['n', 'template'] as const;
export const REVIEWER_MARKERS = ['checks', 'inputs'] as const;

/** One part of a prompt: rendered as an H2, joined into one markdown prompt. */
export interface SectionDef {
  readonly heading: string;
  /** Absent: no marker and no tooltip on this section. */
  readonly purpose?: Purpose;
  /** Overrides the top-level explanation of `purpose` for this section only. */
  readonly explain?: string;
  /** Markdown with markers. General instructions only: scenario facts arrive through slots, never written here. */
  readonly text: string;
}

/** A paste-in input. Empty at run time: `sample` stays. `sample` is a markdown handoff of the producing task's template. */
export interface SlotDef {
  readonly id: string;
  readonly mode: SlotMode;
  readonly label: string;
  /**
   * Required on a `do` slot; a review slot's sample is optional. Checked against the template `kind` and its H2s.
   * A `multiple` slot carries a list, one sample per entry in marker order, as many as it has markers; a `single`
   * slot carries one.
   */
  readonly sample?: string | readonly string[];
  /** A free input: the user's own text (the task), not an earlier task's output, so it names no output and its sample is plain text. */
  readonly free?: boolean;
}

/** The optional "Review it" pair of a task: runs in a fresh chat, only reports, then writes a fix handoff for the first chat. */
export interface ReviewDef {
  /** What the reviewer is handed: the result under review, plus whatever it must be checked against. Ids are unique across the file. */
  readonly slots: readonly SlotDef[];
  /** Tailored layer, joined with the general `reviewer` sections through `{{checks}}`. */
  readonly checks: readonly string[];
  /** One or two plain sentences on what the user does in this step, e.g. "Open a fresh chat and paste the prompt." */
  readonly instructions?: string;
}

/** The right column of the popover, for the task in focus. */
export interface DetailsDef {
  readonly why: string;
  /** A markdown handoff of the task's template; a fan-out task has one per chat, in chat order. */
  readonly example: string | readonly string[];
  readonly goodLooksLike: readonly string[];
}

export interface TaskDef {
  readonly id: string;
  readonly title: string;
  /** The id this task hands on; a later slot with this id takes it. A fan-out `x` hands on `x_1` … `x_N`. */
  readonly output: string;
  /** Key into `templates`; shared by the do prompt, the reviewer and the loader. */
  readonly template: string;
  /** Each `id` names the `output` of a task in an earlier stage (or `x_K` of a fan-out). */
  readonly slots: readonly SlotDef[];
  /** N parallel chats from this one template; absent for a single chat. */
  readonly fanOut?: number;
  /** One or two plain sentences on what the user does in the do step; shown above the slots in the popover. */
  readonly instructions?: string;
  readonly do: Readonly<Record<Runtime, readonly SectionDef[]>>;
  readonly review?: ReviewDef;
  readonly details: DetailsDef;
}

/** The sign-off card of a gate stage. */
export interface CardDef {
  readonly label: string;
  readonly lines: readonly string[];
  readonly status: string;
}

export interface StageDef {
  readonly id: string;
  readonly title: string;
  /** One line under the popover title. */
  readonly learningGoal: string;
  readonly move?: MoveLetter;
  readonly gate?: number;
  readonly card?: CardDef;
  readonly tasks: readonly TaskDef[];
}

export interface ScenarioDef {
  readonly summary: string;
  /** The scenario facts, in one place; prompts reach them only through slot samples. */
  readonly facts: readonly string[];
}

/** The whole Workflow file: written in one language, rendered as written. */
export interface WorkflowFile {
  readonly id: string;
  readonly title: string;
  readonly scenario: ScenarioDef;
  /** One explanation per purpose, written once; a section may override it with `explain`. */
  readonly purposes: Readonly<Record<Purpose, string>>;
  /** The general reviewer, written once and joined with every task's tailored checks. */
  readonly reviewer: { readonly sections: readonly SectionDef[] };
  /** Markdown handoff templates by kind: front matter `kind`, an H1, required H2 sections. No `{{…}}` inside. */
  readonly templates: Readonly<Record<string, string>>;
  readonly stages: readonly StageDef[];
}
