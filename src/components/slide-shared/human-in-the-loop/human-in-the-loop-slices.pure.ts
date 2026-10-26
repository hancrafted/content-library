import { progressKeyOf } from '@/lib/progress.pure';
import type {
  DiagramProps,
  HumanInTheLoopData,
  ModalProps,
  ProgressNote,
  ToolbarProps,
} from './human-in-the-loop.types';
import { workflowOf } from './workflow-file-adapter.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { markerValuesOf, resultsOf, runOf } from './workflow-run.pure';
import type { WorkflowEvent, WorkflowState } from './workflow-state.pure';
import type { WorkflowView } from './workflow-view.pure';
import type { Workflow } from './workflow.types';

/*
 * The parent's slicing: which Workflow is shown and what each part gets of the state, as plain props plus callbacks.
 * Pure, so the contract is testable without a browser (FE-012 §4: parts get slices, never the state or `dispatch`).
 */

/** The shown Workflow: an uploaded one wins, then the chosen authored one, then the first. */
export function shownWorkflow(data: HumanInTheLoopData, state: WorkflowState): Workflow | undefined {
  return state.uploaded ?? data.workflows.find((w) => w.id === state.workflowId) ?? data.workflows[0];
}

/** The saved run the shown Workflow belongs to: its key and source hash; none for an uploaded one, which is not kept. */
export function progressTarget(data: HumanInTheLoopData, state: WorkflowState): { key: string; hash: string } | null {
  const id = shownWorkflow(data, state)?.id;
  const hash = id === undefined || state.uploaded ? undefined : data.hashes[id];
  return id !== undefined && hash !== undefined ? { key: progressKeyOf(id), hash } : null;
}

/** What an uploaded file's text becomes: the event that loads it, or the one that reports its problems. */
export function uploadEvent(yaml: string): WorkflowEvent {
  const result = loadWorkflow(yaml);
  return 'problems' in result
    ? { type: 'upload-failed', problems: result.problems }
    : { type: 'upload', workflow: workflowOf(result.file) };
}

/** The callbacks the parts send events up by. */
export type Callbacks = Pick<ToolbarProps, 'onLevel' | 'onWorkflow' | 'onUpload'> &
  Pick<DiagramProps, 'onOpenStage'> &
  Pick<ModalProps, 'onClose' | 'onSlots'>;

/** The callbacks over one dispatch. */
export function callbacksFor(dispatch: (event: WorkflowEvent) => void): Callbacks {
  return {
    onLevel: (level) => dispatch({ type: 'level', level }),
    onWorkflow: (workflowId) => dispatch({ type: 'workflow', workflowId }),
    onUpload: (yaml) => dispatch(uploadEvent(yaml)),
    onOpenStage: (stageId) => dispatch({ type: 'open', stageId }),
    onClose: () => dispatch({ type: 'close' }),
    onSlots: (values) => dispatch({ type: 'slots', values }),
  };
}

/** What the parent knows: the data it was given, its state, the Workflow it shows and that Workflow's view. */
export interface Shown {
  readonly data: HumanInTheLoopData;
  readonly state: WorkflowState;
  readonly workflow: Workflow;
  /** What to tell the viewer about their saved progress, if anything. */
  readonly note: ProgressNote | null;
  /** `workflowView` of the Workflow for the state's level, computed once per change by the parent. */
  readonly view: WorkflowView;
}

export interface Slices {
  readonly toolbar: ToolbarProps;
  readonly diagram: DiagramProps;
  readonly modal: ModalProps;
}

/** Each part's props from what the parent shows: a part gets its own slice of the view, never the whole. */
export function slicesOf(shown: Shown, on: Callbacks): Slices {
  const { data, state, workflow, view } = shown;
  const { words, readonly } = data;
  const toolbar = toolbarOf(shown, on);
  const { file } = workflow;
  const run = runOf(file, { results: state.slotValues, teaching: state.teaching });
  return {
    toolbar,
    diagram: {
      workflow,
      readonly,
      onOpenStage: on.onOpenStage,
      slots: data.diagram,
      words,
    },
    modal: {
      stage: view.stages.find((stage) => stage.id === state.openStageId) ?? null,
      run: run.stages.find((stage) => stage.id === state.openStageId) ?? null,
      slotValues: markerValuesOf(file, state.slotValues),
      words,
      level: state.level,
      onLevel: on.onLevel,
      onClose: on.onClose,
      onSlots: (values) => on.onSlots(resultsOf(file, values)),
    },
  };
}

function toolbarOf({ data, state, workflow, note }: Shown, on: Callbacks): ToolbarProps {
  const choices = data.workflows.map(({ id, title }) => ({ id, title }));
  const { controls, words, readonly } = data;
  const { level, uploadProblems } = state;
  const { onLevel, onWorkflow, onUpload } = on;
  return { workflow, choices, level, controls, readonly, words, uploadProblems, note, onLevel, onWorkflow, onUpload };
}
