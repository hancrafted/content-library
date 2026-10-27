import type { DebugBase } from './debug-footer.pure';
import type { UiWords } from './human-in-the-loop.types';
import type { DemoProps, ProgressActions, ProgressNote } from './progress-controls.types';
import type { ControlMap } from './toolbar-controls.pure';
import type { StageRun } from './workflow-run.pure';
import type { Level, View } from './workflow-state.pure';
import type { StageView } from './workflow-view.pure';
import type { Workflow } from './workflow.types';

/* The props of the toolbar part and of the modal part (FE-012 §4): each part's own slice of the parent's state. */

/** What the toolbar part draws: the use case picker, the view, `</>`, Demo mode and Debug toggles, progress and Workflow files in one pill. */
export interface ToolbarProps extends DemoProps {
  readonly workflow: Workflow;
  /** Every authored Workflow, for the pills. */
  readonly choices: readonly { readonly id: string; readonly title: string; readonly description?: string }[];
  readonly level: Level;
  readonly view: View;
  /** The Preset's overrides of the control registry. */
  readonly controls: ControlMap;
  /** The run has work: Save progress shows then (Load always does), as Reset does. */
  readonly canSave: boolean;
  /** A readonly Preset: no `</>` toggle, since nothing is tried. */
  readonly readonly: boolean;
  readonly uploadProblems: readonly string[];
  readonly note: ProgressNote | null;
  readonly progress: ProgressActions | null;
  /** The Debug toggle: drawn only where available (development or `?debug`) and the Preset allows it. */
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
export interface ModalProps extends DemoProps {
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
