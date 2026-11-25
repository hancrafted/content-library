import type { DebugBase } from './debug-footer.pure';
import type { UiWords } from './human-in-the-loop.types';
import type { DemoProps, ProgressActions, ProgressNote } from './progress-controls.types';
import type { StepKit } from './step-kit.types';
import type { ControlMap } from './toolbar-controls.pure';
import type { StageRun } from './workflow-run.pure';
import type { Level, View } from './workflow-state.pure';
import type { StageView } from './workflow-view.pure';
import type { Workflow } from './workflow.types';

// decision: FE-012 §4
export interface ToolbarProps extends DemoProps {
  readonly workflow: Workflow;
  readonly choices: readonly { readonly id: string; readonly title: string; readonly description?: string }[];
  readonly level: Level;
  readonly view: View;
  readonly locale: 'en' | 'de';
  readonly controls: ControlMap;
  readonly canSave: boolean;
  readonly readonly: boolean;
  readonly uploadProblems: readonly string[];
  readonly note: ProgressNote | null;
  readonly progress: ProgressActions | null;
  readonly debug: { readonly show: boolean; readonly on: boolean };
  readonly words: UiWords;
  readonly onDebug: (debug: boolean) => void;
  readonly onLevel: (level: Level) => void;
  readonly onView: (view: View) => void;
  readonly onWorkflow: (workflowId: string) => void;
  readonly onUpload: (yaml: string) => void;
}

export interface ModalProps extends DemoProps {
  readonly stage: StageView | null;
  readonly run: StageRun | null;
  readonly jobId: string | null;
  readonly round: number | null;
  readonly slotValues: Readonly<Record<string, string>>;
  readonly edits: StepKit['edits'];
  readonly debug: DebugBase | null;
  readonly words: UiWords;
  readonly level: Level;
  readonly onLevel: (level: Level) => void;
  readonly onClose: () => void;
  readonly onSlots: (values: Readonly<Record<string, string>>) => void;
}
