import type { Workflow } from './workflow.types';

/*
 * The parent's state and reducer. The state is plain and serializable (arrays, not sets) and lives only in the
 * component: nothing goes to the URL (FE-001). Progress (the results and the demo flag) is saved by a hook around
 * this state under the progress key (FE-001 §3); the `restore` event is how a saved run comes back in.
 */

/** Simple copies long prompts; Technical copies the matching `/skill` command. */
export type Level = 'simple' | 'technical';

/** What the diagram shows: a card per stage (the high-level view) or every job of each stage (the detailed one). Transient: never stored. */
export type View = 'stages' | 'jobs';

export interface WorkflowState {
  /** The shown Workflow: an authored one, or the uploaded one's id. */
  readonly workflowId: string;
  readonly level: Level;
  readonly view: View;
  /** The stage whose "Try it" modal is open, if any. */
  readonly openStageId: string | null;
  /** The job whose card opened the modal: the stepper opens at it. Null where the modal opened by its stage. */
  readonly openJobId: string | null;
  /** The round of a repeated stage the job card sat in: the stepper opens at that round. Null where the modal opened by its stage or job. */
  readonly openRound: number | null;
  /** A Workflow the viewer uploaded and that is shown instead of an authored one. */
  readonly uploaded: Workflow | null;
  /** Demo mode caps a repeated stage's rounds. On at the start; the run model says when it may still change. */
  readonly demo: boolean;
  /** What the viewer pasted, keyed as the run model keys results (`stage.job`, `stage.job#k`), plus free inputs by their own name. The hook saves these. */
  readonly slotValues: Readonly<Record<string, string>>;
  /** Debug mode: the copy buttons add a footer instruction. In memory only, never stored (FE-001), off at the start. */
  readonly debug: boolean;
  /** What was wrong with the last upload; empty when it loaded or none was tried. */
  readonly uploadProblems: readonly string[];
}

/** What a Slide's Preset decides at the start. */
export interface Start {
  readonly workflowId: string;
  readonly level: Level;
  /** The Preset's starting view; a reload returns to it. */
  readonly view: View;
}

/** What a part can ask the parent for. */
export type WorkflowEvent =
  | { readonly type: 'level'; readonly level: Level }
  | { readonly type: 'view'; readonly view: View }
  | { readonly type: 'workflow'; readonly workflowId: string }
  | { readonly type: 'open'; readonly stageId: string; readonly jobId?: string; readonly round?: number }
  | { readonly type: 'close' }
  | { readonly type: 'demo'; readonly demo: boolean }
  | { readonly type: 'reset' }
  | { readonly type: 'debug'; readonly debug: boolean }
  | { readonly type: 'slots'; readonly values: Readonly<Record<string, string>> }
  | { readonly type: 'upload'; readonly workflow: Workflow }
  | { readonly type: 'restore'; readonly results: Readonly<Record<string, string>>; readonly demo: boolean }
  | { readonly type: 'upload-failed'; readonly problems: readonly string[] };

export function createState(start: Start): WorkflowState {
  return {
    ...start,
    demo: true,
    debug: false,
    openStageId: null,
    openJobId: null,
    openRound: null,
    slotValues: {},
    uploaded: null,
    uploadProblems: [],
  };
}

type Handlers = {
  readonly [T in WorkflowEvent['type']]: (
    state: WorkflowState,
    event: Extract<WorkflowEvent, { type: T }>,
  ) => WorkflowState;
};

/** What changing the shown Workflow starts over: the open stage, the pasted values, demo mode, any upload and its problems. */
const FRESH = {
  openStageId: null,
  openJobId: null,
  openRound: null,
  demo: true,
  slotValues: {},
  uploaded: null,
  uploadProblems: [],
} as const;

const HANDLERS: Handlers = {
  level: (state, { level }) => ({ ...state, level }),
  view: (state, { view }) => ({ ...state, view }),
  workflow: (state, { workflowId }) => ({ ...state, ...FRESH, workflowId }),
  open: (state, { stageId, jobId, round }) => ({
    ...state,
    openStageId: stageId,
    openJobId: jobId ?? null,
    openRound: round ?? null,
  }),
  close: (state) =>
    state.openStageId === null ? state : { ...state, openStageId: null, openJobId: null, openRound: null },
  demo: (state, { demo }) => ({ ...state, demo }),
  debug: (state, { debug }) => ({ ...state, debug }),
  reset: (state) => ({ ...state, slotValues: {}, demo: true }),
  slots: (state, { values }) => ({ ...state, slotValues: values }),
  upload: (state, { workflow }) => ({ ...state, ...FRESH, workflowId: workflow.id, uploaded: workflow }),
  restore: (state, { results, demo }) => ({ ...state, slotValues: results, demo, uploadProblems: [] }),
  'upload-failed': (state, { problems }) => ({ ...state, uploadProblems: problems }),
};

export function reduce(state: WorkflowState, event: WorkflowEvent): WorkflowState {
  const handle = HANDLERS[event.type] as (s: WorkflowState, e: WorkflowEvent) => WorkflowState;
  return handle(state, event);
}
