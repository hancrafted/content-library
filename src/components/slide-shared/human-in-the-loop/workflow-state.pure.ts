import type { Workflow } from './workflow.types';

/*
 * The parent's state and reducer. The state is plain and serializable (arrays, not sets) and lives only in the
 * component: nothing goes to the URL (FE-001). Progress (the results and the teaching flag) is saved by a hook around
 * this state under the progress key (FE-001 §3); the `restore` event is how a saved run comes back in.
 */

/** Simple copies long prompts; Technical copies the matching `/skill` command. */
export type Level = 'simple' | 'technical';

/** What the diagram shows: a card per stage, every job, or the viewer's progress. Transient: never stored. */
export type View = 'presentation' | 'detailed' | 'handson';

export interface WorkflowState {
  /** The shown Workflow: an authored one, or the uploaded one's id. */
  readonly workflowId: string;
  readonly level: Level;
  readonly view: View;
  /** The stage whose "Try it" modal is open, if any. */
  readonly openStageId: string | null;
  /** A Workflow the viewer uploaded and that is shown instead of an authored one. */
  readonly uploaded: Workflow | null;
  /** Teaching mode caps a repeated stage's rounds. On at the start; the run model says when it may still change. */
  readonly teaching: boolean;
  /** What the viewer pasted, keyed as the run model keys results (`stage.job`, `stage.job#k`), plus free inputs by their own name. The hook saves these. */
  readonly slotValues: Readonly<Record<string, string>>;
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
  | { readonly type: 'open'; readonly stageId: string }
  | { readonly type: 'close' }
  | { readonly type: 'teaching'; readonly teaching: boolean }
  | { readonly type: 'reset' }
  | { readonly type: 'slots'; readonly values: Readonly<Record<string, string>> }
  | { readonly type: 'upload'; readonly workflow: Workflow }
  | { readonly type: 'restore'; readonly results: Readonly<Record<string, string>>; readonly teaching: boolean }
  | { readonly type: 'upload-failed'; readonly problems: readonly string[] };

export function createState(start: Start): WorkflowState {
  return {
    ...start,
    teaching: true,
    openStageId: null,
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

/** What changing the shown Workflow starts over: the open stage, the pasted values, teaching mode, any upload and its problems. */
const FRESH = {
  openStageId: null,
  teaching: true,
  slotValues: {},
  uploaded: null,
  uploadProblems: [],
} as const;

const HANDLERS: Handlers = {
  level: (state, { level }) => ({ ...state, level }),
  view: (state, { view }) => ({ ...state, view }),
  workflow: (state, { workflowId }) => ({ ...state, ...FRESH, workflowId }),
  open: (state, { stageId }) => ({ ...state, openStageId: stageId }),
  close: (state) => (state.openStageId === null ? state : { ...state, openStageId: null }),
  teaching: (state, { teaching }) => ({ ...state, teaching }),
  reset: (state) => ({ ...state, slotValues: {}, teaching: true }),
  slots: (state, { values }) => ({ ...state, slotValues: values }),
  upload: (state, { workflow }) => ({ ...state, ...FRESH, workflowId: workflow.id, uploaded: workflow }),
  restore: (state, { results, teaching }) => ({ ...state, slotValues: results, teaching, uploadProblems: [] }),
  'upload-failed': (state, { problems }) => ({ ...state, uploadProblems: problems }),
};

export function reduce(state: WorkflowState, event: WorkflowEvent): WorkflowState {
  const handle = HANDLERS[event.type] as (s: WorkflowState, e: WorkflowEvent) => WorkflowState;
  return handle(state, event);
}
