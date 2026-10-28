import type { ChatMarkName } from '@/shared/components/core-components/chat-icons/chat-marks.pure';

/*
 * The Workflow file schema, one language per file: what `loadWorkflow` returns once the shape and the meaning of a
 * file hold. Names carry a `Def` suffix or a distinct noun so they sit beside the diagram model (`workflow.types.ts`).
 */

/** The BRIEF move a stage makes, by its first letter. A move may repeat across stages and may be absent (Review). */
export type MoveLetter = 'B' | 'R' | 'I' | 'E' | 'F';

/** What a prompt section teaches. A typed enum, so a typo fails the loader. */
export const PURPOSES = ['role', 'context', 'task', 'steps', 'template', 'scope'] as const;
export type Purpose = (typeof PURPOSES)[number];

/** How hard a prompt technique is to pick up: the few every prompt should use, and the ones that come with practice. */
export const TIERS = ['basic', 'advanced'] as const;
export type Tier = (typeof TIERS)[number];

/**
 * One prompt technique of the catalogue. The catalogue is data, written once at the top of a Workflow file: adding a
 * technique is a new entry, never a schema change. Sections and tasks name techniques by `id`.
 */
export interface TechniqueDef {
  readonly id: string;
  readonly tier: Tier;
  readonly title: string;
  /** One or two plain sentences on what the technique is and why it helps. */
  readonly explain: string;
}

/** The two runtimes: a text-only chat, and a coding harness with skills installed. Each carries a full prompt. */
export const RUNTIMES = ['simple', 'technical'] as const;
export type Runtime = (typeof RUNTIMES)[number];

/** `single` takes one value as `{{id}}`; `multiple` takes `{{id_1}}` … `{{id_N}}`, one input per marker, plus button capped at N. */
export type SlotMode = 'single' | 'multiple';

/**
 * Markers a section's `text` may hold:
 * - `{{<slot id>}}` and `{{<slot id>_K}}`: a slot's value, or the Kth entry of a `multiple` slot;
 * - `{{item}}`: in a repeated stage, the H3 section the round works on (also in the job's review `checks`);
 * - `{{limit.<name>}}`: a number the job declares under `limits`, its full value or, in demo mode, its demo one;
 * - `{{<slot id>_*}}`: every marker of a `multiple` slot, one per round, joined by a rule (the whole run, however many rounds);
 * - `{{template}}`: the task's handoff template;
 * and in `reviewer` sections only:
 * - `{{checks}}`: the task's tailored checks; `{{inputs}}`: the task's review slots, each under its label.
 * An unknown marker is a load problem.
 */
export const BUILT_IN_MARKERS = ['item', 'template'] as const;
export const REVIEWER_MARKERS = ['checks', 'inputs'] as const;

/** The two modes of a run: demo mode keeps it short, a full run plays every round. */
export const MODES = ['demo', 'full'] as const;
export type Mode = (typeof MODES)[number];

/** One part of a prompt: rendered as an H2, joined into one markdown prompt. */
export interface SectionDef {
  readonly heading: string;
  /** Absent: the section shows in both modes. Marked `demo`, it shows only in demo mode; `full`, only in a full run. */
  readonly only?: Mode;
  /** Absent: no marker and no tooltip on this section. */
  readonly purpose?: Purpose;
  /** Overrides the top-level explanation of `purpose` for this section only. */
  readonly explain?: string;
  /** Ids from the `techniques` catalogue that this section applies; its tooltip lists them with their tier. */
  readonly techniques?: readonly string[];
  /** Markdown with markers. General instructions only: scenario facts arrive through slots, never written here. */
  readonly text: string;
}

/** A paste-in input. Empty at run time: `sample` stays. `sample` is a markdown handoff of the producing task's template. */
export interface SlotDef {
  readonly id: string;
  readonly mode: SlotMode;
  readonly label: string;
  /**
   * Required on a `do` slot; a review slot's sample is optional. Checked against its template's H2s.
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
  /** A markdown handoff of the task's template; a job of a repeated stage has one per demo round, in round order. */
  readonly example: string | readonly string[];
  readonly goodLooksLike: readonly string[];
  /** Ids from the `techniques` catalogue that the task's structure teaches; shown under "why it matters". */
  readonly techniques?: readonly string[];
}

/** A number a prompt names, such as how many questions a grill may ask: one value for a full run, one for demo mode. */
export interface LimitDef {
  readonly full: number;
  readonly demo: number;
}

/** One button that opens an empty AI chat in a new tab, for the prompt to be pasted into. */
export interface ChatButtonDef {
  readonly label: string;
  /** An `https://` link to a new, empty chat; it never carries the prompt. */
  readonly url: string;
  /** The chat tool's mark shown before the label (`chatgpt`, `gemini`); `null` or absent: the label alone. */
  readonly icon?: ChatMarkName | null;
}

export interface TaskDef {
  readonly id: string;
  /** The job's bold name on the diagram, and its heading in a stage's modal. */
  readonly title: string;
  /** One short line under the title on the diagram: what the job does, so the diagram reads at rest. */
  readonly summary?: string;
  /** The one-sentence goal of each step, shown as the stepper's title. `review` is required exactly when the job has a review. */
  readonly goal: { readonly do: string; readonly review?: string };
  /** Ids of jobs of the same stage that run first; a slot may take their outputs. Without it, slots take earlier stages' outputs only. */
  readonly needs?: readonly string[];
  /**
   * The id this task hands on; a later slot with this id takes it. A job of a repeated stage hands on `x_1` … `x_N`, one per demo round. Absent only on
   * the final job of the last stage, which the viewer marks done with a checkbox.
   */
  readonly output?: string;
  /** Key into `templates`; shared by the do prompt, the reviewer and the loader. */
  readonly template: string;
  /** Each `id` names the `output` of a task in an earlier stage (or `x_K` of a repeated stage). */
  readonly slots: readonly SlotDef[];
  /** One or two plain sentences on what the user does in the do step; shown above the slots in the popover. */
  readonly instructions?: string;
  readonly do: Readonly<Record<Runtime, readonly SectionDef[]>>;
  readonly review?: ReviewDef;
  /** Named numbers the prompts and checks of this job take as `{{limit.<name>}}`: every demo cap sits here, next to its full value. */
  readonly limits?: Readonly<Record<string, LimitDef>>;
  /** The AI chats this job's prompts open in, overriding the visual's default buttons: a page job names Gemini alone. */
  readonly openAIButtons?: readonly ChatButtonDef[];
  readonly details: DetailsDef;
}

/** The sign-off card of a gate stage. */
export interface CardDef {
  readonly label: string;
  readonly lines: readonly string[];
  readonly status: string;
}

/** What a repeated stage repeats over, and how many rounds demo mode keeps. */
export interface ForeachDef {
  /** `<output>#<h2 slug>`: the output of an earlier job and the slug of an H2 of its template; each H3 under it is a round. */
  readonly over: string;
  /** Demo mode takes the first N H3s, in document order; the example results cover these rounds only. */
  readonly demo: number;
  /** What one round is called in this file's language (`epic`): the Detailed bracket reads "× each epic (2)". Absent: "round". */
  readonly item?: string;
}

export interface StageDef {
  readonly id: string;
  readonly title: string;
  /** One line under the popover title. */
  readonly learningGoal: string;
  /** The Stages card's text, at most eight words. */
  readonly summary?: string;
  /** The stage repeats: one round per H3 under an H2 of an earlier output; the jobs of the stage run once per round. */
  readonly foreach?: ForeachDef;
  readonly move?: MoveLetter;
  readonly gate?: number;
  readonly card?: CardDef;
  readonly jobs: readonly TaskDef[];
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
  /** One sentence, written for the use case picker: it sits under the title there. Optional: an uploaded file may lack it. */
  readonly description?: string;
  readonly scenario: ScenarioDef;
  /** One explanation per purpose, written once; a section may override it with `explain`. */
  readonly purposes: Readonly<Record<Purpose, string>>;
  /** The prompt techniques sections and tasks may name, defined once here. */
  readonly techniques: readonly TechniqueDef[];
  /** The general reviewer, written once and joined with every task's tailored checks. */
  readonly reviewer: { readonly sections: readonly SectionDef[] };
  /** Markdown handoff templates by key: an H1 and the required H2 sections, no front matter. No `{{…}}` inside. */
  readonly templates: Readonly<Record<string, string>>;
  readonly stages: readonly StageDef[];
}
