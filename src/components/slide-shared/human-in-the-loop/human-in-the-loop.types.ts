import type { TargetProps } from '@/lib/context-link.pure';
import type { ReactNode } from 'react';
import type { NodeCopy } from './node-popover.client';
import type { OutputWords } from './outputs/output-words';
import type { Level, Mode } from './workflow-state.pure';
import type { DeepPartial } from './workflow-words.pure';
import type { Job, Workflow } from './workflow.types';

/*
 * The part-slot contract (FE-012 §4): the parent owns all state; each part gets its own slice as plain props and
 * sends events up by callbacks. A part never sees the whole state or `dispatch`. Props crossing the server/client
 * boundary are serializable (FE-006): no functions except from the client parent to its client parts.
 */

/** The visual's own labels, one set per locale (human-in-the-loop.config.yml). */
export interface UiWords {
  readonly modeWatch: string;
  readonly modeTry: string;
  readonly levelSimple: string;
  readonly levelTechnical: string;
  readonly workflow: string;
  readonly close: string;
  readonly copied: string;
  readonly signedOff: string;
  readonly download: string;
  readonly upload: string;
  readonly copyPrompt: string;
  readonly copyCommand: string;
  readonly openChatgpt: string;
  readonly openClaude: string;
  readonly copyExample: string;
  readonly copyCheck: string;
  readonly copyPage: string;
  readonly sectionDoes: string;
  readonly sectionIn: string;
  readonly sectionOut: string;
  readonly sectionCriteria: string;
  readonly sectionSkills: string;
  readonly sectionFullPrompt: string;
  readonly sectionExample: string;
  readonly setup: string;
  readonly newTab: string;
}

/** A Slide's words, laid over the defaults key by key: the visual's labels, and the shown Workflow's words. */
export interface WorkflowSlideWords {
  readonly ui?: Partial<UiWords>;
  /** The shape of a Workflow's `words:` tree; see workflow-words.pure.ts. */
  readonly workflow?: DeepPartial<Record<string, unknown>>;
}

/** Which toolbar controls a Slide's Preset shows; each is on unless the Preset says `false`. */
export interface ToolbarControls {
  readonly picker: boolean;
  readonly download: boolean;
  readonly upload: boolean;
}

/** What a Slide adds to one stage of the diagram, keyed by the stage id. */
export interface StageSlot {
  /** Opens from the stage name; without it the name is plain text. */
  readonly popover?: NodeCopy;
  /** Beside the stage name, e.g. a Context marker. */
  readonly aside?: ReactNode;
  /** The Slide's `target(name)` for a Speaker note aimed at the stage. */
  readonly target?: TargetProps;
  /** The accessible name of the stage's list of jobs. */
  readonly jobsLabel?: string;
  /** The word for the stage's gate on a card, e.g. "Gate 2"; the bare number where absent. */
  readonly gate?: string;
}

/** What a Slide adds to one job of the diagram, keyed by the job id. */
export interface JobSlot {
  /** Makes the job's node a button opening this popover. */
  readonly popover?: NodeCopy;
  /** Replaces the line under the job's title, e.g. to carry a Context marker. */
  readonly detail?: ReactNode;
  /** After the job's gate or sign-off, e.g. a Context marker. */
  readonly marker?: ReactNode;
  /** Under the job, e.g. the button that opens a worked chat. */
  readonly after?: ReactNode;
  /** The focal card's criteria, where the Slide words them differently from the Workflow's spec. */
  readonly criteria?: readonly string[];
}

/** What a Slide adds to the diagram: its own words, markers, notes and popovers; every part is optional. */
export interface DiagramSlots {
  /** The accessible name of the whole diagram; the Workflow's title where absent. */
  readonly label?: string;
  /** The hidden text on a job checked against its criteria. */
  readonly checked?: string;
  /** Bold the first letter of each move, so the moves read as an acronym. The server entry drops it for German. */
  readonly initials?: boolean;
  readonly stages?: Readonly<Record<string, StageSlot>>;
  readonly jobs?: Readonly<Record<string, JobSlot>>;
}

/** What the diagram part draws: the shown Workflow and which job is open. It reports a press on a job card. */
export interface DiagramProps {
  readonly workflow: Workflow;
  readonly slots?: DiagramSlots;
  readonly words: UiWords;
  readonly mode: Mode;
  readonly level: Level;
  readonly openJobId: string | null;
  readonly onOpenJob: (jobId: string) => void;
}

/** What the toolbar part draws: the Watch/Try and Simple/Technical switches, the Workflow picker, upload, download. */
export interface ToolbarProps {
  readonly workflow: Workflow;
  /** Every authored Workflow, for the picker. */
  readonly choices: readonly { readonly id: string; readonly title: string }[];
  readonly mode: Mode;
  readonly level: Level;
  readonly controls: ToolbarControls;
  readonly uploadProblems: readonly string[];
  readonly words: UiWords;
  readonly onMode: (mode: Mode) => void;
  readonly onLevel: (level: Level) => void;
  readonly onWorkflow: (workflowId: string) => void;
  /** The text of a file the viewer chose; the parent validates it with `loadWorkflow`. */
  readonly onUpload: (yaml: string) => void;
}

/** What the modal part draws: the open job (null: closed) with the ticked ticket ids. It reports a close and a tick. */
export interface ModalProps {
  readonly workflow: Workflow;
  readonly job: Job | null;
  readonly mode: Mode;
  readonly level: Level;
  readonly ticked: readonly string[];
  readonly words: UiWords;
  /** The labels of the example result's views. */
  readonly outputWords: OutputWords;
  readonly onClose: () => void;
  readonly onTick: (ticketId: string) => void;
}

/** Everything the client parent is given by the server entry: plain and serializable. */
export interface HumanInTheLoopData {
  /** Every authored Workflow of the locale, with the Slide's words laid over the one `workflowId` names. */
  readonly workflows: readonly Workflow[];
  readonly workflowId: string;
  readonly locale: 'en' | 'de';
  readonly words: UiWords;
  readonly outputWords: OutputWords;
  readonly controls: ToolbarControls;
  readonly mode: Mode;
  readonly level: Level;
  /** The Slide's additions to the diagram. */
  readonly diagram?: DiagramSlots;
}
