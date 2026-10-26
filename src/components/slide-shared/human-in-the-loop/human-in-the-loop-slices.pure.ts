import type { DiagramProps, HumanInTheLoopData, ModalProps, ToolbarProps } from './human-in-the-loop.types';
import { workflowOf } from './workflow-file-adapter.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { markerValuesOf, resultsOf, runOf, type Run } from './workflow-run.pure';
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

/** What an uploaded file's text becomes: the event that loads it, or the one that reports its problems. */
export function uploadEvent(yaml: string): WorkflowEvent {
  const result = loadWorkflow(yaml);
  return 'problems' in result
    ? { type: 'upload-failed', problems: result.problems }
    : { type: 'upload', workflow: workflowOf(result.file) };
}

/** The callbacks the parts send events up by. */
export type Callbacks = Pick<ToolbarProps, 'onLevel' | 'onView' | 'onWorkflow' | 'onUpload'> &
  Pick<DiagramProps, 'onOpenStage'> &
  Pick<ModalProps, 'onClose' | 'onSlots'>;

/** The callbacks over one dispatch. */
export function callbacksFor(dispatch: (event: WorkflowEvent) => void): Callbacks {
  return {
    onLevel: (level) => dispatch({ type: 'level', level }),
    onView: (view) => dispatch({ type: 'view', view }),
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
      view: state.view,
      rounds: roundsOf(workflow, run),
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

function toolbarOf({ data, state, workflow }: Shown, on: Callbacks): ToolbarProps {
  const choices = data.workflows.map(({ id, title }) => ({ id, title }));
  const { controls, words, readonly } = data;
  const { level, view, uploadProblems } = state;
  const { onLevel, onView, onWorkflow, onUpload } = on;
  return {
    workflow,
    choices,
    level,
    view,
    controls,
    readonly,
    words,
    uploadProblems,
    onLevel,
    onView,
    onWorkflow,
    onUpload,
  };
}

/** How many rounds each repeated stage draws: the rounds the run holds, else the stage's teaching cap. */
function roundsOf(workflow: Workflow, run: Run): Record<string, number> {
  const counts = workflow.stages.flatMap((stage) => {
    const held = run.stages.find((each) => each.id === stage.id)?.rounds.length ?? 0;
    return stage.foreach ? [[stage.id, held || stage.foreach.teaching] as const] : [];
  });
  return Object.fromEntries(counts);
}
