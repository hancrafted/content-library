import { progressKeyOf } from '@/shared/lib/progress.pure';
import { SOURCE_CHARS, type DebugBase } from './debug-footer.pure';
import type { DiagramProps, HumanInTheLoopData } from './human-in-the-loop.types';
import type { ModalProps, ToolbarProps } from './part-props.types';
import type { DemoProps, DemoState, ProgressActions, ProgressNote } from './progress-controls.types';
import { offers } from './toolbar-controls.pure';
import { workflowInMode, workflowOf } from './workflow-file-adapter.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { markerValuesOf, roundsOf as playedRounds, resultsOf, runOf, type Run } from './workflow-run.pure';
import type { WorkflowEvent, WorkflowState } from './workflow-state.pure';
import { workflowView, type WorkflowView } from './workflow-view.pure';
import type { Workflow } from './workflow.types';

// decision: FE-012 §4
export function shownWorkflow(
  data: HumanInTheLoopData,
  state: Pick<WorkflowState, 'uploaded' | 'workflowId'>,
): Workflow | undefined {
  return state.uploaded ?? data.workflows.find((w) => w.id === state.workflowId) ?? data.workflows[0];
}

export function progressTarget(
  data: HumanInTheLoopData,
  state: WorkflowState,
): { id: string; key: string; hash: string } | null {
  const id = shownWorkflow(data, state)?.id;
  const hash = id === undefined || state.uploaded ? undefined : data.hashes[id];
  return id !== undefined && hash !== undefined ? { id, key: progressKeyOf(id), hash } : null;
}

export function uploadEvent(yaml: string): WorkflowEvent {
  const result = loadWorkflow(yaml);
  return 'problems' in result
    ? { type: 'upload-failed', problems: result.problems }
    : { type: 'upload', workflow: workflowOf(result.file) };
}

export type Callbacks = Pick<
  ToolbarProps,
  'onLevel' | 'onView' | 'onWorkflow' | 'onUpload' | 'onDemo' | 'onReset' | 'onDebug'
> &
  Pick<DiagramProps, 'onOpenStage'> &
  Pick<ModalProps, 'onClose' | 'onSlots'> & { onPrompts: ModalProps['edits']['onChange'] };

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
    onPrompts: (values) => dispatch({ type: 'prompts', values }),
  };
}

export interface WorkflowShown {
  readonly workflow: Workflow;
  readonly run: Run;
  readonly view: WorkflowView;
  readonly played: Readonly<Record<string, number>>;
  readonly drawn: Readonly<Record<string, number>>;
}

export type ShownState = Pick<WorkflowState, 'level' | 'demo' | 'slotValues'>;

function drawnRounds(workflow: Workflow, run: Run): Record<string, number> {
  const counts = workflow.stages.flatMap((stage) => {
    const held = run.stages.find((each) => each.id === stage.id)?.rounds.length ?? 0;
    return stage.foreach ? [[stage.id, held || stage.foreach.demo] as const] : [];
  });
  return Object.fromEntries(counts);
}

export function showWorkflow(whole: Workflow, { level, demo, slotValues }: ShownState): WorkflowShown {
  const workflow = workflowInMode(whole, demo);
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

export interface Shown extends WorkflowShown {
  readonly data: HumanInTheLoopData;
  readonly state: WorkflowState;
  readonly note: ProgressNote | null;
  readonly progress: ProgressActions | null;
  readonly debugAvailable: boolean;
}

export interface Slices {
  readonly toolbar: ToolbarProps;
  readonly diagram: DiagramProps;
  readonly modal: ModalProps;
}

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

function demoPropsOf({ data, state, progress }: Shown, canChange: boolean, on: Callbacks): DemoProps {
  const { controls, readonly } = data;
  const hasWork = !canChange || Object.keys(state.prompts).length > 0;
  const demo: DemoState = {
    show: offers(controls, 'demo', readonly),
    resetShow: offers(controls, 'reset', readonly) && hasWork,
    on: state.demo,
    locked: !canChange,
    hasWork,
  };
  return { demo, onDemo: on.onDemo, onReset: on.onReset, onDownloadRun: progress?.onDownload };
}

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
  const { onLevel, onView, onWorkflow, onUpload, onDebug } = on;
  const debug = { show: debugAvailable && offers(controls, 'debug', readonly), on: state.debug };
  return {
    ...demo,
    workflow,
    choices: data.workflows.map(({ id, title, description }) => ({ id, title, description })),
    level: state.level,
    view: state.view,
    locale: data.locale,
    controls,
    readonly,
    words,
    uploadProblems: state.uploadProblems,
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

function debugBase({ data, state, workflow }: Pick<Shown, 'data' | 'state' | 'workflow'>): DebugBase {
  const hash = state.uploaded ? undefined : data.hashes[workflow.id];
  return {
    workflow: { id: workflow.id, title: workflow.title },
    level: state.level,
    demo: state.demo,
    locale: data.locale,
    source: hash?.slice(0, SOURCE_CHARS) ?? 'uploaded',
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
    edits: { values: state.prompts, level: state.level, onChange: on.onPrompts },
    debug: state.debug && debugAvailable ? debugBase({ data, state, workflow }) : null,
    words: data.words,
    level: state.level,
    onLevel: on.onLevel,
    onClose: on.onClose,
    onSlots: (values) => on.onSlots(resultsOf(file, values)),
    ...demo,
  };
}
