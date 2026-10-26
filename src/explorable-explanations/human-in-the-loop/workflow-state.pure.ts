import type { Workflow } from './workflow.types';

/*
 * The parent's state and reducer. The state is plain and serializable (arrays, not sets) and lives only in the
 * component: nothing goes to the URL (FE-001) or to storage.
 */

/** Simple copies long prompts; Technical copies the matching `/skill` command. */
export type Level = 'simple' | 'technical';

export interface WorkflowState {
  /** The shown Workflow: an authored one, or the uploaded one's id. */
  readonly workflowId: string;
  readonly level: Level;
  /** The stage whose "Try it" modal is open, if any. */
  readonly openStageId: string | null;
  /** A Workflow the viewer uploaded and that is shown instead of an authored one. */
  readonly uploaded: Workflow | null;
  /** What the viewer pasted into the prompt slots, by marker name (a slot's id, or `id_K`), shared by every stage. Memory only. */
  readonly slotValues: Readonly<Record<string, string>>;
  /** What was wrong with the last upload; empty when it loaded or none was tried. */
  readonly uploadProblems: readonly string[];
}

/** What a Slide's Preset decides at the start. */
export interface Start {
  readonly workflowId: string;
  readonly level: Level;
}

/** What a part can ask the parent for. */
export type WorkflowEvent =
  | { readonly type: 'level'; readonly level: Level }
  | { readonly type: 'workflow'; readonly workflowId: string }
  | { readonly type: 'open'; readonly stageId: string }
  | { readonly type: 'close' }
  | { readonly type: 'slots'; readonly values: Readonly<Record<string, string>> }
  | { readonly type: 'upload'; readonly workflow: Workflow }
  | { readonly type: 'upload-failed'; readonly problems: readonly string[] };

export function createState(start: Start): WorkflowState {
  return {
    ...start,
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

/** What changing the shown Workflow starts over: the open stage, the pasted values, any upload and its problems. */
const FRESH = {
  openStageId: null,
  slotValues: {},
  uploaded: null,
  uploadProblems: [],
} as const;

const HANDLERS: Handlers = {
  level: (state, { level }) => ({ ...state, level }),
  workflow: (state, { workflowId }) => ({ ...state, ...FRESH, workflowId }),
  open: (state, { stageId }) => ({ ...state, openStageId: stageId }),
  close: (state) => (state.openStageId === null ? state : { ...state, openStageId: null }),
  slots: (state, { values }) => ({ ...state, slotValues: values }),
  upload: (state, { workflow }) => ({ ...state, ...FRESH, workflowId: workflow.id, uploaded: workflow }),
  'upload-failed': (state, { problems }) => ({ ...state, uploadProblems: problems }),
};

export function reduce(state: WorkflowState, event: WorkflowEvent): WorkflowState {
  const handle = HANDLERS[event.type] as (s: WorkflowState, e: WorkflowEvent) => WorkflowState;
  return handle(state, event);
}
