import type { TargetProps } from '@/lib/context-link.pure';
import type { ReactNode } from 'react';
import type { NodeCopy } from './node-popover.client';
import type { ControlMap } from './toolbar-controls.pure';
import type { Level } from './workflow-state.pure';
import type { StageView } from './workflow-view.pure';
import type { Workflow } from './workflow.types';

/*
 * The part-slot contract (FE-012 §4): the parent owns all state; each part gets its own slice as plain props and
 * sends events up by callbacks. A part never sees the whole state or `dispatch`. Props crossing the server/client
 * boundary are serializable (FE-006): no functions except from the client parent to its client parts.
 */

/** The visual's own labels, one set per locale (human-in-the-loop.config.yml). */
export interface UiWords {
  /** The visible label and accessible name of the Workflow picker: the use case. */
  readonly workflow: string;
  /** The Chat · CLI control: its group name, each segment's label and its tooltip. */
  readonly level: string;
  readonly chat: string;
  readonly chatTip: string;
  readonly cli: string;
  readonly cliTip: string;
  /** The context toggle's name and tooltip: it shows or hides why a task matters, its techniques and an example result. */
  readonly context: string;
  readonly contextTip: string;
  /** The line under the title of a stage's modal. */
  readonly intro: string;
  /** The stepper's sections, and the stepper's buttons. */
  readonly stepN: string;
  readonly stepContext: string;
  readonly stepContextInfo: string;
  readonly stepDo: string;
  readonly stepDoInfo: string;
  readonly stepCheck: string;
  readonly stepCheckInfo: string;
  readonly copyExplanation: string;
  readonly copyExplanationTip: string;
  readonly explainWrapper: string;
  readonly previousResults: string;
  readonly insertedAt: string;
  readonly resultHeading: string;
  readonly resultPlaceholder: string;
  /** The checkbox label of a final job that hands nothing on. */
  readonly markDone: string;
  readonly download: string;
  readonly upload: string;
  /** A stage gate's label on its card, `{n}` its number, where the Slide gives none. */
  readonly gate: string;
  /** The toolbar's accessible name. */
  readonly toolbar: string;
  readonly close: string;
  readonly copied: string;
  /** The button under a stage column, and the modal title (`{stage}` is the stage's name). */
  readonly tryIt: string;
  readonly tryTitle: string;
  /** The hidden suffix of the Try it button that says which stage (`{stage}` is its name). */
  readonly tryFor: string;
  /** The accessible name of a BRIEF letter circle (`{letter}` and `{why}`). */
  readonly moveLabel: string;
  readonly promptLabel: string;
  readonly commandLabel: string;
  readonly copyPrompt: string;
  readonly copyCommand: string;
  readonly openChatgpt: string;
  readonly sectionAbout: string;
  readonly sectionCriteria: string;
  readonly sectionExample: string;
  /** The two steps of a task, a fan-out chat's name (`{n}`), and the heading of why a task matters. */
  readonly doIt: string;
  readonly reviewIt: string;
  readonly chatN: string;
  readonly sectionWhy: string;
  /** The heading of a task's techniques under why it matters, and the names of the two tiers. */
  readonly sectionTechniques: string;
  readonly tierBasic: string;
  readonly tierAdvanced: string;
  /** The two panels of an opened prompt, a slot field's eye toggle tooltips, and the empty field's hint (`{title}`, `{lines}`). */
  readonly whatToDo: string;
  readonly preview: string;
  readonly showFull: string;
  readonly collapse: string;
  readonly sampleHint: string;
  readonly sampleHintOne: string;
  /** A paste-in slot's upload button and its add-entry button. */
  readonly slotUpload: string;
  readonly slotAdd: string;
  readonly newTab: string;
}

/** A Slide's words, laid over the visual's labels key by key. A Workflow has no words to override: it is written in one language. */
export interface WorkflowSlideWords {
  readonly ui?: Partial<UiWords>;
}

/** What a popover says: the title is the name of the stage it explains, which the diagram fills in. */
export type PopoverCopy = Omit<NodeCopy, 'title'>;

/** What a Slide adds to one stage of the diagram, keyed by the stage id. */
export interface StageSlot {
  /** Opens from the stage name; without it the name is plain text. */
  readonly popover?: PopoverCopy;
  /** Beside the stage name, e.g. a Context marker. */
  readonly aside?: ReactNode;
  /** The Slide's `target(name)` for a Speaker note aimed at the stage. */
  readonly target?: TargetProps;
  /** The accessible name of the stage's list of jobs, where it differs from `DiagramSlots.jobsLabel`. */
  readonly jobsLabel?: string;
  /** The word for the stage's gate on a card, e.g. "Gate 2"; the bare number where absent. */
  readonly gateLabel?: string;
}

/** What a Slide adds to one job of the diagram, keyed by the job id. */
export interface JobSlot {
  /** Makes the job's node a button opening this popover, titled with the name of the job's stage. */
  readonly popover?: PopoverCopy;
  /** Replaces the line under the job's title, e.g. to carry a Context marker. */
  readonly detail?: ReactNode;
  /** After the job's gate or sign-off, e.g. a Context marker. */
  readonly marker?: ReactNode;
  /** Under the job, e.g. the button that opens a worked chat. */
  readonly after?: ReactNode;
}

/** What a Slide adds to the diagram: its own words, markers, notes and popovers; every part is optional. */
export interface DiagramSlots {
  /** The accessible name of the whole diagram; the Workflow's title where absent. */
  readonly label?: string;
  /** The accessible name of each stage's list of jobs, with `{stage}` for the stage's name. */
  readonly jobsLabel?: string;
  /** The hidden text on a job checked against its criteria. */
  readonly checked?: string;
  /** Draw the BRIEF letters of each stage as circled capitals; off where the Slide leaves the acronym unnamed. */
  readonly initials?: boolean;
  readonly stages?: Readonly<Record<string, StageSlot>>;
  readonly jobs?: Readonly<Record<string, JobSlot>>;
}

/** What the diagram part draws: the shown Workflow's stages. It reports a press on a stage's "Try it" button. */
export interface DiagramProps {
  readonly workflow: Workflow;
  readonly slots?: DiagramSlots;
  readonly words: UiWords;
  /** Where the stages show no "Try it" button: a readonly Preset. */
  readonly readonly: boolean;
  readonly onOpenStage: (stageId: string) => void;
}

/** What the toolbar part draws: the Workflow pills, the Chat · CLI control, download and upload in one pill. */
export interface ToolbarProps {
  readonly workflow: Workflow;
  /** Every authored Workflow, for the pills. */
  readonly choices: readonly { readonly id: string; readonly title: string }[];
  readonly level: Level;
  /** The Preset's overrides of the control registry. */
  readonly controls: ControlMap;
  /** A readonly Preset: no Chat · CLI control, since nothing is tried. */
  readonly readonly: boolean;
  readonly uploadProblems: readonly string[];
  readonly words: UiWords;
  readonly onLevel: (level: Level) => void;
  readonly onWorkflow: (workflowId: string) => void;
  /** The text of a file the viewer chose; the parent validates it with `loadWorkflow`. */
  readonly onUpload: (yaml: string) => void;
}

/** What the modal part draws: the open stage's view (null: closed). */
export interface ModalProps {
  readonly stage: StageView | null;
  /** The pasted slot values by marker name, shared by every stage of the Workflow. */
  readonly slotValues: Readonly<Record<string, string>>;
  readonly words: UiWords;
  readonly level: Level;
  readonly onLevel: (level: Level) => void;
  readonly onClose: () => void;
  readonly onSlots: (values: Readonly<Record<string, string>>) => void;
}

/** Everything the client parent is given by the server entry: plain and serializable. */
export interface HumanInTheLoopData {
  /** Every authored Workflow of the locale, with the Slide's words laid over the one `workflowId` names. */
  readonly workflows: readonly Workflow[];
  readonly workflowId: string;
  readonly locale: 'en' | 'de';
  readonly words: UiWords;
  readonly controls: ControlMap;
  readonly level: Level;
  /** A readonly Preset hides every "Try it" button and the Chat · CLI control; the diagram stays. */
  readonly readonly: boolean;
  /** The Slide's additions to the diagram. */
  readonly diagram?: DiagramSlots;
}
