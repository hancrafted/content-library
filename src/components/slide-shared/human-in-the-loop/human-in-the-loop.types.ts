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

/** What the diagram part draws: the shown Workflow and which job is open. It reports a press on a job card. */
export interface DiagramProps {
  readonly workflow: Workflow;
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
  readonly controls: ToolbarControls;
  readonly mode: Mode;
  readonly level: Level;
}
