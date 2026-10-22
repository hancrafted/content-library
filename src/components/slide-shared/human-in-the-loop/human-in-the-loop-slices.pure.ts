import type { DiagramProps, HumanInTheLoopData, ModalProps, ToolbarProps } from './human-in-the-loop.types';
import type { WorkflowEvent, WorkflowState } from './workflow-state.pure';
import type { WorkflowView } from './workflow-view.pure';
import { loadWorkflow } from './workflow.pure';
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
  const result = loadWorkflow(yaml, yaml);
  return 'problems' in result
    ? { type: 'upload-failed', problems: result.problems }
    : { type: 'upload', workflow: result.workflow };
}

/** The callbacks the parts send events up by. */
export type Callbacks = Pick<ToolbarProps, 'onLevel' | 'onWorkflow' | 'onUpload'> &
  Pick<DiagramProps, 'onOpenStage'> &
  Pick<ModalProps, 'onClose' | 'onShort' | 'onTick'>;

/** The callbacks over one dispatch. */
export function callbacksFor(dispatch: (event: WorkflowEvent) => void): Callbacks {
  return {
    onLevel: (level) => dispatch({ type: 'level', level }),
    onWorkflow: (workflowId) => dispatch({ type: 'workflow', workflowId }),
    onUpload: (yaml) => dispatch(uploadEvent(yaml)),
    onOpenStage: (stageId) => dispatch({ type: 'open', stageId }),
    onClose: () => dispatch({ type: 'close' }),
    onShort: (jobId) => dispatch({ type: 'short', jobId }),
    onTick: (ticketId) => dispatch({ type: 'tick', ticketId }),
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
  const { words, outputWords, readonly } = data;
  const toolbar = toolbarOf(shown, on);
  return {
    toolbar,
    diagram: {
      workflow,
      readonly,
      openStageId: state.openStageId,
      onOpenStage: on.onOpenStage,
      slots: data.diagram,
      words,
    },
    modal: {
      stage: view.stages.find((stage) => stage.id === state.openStageId) ?? null,
      shortJobIds: state.shortJobIds,
      ticked: state.ticked,
      words,
      outputWords,
      onClose: on.onClose,
      onShort: on.onShort,
      onTick: on.onTick,
    },
  };
}

function toolbarOf({ data, state, workflow }: Shown, on: Callbacks): ToolbarProps {
  const choices = data.workflows.map(({ id, title }) => ({ id, title }));
  const { controls, words, readonly } = data;
  const { level, uploadProblems } = state;
  const { onLevel, onWorkflow, onUpload } = on;
  return { workflow, choices, level, controls, readonly, words, uploadProblems, onLevel, onWorkflow, onUpload };
}
