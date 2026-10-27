import type { DebugBase } from './debug-footer.pure';
import type { UiWords } from './human-in-the-loop.types';
import type { ProgressActions, ProgressNote, TeachingProps } from './progress-controls.types';
import type { ControlMap } from './toolbar-controls.pure';
import type { StageRun } from './workflow-run.pure';
import type { Level, View } from './workflow-state.pure';
import type { StageView } from './workflow-view.pure';
import type { Workflow } from './workflow.types';

/* The props of the toolbar part and of the modal part (FE-012 §4): each part's own slice of the parent's state. */

/** What the toolbar part draws: the Workflow pills, the Chat · CLI control, download and upload in one pill. */
export interface ToolbarProps extends TeachingProps {
  readonly workflow: Workflow;
  /** Every authored Workflow, for the pills. */
  readonly choices: readonly { readonly id: string; readonly title: string }[];
  readonly level: Level;
  readonly view: View;
  /** The Preset's overrides of the control registry. */
  readonly controls: ControlMap;
  /** A readonly Preset: no Chat · CLI control, since nothing is tried. */
  readonly readonly: boolean;
  readonly uploadProblems: readonly string[];
  readonly note: ProgressNote | null;
  readonly progress: ProgressActions | null;
  /** The Debug switch: drawn only where available (development or `?debug`) and the Preset allows it. */
  readonly debug: { readonly show: boolean; readonly on: boolean };
  readonly words: UiWords;
  readonly onDebug: (debug: boolean) => void;
  readonly onLevel: (level: Level) => void;
  readonly onView: (view: View) => void;
  readonly onWorkflow: (workflowId: string) => void;
  /** The text of a file the viewer chose; the parent validates it with `loadWorkflow`. */
  readonly onUpload: (yaml: string) => void;
}

/** What the modal part draws: the open stage's view (null: closed). */
export interface ModalProps extends TeachingProps {
  readonly stage: StageView | null;
  /** The run of the open stage: job states and rounds. */
  readonly run: StageRun | null;
  /** The job whose card opened the modal: the stepper opens at its first item. */
  readonly jobId: string | null;
  /** The round of a repeated stage the job card was pressed in: the stepper opens at that round's item. */
  readonly round: number | null;
  /** The pasted slot values by marker name, shared by every stage of the Workflow. */
  readonly slotValues: Readonly<Record<string, string>>;
  /** What the copy buttons append a debug footer from; null while debug mode is off. */
  readonly debug: DebugBase | null;
  readonly words: UiWords;
  readonly level: Level;
  readonly onLevel: (level: Level) => void;
  readonly onClose: () => void;
  readonly onSlots: (values: Readonly<Record<string, string>>) => void;
}
