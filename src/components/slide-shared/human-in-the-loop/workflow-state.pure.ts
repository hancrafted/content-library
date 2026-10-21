import type { Workflow } from './workflow.types';

/*
 * The parent's state and reducer. The state is plain and serializable (arrays, not sets) and lives only in the
 * component: nothing goes to the URL (FE-001) or to storage.
 */

/** Watch is today's diagram; Try it yourself makes every job open its modal. */
export type Mode = 'watch' | 'try';
/** Simple copies long prompts; Technical copies the matching `/skill` command. */
export type Level = 'simple' | 'technical';

export interface WorkflowState {
  /** The shown Workflow: an authored one, or the uploaded one's id. */
  readonly workflowId: string;
  readonly mode: Mode;
  readonly level: Level;
  /** The job whose modal is open, if any. */
  readonly openJobId: string | null;
  /** Ids of the tickets ticked off in the ticket graph. */
  readonly ticked: readonly string[];
  /** A Workflow the viewer uploaded and that is shown instead of an authored one. */
  readonly uploaded: Workflow | null;
  /** What was wrong with the last upload; empty when it loaded or none was tried. */
  readonly uploadProblems: readonly string[];
}

/** What a Slide's Preset decides at the start. */
export interface Start {
  readonly workflowId: string;
  readonly mode: Mode;
  readonly level: Level;
}

/** What a part can ask the parent for. */
export type WorkflowEvent =
  | { readonly type: 'mode'; readonly mode: Mode }
  | { readonly type: 'level'; readonly level: Level }
  | { readonly type: 'workflow'; readonly workflowId: string }
  | { readonly type: 'open'; readonly jobId: string }
  | { readonly type: 'close' }
  | { readonly type: 'tick'; readonly ticketId: string }
  | { readonly type: 'upload'; readonly workflow: Workflow }
  | { readonly type: 'upload-failed'; readonly problems: readonly string[] };

export function createState(start: Start): WorkflowState {
  return { ...start, openJobId: null, ticked: [], uploaded: null, uploadProblems: [] };
}

type Handlers = {
  readonly [T in WorkflowEvent['type']]: (
    state: WorkflowState,
    event: Extract<WorkflowEvent, { type: T }>,
  ) => WorkflowState;
};

/** What changing the shown Workflow starts over: the open job, the ticks, any upload and its problems. */
const FRESH = { openJobId: null, ticked: [], uploaded: null, uploadProblems: [] } as const;

const HANDLERS: Handlers = {
  mode: (state, { mode }) => ({ ...state, mode }),
  level: (state, { level }) => ({ ...state, level }),
  workflow: (state, { workflowId }) => ({ ...state, ...FRESH, workflowId }),
  open: (state, { jobId }) => ({ ...state, openJobId: jobId }),
  close: (state) => (state.openJobId === null ? state : { ...state, openJobId: null }),
  tick: (state, { ticketId }) => ({
    ...state,
    ticked: state.ticked.includes(ticketId)
      ? state.ticked.filter((id) => id !== ticketId)
      : [...state.ticked, ticketId],
  }),
  upload: (state, { workflow }) => ({ ...state, ...FRESH, workflowId: workflow.id, uploaded: workflow }),
  'upload-failed': (state, { problems }) => ({ ...state, uploadProblems: problems }),
};

export function reduce(state: WorkflowState, event: WorkflowEvent): WorkflowState {
  const handle = HANDLERS[event.type] as (s: WorkflowState, e: WorkflowEvent) => WorkflowState;
  return handle(state, event);
}
