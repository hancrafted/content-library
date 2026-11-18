import {
  AGENT_REST,
  CELL_MEMORY,
  CELL_ROWS,
  closeCell,
  focused,
  light,
  openCell,
  toDefinition,
  unlight,
  zoomTo,
  type AgentEvent,
  type AgentSlice,
} from './agent-state.pure';
import { DEFINITION_IDS, type ViewId } from './brief-or-pay-the-price.types';

export { ZOOM_LEVELS, type CellKey, type Level, type Lit, type ZoomLevel } from './agent-state.pure';

export const SIDES = ['freelancer', 'ai'] as const;
export type Side = (typeof SIDES)[number];

export type View = ViewId;
export type Target = number | 'closing';

export interface RowMemory {
  readonly passes: number;
  readonly turned: readonly Side[];
}

export interface MirrorMemory {
  readonly rows: readonly RowMemory[];
  readonly open: Target | null;
  readonly blank: boolean;
}

export interface ExplorableState extends AgentSlice<MirrorMemory> {
  readonly scenario: string;
}

export type ExplorableEvent =
  | AgentEvent
  | { readonly type: 'view'; readonly view: View }
  | { readonly type: 'scenario'; readonly scenario: string }
  | { readonly type: 'open'; readonly target: Target }
  | { readonly type: 'leave'; readonly target: Target }
  | { readonly type: 'dismiss' }
  | { readonly type: 'replay'; readonly row: number }
  | { readonly type: 'turn'; readonly row: number; readonly side: Side }
  | { readonly type: 'blank' }
  | { readonly type: 'showAll' }
  | { readonly type: 'reset' };

export const BLANK_MILLISECONDS = 900;
export const HOLD_MILLISECONDS = 1500;

const emptyMirror = (rowCount: number): MirrorMemory => ({
  rows: Array.from({ length: rowCount }, () => ({ passes: 0, turned: [] })),
  open: null,
  blank: false,
});

export const memoryKey = (state: Pick<ExplorableState, 'view' | 'scenario' | 'cell'>): string => {
  if (state.cell !== null) return CELL_MEMORY;
  return state.view === 'stages' ? `stages:${state.scenario}` : state.view;
};

export function start(rowCounts: Readonly<Record<string, number>>, scenario = ''): ExplorableState {
  const counts = { ...rowCounts, [CELL_MEMORY]: CELL_ROWS };
  return {
    ...AGENT_REST,
    view: DEFINITION_IDS[0],
    scenario,
    mirrors: Object.fromEntries(Object.entries(counts).map(([key, count]) => [key, emptyMirror(count)])),
  };
}

export const currentMirror = (state: ExplorableState): MirrorMemory =>
  state.mirrors[memoryKey(state)] ?? emptyMirror(0);

const withMirror = (state: ExplorableState, mirror: MirrorMemory): ExplorableState => ({
  ...state,
  mirrors: { ...state.mirrors, [memoryKey(state)]: mirror },
});

const played = (row: RowMemory): RowMemory => ({ ...row, passes: Math.max(row.passes, 1) });
const replayed = (row: RowMemory): RowMemory => ({ ...row, passes: row.passes + 1 });

function open(state: ExplorableState, target: Target): ExplorableState {
  const mirror = currentMirror(state);
  if (mirror.open === target) return state;
  if (target === 'closing')
    return withMirror(state, { rows: mirror.rows.map((row) => played(row)), open: target, blank: false });
  return withMirror(state, {
    rows: mirror.rows.map((row, index) => (index === target ? replayed(row) : row)),
    open: target,
    blank: false,
  });
}

function turn(state: ExplorableState, row: number, side: Side): ExplorableState {
  const mirror = currentMirror(state);
  if ((mirror.rows[row]?.passes ?? 0) === 0) return state;
  const rows = mirror.rows.map((each, index) => {
    if (index !== row) return each;
    const turned = each.turned.includes(side) ? each.turned.filter((one) => one !== side) : [...each.turned, side];
    return { ...each, turned };
  });
  return withMirror(state, { ...mirror, rows });
}

type Handlers = {
  readonly [K in ExplorableEvent['type']]: (
    state: ExplorableState,
    event: Extract<ExplorableEvent, { type: K }>,
  ) => ExplorableState;
};

const playedCell: MirrorMemory = {
  rows: Array.from({ length: CELL_ROWS }, () => ({ passes: 1, turned: [] })),
  open: null,
  blank: false,
};

const ON: Handlers = {
  view: (state, { view }) => toDefinition(state, view),
  zoom: (state, { level }) => zoomTo(state, level),
  openCell: (state, { cell }) => openCell(state, cell, playedCell),
  closeCell: (state) => closeCell(state, playedCell),
  light: (state, { lit }) => light(state, lit),
  unlight: (state) => unlight(state),
  focused: (state) => focused(state),
  scenario: (state, { scenario }) => (state.scenario === scenario ? state : { ...state, scenario }),
  open: (state, { target }) => open(state, target),
  leave: (state, { target }) =>
    currentMirror(state).open === target
      ? withMirror(state, { ...currentMirror(state), open: null, blank: false })
      : state,
  dismiss: (state) =>
    currentMirror(state).open === null
      ? state
      : withMirror(state, { ...currentMirror(state), open: null, blank: false }),
  replay: (state, { row }) => {
    const mirror = currentMirror(state);
    if (mirror.open !== row) return state;
    return withMirror(state, {
      ...mirror,
      rows: mirror.rows.map((each, index) => (index === row ? replayed(each) : each)),
    });
  },
  turn: (state, { row, side }) => turn(state, row, side),
  blank: (state) => {
    const mirror = currentMirror(state);
    return mirror.open === 'closing' && !mirror.blank ? withMirror(state, { ...mirror, blank: true }) : state;
  },
  showAll: (state) => {
    const mirror = currentMirror(state);
    return withMirror(state, {
      rows: mirror.rows.map((row) => (row.passes > 0 ? replayed(row) : played(row))),
      open: null,
      blank: false,
    });
  },
  reset: (state) => withMirror(state, emptyMirror(currentMirror(state).rows.length)),
};

export function step(state: ExplorableState, event: ExplorableEvent): ExplorableState {
  return (ON[event.type] as (state: ExplorableState, event: ExplorableEvent) => ExplorableState)(state, event);
}

export interface RowRead {
  readonly shown: boolean;
  readonly pass: number;
  readonly looping: boolean;
  readonly blank: boolean;
  readonly turned: Readonly<Record<Side, boolean>>;
}

export function rowAt(state: ExplorableState, row: number): RowRead {
  const mirror = currentMirror(state);
  const memory = mirror.rows[row] ?? { passes: 0, turned: [] };
  return {
    shown: memory.passes > 0,
    pass: memory.passes,
    looping: mirror.open === row,
    blank: mirror.open === 'closing' && mirror.blank,
    turned: { freelancer: memory.turned.includes('freelancer'), ai: memory.turned.includes('ai') },
  };
}

export const isWiping = (state: ExplorableState): boolean => currentMirror(state).open === 'closing';

export function nextTimer(
  { open, blank }: Pick<MirrorMemory, 'open' | 'blank'>,
  beatMilliseconds: readonly number[],
): { readonly milliseconds: number; readonly event: ExplorableEvent } | null {
  if (open === null) return null;
  if (open === 'closing') return blank ? null : { milliseconds: BLANK_MILLISECONDS, event: { type: 'blank' } };
  return { milliseconds: (beatMilliseconds[open] ?? 0) + HOLD_MILLISECONDS, event: { type: 'replay', row: open } };
}
