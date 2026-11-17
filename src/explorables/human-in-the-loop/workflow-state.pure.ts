import { unwrapPastedResult } from './pasted-result.pure';
import type { PromptEdits } from './prompt-edits.pure';
import type { Workflow } from './workflow.types';

// decision: FE-001 §2
// decision: FE-001 §3
export type Level = 'simple' | 'technical';

export type View = 'stages' | 'jobs';

export interface WorkflowState {
  readonly workflowId: string;
  readonly level: Level;
  readonly view: View;
  readonly openStageId: string | null;
  readonly openJobId: string | null;
  readonly openRound: number | null;
  readonly uploaded: Workflow | null;
  readonly demo: boolean;
  readonly slotValues: Readonly<Record<string, string>>;
  readonly prompts: PromptEdits;
  // decision: FE-001 §3
  readonly debug: boolean;
  readonly uploadProblems: readonly string[];
}

export interface Start {
  readonly workflowId: string;
  readonly level: Level;
  readonly view: View;
}

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
  | { readonly type: 'prompts'; readonly values: PromptEdits }
  | {
      readonly type: 'restore';
      readonly results: Readonly<Record<string, string>>;
      readonly demo: boolean;
      readonly prompts?: PromptEdits;
    }
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
    prompts: {},
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

const FRESH = {
  openStageId: null,
  openJobId: null,
  openRound: null,
  demo: true,
  slotValues: {},
  prompts: {},
  uploaded: null,
  uploadProblems: [],
} as const;

function unwrapPasted(
  before: Readonly<Record<string, string>>,
  values: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      (before[key] ?? '').trim() === '' ? unwrapPastedResult(value) : value,
    ]),
  );
}

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
  reset: (state) => ({ ...state, slotValues: {}, prompts: {}, demo: true }),
  prompts: (state, { values }) => ({ ...state, prompts: values }),
  slots: (state, { values }) => ({ ...state, slotValues: unwrapPasted(state.slotValues, values) }),
  upload: (state, { workflow }) => ({ ...state, ...FRESH, workflowId: workflow.id, uploaded: workflow }),
  restore: (state, { results, demo, prompts }) => ({
    ...state,
    slotValues: results,
    prompts: prompts ?? {},
    demo,
    uploadProblems: [],
  }),
  'upload-failed': (state, { problems }) => ({ ...state, uploadProblems: problems }),
};

export function reduce(state: WorkflowState, event: WorkflowEvent): WorkflowState {
  const handle = HANDLERS[event.type] as (s: WorkflowState, e: WorkflowEvent) => WorkflowState;
  return handle(state, event);
}
