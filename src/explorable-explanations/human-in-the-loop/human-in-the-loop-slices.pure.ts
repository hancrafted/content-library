import { readProgressFile, type Refusal } from '@/shared/lib/progress-file.pure';
import { progressKeyOf } from '@/shared/lib/progress.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import type { DebugBase } from './debug-footer.pure';
import type { DiagramProps, HumanInTheLoopData, UiWords } from './human-in-the-loop.types';
import type { ModalProps, ToolbarProps } from './part-props.types';
import type { DemoProps, DemoState, ProgressActions, ProgressNote } from './progress-controls.types';
import { offers } from './toolbar-controls.pure';
import { workflowOf } from './workflow-file-adapter.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { markerValuesOf, roundsOf as playedRounds, resultsOf, runOf, type Run } from './workflow-run.pure';
import type { WorkflowEvent, WorkflowState } from './workflow-state.pure';
import { workflowView, type WorkflowView } from './workflow-view.pure';
import type { Workflow } from './workflow.types';

/*
 * The parent's slicing: which Workflow is shown and what each part gets of the state, as plain props plus callbacks.
 * Pure, so the contract is testable without a browser (FE-012 §4: parts get slices, never the state or `dispatch`).
 */

/** The shown Workflow: an uploaded one wins, then the chosen authored one, then the first. */
export function shownWorkflow(
  data: HumanInTheLoopData,
  state: Pick<WorkflowState, 'uploaded' | 'workflowId'>,
): Workflow | undefined {
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
  if ('entry' in read) return { type: 'restore', results: read.entry.results, demo: read.entry.demo };
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
  'onLevel' | 'onView' | 'onWorkflow' | 'onUpload' | 'onDemo' | 'onReset' | 'onDebug'
> &
  Pick<DiagramProps, 'onOpenStage'> &
  Pick<ModalProps, 'onClose' | 'onSlots'>;

/** The callbacks over one dispatch. */
export function callbacksFor(dispatch: (event: WorkflowEvent) => void): Callbacks {
  return {
    onLevel: (level) => dispatch({ type: 'level', level }),
    onView: (view) => dispatch({ type: 'view', view }),
    onWorkflow: (workflowId) => dispatch({ type: 'workflow', workflowId }),
    onDemo: (demo) => dispatch({ type: 'demo', demo }),
    onReset: () => dispatch({ type: 'reset' }),
    onDebug: (debug) => dispatch({ type: 'debug', debug }),
    onUpload: (yaml) => dispatch(uploadEvent(yaml)),
    onOpenStage: (stageId, jobId, round) =>
      dispatch({ type: 'open', stageId, ...(jobId !== undefined && { jobId }), ...(round !== undefined && { round }) }),
    onClose: () => dispatch({ type: 'close' }),
    onSlots: (values) => dispatch({ type: 'slots', values }),
  };
}

/** What is computed of the shown Workflow and the state: one run, and everything the parts show of it. */
export interface WorkflowShown {
  readonly workflow: Workflow;
  /** The run of the pasted results, computed once. */
  readonly run: Run;
  /** `workflowView` of the Workflow for the state's level, widths taken from the run. */
  readonly view: WorkflowView;
  /** The rounds each repeated stage plays now: only stages whose run holds rounds. The view widens these to the demo cap. */
  readonly played: Readonly<Record<string, number>>;
  /** The rounds each repeated stage draws: the rounds played, else the stage's demo cap, so an empty stage still shows its cards. */
  readonly drawn: Readonly<Record<string, number>>;
}

/** What `showWorkflow` reads of the state. */
export type ShownState = Pick<WorkflowState, 'level' | 'demo' | 'slotValues'>;

/** How many rounds each repeated stage draws: the rounds the run holds, else the stage's demo cap. */
function drawnRounds(workflow: Workflow, run: Run): Record<string, number> {
  const counts = workflow.stages.flatMap((stage) => {
    const held = run.stages.find((each) => each.id === stage.id)?.rounds.length ?? 0;
    return stage.foreach ? [[stage.id, held || stage.foreach.demo] as const] : [];
  });
  return Object.fromEntries(counts);
}

/** The one entry that computes the Run of the shown Workflow, and its view and rounds from that same run. */
export function showWorkflow(workflow: Workflow, { level, demo, slotValues }: ShownState): WorkflowShown {
  const run = runOf(workflow.file, { results: slotValues, demo });
  const played = playedRounds(run);
  return {
    workflow,
    run,
    view: workflowView(workflow, { level, demo, rounds: played }),
    played,
    drawn: drawnRounds(workflow, run),
  };
}

/** What the parent knows: the data it was given, its state, and what `showWorkflow` computed of the shown Workflow. */
export interface Shown extends WorkflowShown {
  readonly data: HumanInTheLoopData;
  readonly state: WorkflowState;
  /** What to tell the viewer about their saved progress, if anything. */
  readonly note: ProgressNote | null;
  /** Save and load of the run; none for an uploaded Workflow. */
  readonly progress: ProgressActions | null;
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
  const { run } = shown;
  const demoProps = demoPropsOf(shown, run.canChangeDemo, on);
  const toolbar = toolbarOf(shown, on, demoProps);
  return {
    toolbar,
    diagram: diagramOf(shown, on),
    modal: modalOf(shown, on, { run, demo: demoProps }),
  };
}

/** The demo switch and Reset for both places that hold them: the toolbar and the popover. */
function demoPropsOf({ data, state, progress }: Shown, canChange: boolean, on: Callbacks): DemoProps {
  const { controls, readonly } = data;
  const demo: DemoState = {
    show: offers(controls, 'demo', readonly),
    resetShow: offers(controls, 'reset', readonly) && !canChange,
    on: state.demo,
    locked: !canChange,
    hasWork: !canChange,
  };
  return { demo, onDemo: on.onDemo, onReset: on.onReset, onDownloadRun: progress?.onDownload };
}

/** The run goes to the diagram only once it has work, and never to a readonly Preset: both views then show progress. */
function diagramOf({ data, state, workflow, run, drawn }: Shown, on: Callbacks): DiagramProps {
  const shows = !data.readonly && !run.canChangeDemo;
  return {
    workflow,
    readonly: data.readonly,
    onOpenStage: on.onOpenStage,
    view: state.view,
    rounds: drawn,
    run: shows ? run : undefined,
    slots: data.diagram,
    words: data.words,
  };
}

function toolbarOf(
  { data, state, workflow, note, progress, debugAvailable }: Shown,
  on: Callbacks,
  demo: DemoProps,
): ToolbarProps {
  const { controls, words, readonly } = data;
  const { level, view, uploadProblems } = state;
  const { onLevel, onView, onWorkflow, onUpload, onDebug } = on;
  const debug = { show: debugAvailable && offers(controls, 'debug', readonly), on: state.debug };
  return {
    ...demo,
    workflow,
    choices: data.workflows.map(({ id, title, description }) => ({ id, title, description })),
    level,
    view,
    controls,
    readonly,
    words,
    uploadProblems,
    note,
    progress,
    canSave: demo.demo.hasWork,
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
    demo: state.demo,
    locale: data.locale,
    source: hash?.slice(0, 8) ?? 'uploaded',
  };
}

function modalOf(
  { data, state, workflow, view, debugAvailable }: Shown,
  on: Callbacks,
  { run, demo }: { readonly run: Run; readonly demo: DemoProps },
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
    ...demo,
  };
}
