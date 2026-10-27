import { readProgressFile, type Refusal } from '@/shared/lib/progress-file.pure';
import { progressKeyOf } from '@/shared/lib/progress.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import type { DebugBase } from './debug-footer.pure';
import type { DiagramProps, HumanInTheLoopData, UiWords } from './human-in-the-loop.types';
import type { ModalProps, ToolbarProps } from './part-props.types';
import type { ProgressActions, ProgressNote, TeachingProps, TeachingState } from './progress-controls.types';
import { offers } from './toolbar-controls.pure';
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

/** The saved run the shown Workflow belongs to: its id, key and source hash; none for an uploaded one, which is not kept. */
export function progressTarget(
  data: HumanInTheLoopData,
  state: WorkflowState,
): { id: string; key: string; hash: string } | null {
  const id = shownWorkflow(data, state)?.id;
  const hash = id === undefined || state.uploaded ? undefined : data.hashes[id];
  return id !== undefined && hash !== undefined ? { id, key: progressKeyOf(id), hash } : null;
}

const REFUSALS: Record<Refusal, 'refuseUnreadable' | 'refuseOtherWorkflow' | 'refuseChanged'> = {
  unreadable: 'refuseUnreadable',
  'other-workflow': 'refuseOtherWorkflow',
  changed: 'refuseChanged',
};

/** What an uploaded progress file becomes: the run restored, or a refusal naming the shown Workflow by its title. */
export function progressUploadEvent(
  text: string,
  shown: { readonly id: string; readonly hash: string; readonly title: string },
  words: UiWords,
): WorkflowEvent {
  const read = readProgressFile(text, { workflow: shown.id, hash: shown.hash });
  if ('entry' in read) return { type: 'restore', results: read.entry.results, teaching: read.entry.teaching };
  return { type: 'upload-failed', problems: [fillTemplate(words[REFUSALS[read.refusal]], { workflow: shown.title })] };
}

/** What an uploaded file's text becomes: the event that loads it, or the one that reports its problems. */
export function uploadEvent(yaml: string): WorkflowEvent {
  const result = loadWorkflow(yaml);
  return 'problems' in result
    ? { type: 'upload-failed', problems: result.problems }
    : { type: 'upload', workflow: workflowOf(result.file) };
}

/** The callbacks the parts send events up by. */
export type Callbacks = Pick<
  ToolbarProps,
  'onLevel' | 'onView' | 'onWorkflow' | 'onUpload' | 'onTeaching' | 'onReset' | 'onDebug'
> &
  Pick<DiagramProps, 'onOpenStage'> &
  Pick<ModalProps, 'onClose' | 'onSlots'>;

/** The callbacks over one dispatch. */
export function callbacksFor(dispatch: (event: WorkflowEvent) => void): Callbacks {
  return {
    onLevel: (level) => dispatch({ type: 'level', level }),
    onView: (view) => dispatch({ type: 'view', view }),
    onWorkflow: (workflowId) => dispatch({ type: 'workflow', workflowId }),
    onTeaching: (teaching) => dispatch({ type: 'teaching', teaching }),
    onReset: () => dispatch({ type: 'reset' }),
    onDebug: (debug) => dispatch({ type: 'debug', debug }),
    onUpload: (yaml) => dispatch(uploadEvent(yaml)),
    onOpenStage: (stageId, jobId, round) =>
      dispatch({ type: 'open', stageId, ...(jobId !== undefined && { jobId }), ...(round !== undefined && { round }) }),
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
  /** Save and load of the run; none for an uploaded Workflow. */
  readonly progress: ProgressActions | null;
  /** `workflowView` of the Workflow for the state's level, computed once per change by the parent. */
  readonly view: WorkflowView;
  /** Whether the Debug switch may show: development or `?debug`, known only on the client after mount. */
  readonly debugAvailable: boolean;
}

export interface Slices {
  readonly toolbar: ToolbarProps;
  readonly diagram: DiagramProps;
  readonly modal: ModalProps;
}

/** Each part's props from what the parent shows: a part gets its own slice of the view, never the whole. */
export function slicesOf(shown: Shown, on: Callbacks): Slices {
  const { state, workflow } = shown;
  const { file } = workflow;
  const run = runOf(file, { results: state.slotValues, teaching: state.teaching });
  const teachingProps = teachingPropsOf(shown, run.canChangeTeaching, on);
  const toolbar = toolbarOf(shown, on, teachingProps);
  return {
    toolbar,
    diagram: diagramOf(shown, on, run),
    modal: modalOf(shown, on, { run, teaching: teachingProps }),
  };
}

/** The teaching switch and Reset for both places that hold them: the toolbar and the popover. */
function teachingPropsOf({ data, state, progress }: Shown, canChange: boolean, on: Callbacks): TeachingProps {
  const { controls, readonly } = data;
  const teaching: TeachingState = {
    show: offers(controls, 'teaching', readonly),
    resetShow: offers(controls, 'reset', readonly),
    on: state.teaching,
    locked: !canChange,
    hasWork: !canChange,
  };
  return { teaching, onTeaching: on.onTeaching, onReset: on.onReset, onDownloadRun: progress?.onDownload };
}

function diagramOf({ data, state, workflow }: Shown, on: Callbacks, run: Run): DiagramProps {
  return {
    workflow,
    readonly: data.readonly,
    onOpenStage: on.onOpenStage,
    view: state.view,
    rounds: roundsOf(workflow, run),
    run,
    slots: data.diagram,
    words: data.words,
  };
}

function toolbarOf(
  { data, state, workflow, note, progress, debugAvailable }: Shown,
  on: Callbacks,
  teaching: TeachingProps,
): ToolbarProps {
  const choices = data.workflows.map(({ id, title }) => ({ id, title }));
  const { controls, words, readonly } = data;
  const { level, view, uploadProblems } = state;
  const { onLevel, onView, onWorkflow, onUpload, onDebug } = on;
  const debug = { show: debugAvailable && offers(controls, 'debug', readonly), on: state.debug };
  return {
    ...teaching,
    workflow,
    choices,
    level,
    view,
    controls,
    readonly,
    words,
    uploadProblems,
    note,
    progress,
    debug,
    onDebug,
    onLevel,
    onView,
    onWorkflow,
    onUpload,
  };
}

/** What every debug footer of the shown Workflow shares; the source is the short hash of its file pair, or `uploaded`. */
function debugBase({ data, state, workflow }: Pick<Shown, 'data' | 'state' | 'workflow'>): DebugBase {
  const hash = state.uploaded ? undefined : data.hashes[workflow.id];
  return {
    workflow: { id: workflow.id, title: workflow.title },
    level: state.level,
    teaching: state.teaching,
    locale: data.locale,
    source: hash?.slice(0, 8) ?? 'uploaded',
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

function modalOf(
  { data, state, workflow, view, debugAvailable }: Shown,
  on: Callbacks,
  { run, teaching }: { readonly run: Run; readonly teaching: TeachingProps },
): ModalProps {
  const { file } = workflow;
  return {
    stage: view.stages.find((stage) => stage.id === state.openStageId) ?? null,
    run: run.stages.find((stage) => stage.id === state.openStageId) ?? null,
    jobId: state.openJobId,
    round: state.openRound,
    slotValues: markerValuesOf(file, state.slotValues),
    debug: state.debug && debugAvailable ? debugBase({ data, state, workflow }) : null,
    words: data.words,
    level: state.level,
    onLevel: on.onLevel,
    onClose: on.onClose,
    onSlots: (values) => on.onSlots(resultsOf(file, values)),
    ...teaching,
  };
}
