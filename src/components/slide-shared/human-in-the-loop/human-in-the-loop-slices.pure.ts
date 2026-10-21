import type { DiagramProps, HumanInTheLoopData, ModalProps, ToolbarProps } from './human-in-the-loop.types';
import type { WorkflowEvent, WorkflowState } from './workflow-state.pure';
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
export type Callbacks = Pick<ToolbarProps, 'onMode' | 'onLevel' | 'onWorkflow' | 'onUpload'> &
  Pick<DiagramProps, 'onOpenJob'> &
  Pick<ModalProps, 'onClose' | 'onTick'>;

/** The callbacks over one dispatch. */
export function callbacksFor(dispatch: (event: WorkflowEvent) => void): Callbacks {
  return {
    onMode: (mode) => dispatch({ type: 'mode', mode }),
    onLevel: (level) => dispatch({ type: 'level', level }),
    onWorkflow: (workflowId) => dispatch({ type: 'workflow', workflowId }),
    onUpload: (yaml) => dispatch(uploadEvent(yaml)),
    onOpenJob: (jobId) => dispatch({ type: 'open', jobId }),
    onClose: () => dispatch({ type: 'close' }),
    onTick: (ticketId) => dispatch({ type: 'tick', ticketId }),
  };
}

/** What the parent knows: the data it was given, its state and the Workflow it shows. */
export interface View {
  readonly data: HumanInTheLoopData;
  readonly state: WorkflowState;
  readonly workflow: Workflow;
}

export interface Slices {
  readonly toolbar: ToolbarProps;
  readonly diagram: DiagramProps;
  readonly modal: ModalProps;
}

/** Each part's props from the data, the state and the shown Workflow. */
export function slicesOf(view: View, on: Callbacks): Slices {
  const { data, state, workflow } = view;
  const { mode, level, openJobId } = state;
  const job = workflow.stages.flatMap((stage) => stage.jobs).find((j) => j.id === openJobId) ?? null;
  const { onMode, onLevel, onWorkflow, onUpload, onOpenJob, onClose, onTick } = on;
  const choices = data.workflows.map(({ id, title }) => ({ id, title }));
  const { controls, words } = data;
  const toolbar = { workflow, choices, mode, level, controls, words, uploadProblems: state.uploadProblems };
  return {
    toolbar: { ...toolbar, onMode, onLevel, onWorkflow, onUpload },
    diagram: { workflow, mode, level, openJobId, onOpenJob, slots: data.diagram, words },
    modal: { workflow, job, mode, level, words, ticked: state.ticked, onClose, onTick },
  };
}
