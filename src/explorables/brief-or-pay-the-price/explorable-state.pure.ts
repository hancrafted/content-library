import { DEFINITION_IDS, type DefinitionId } from './brief-or-pay-the-price.types';

export const SIDES = ['freelancer', 'ai'] as const;
export type Side = (typeof SIDES)[number];

export type View = DefinitionId;
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

export interface ExplorableState {
  readonly view: View;
  readonly mirrors: Readonly<Record<DefinitionId, MirrorMemory>>;
}

export type ExplorableEvent =
  | { readonly type: 'view'; readonly view: View }
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

export function start(rowCounts: Readonly<Record<DefinitionId, number>>): ExplorableState {
  return {
    view: DEFINITION_IDS[0],
    mirrors: Object.fromEntries(DEFINITION_IDS.map((id) => [id, emptyMirror(rowCounts[id])])) as Record<
      DefinitionId,
      MirrorMemory
    >,
  };
}

export const currentMirror = (state: ExplorableState): MirrorMemory => state.mirrors[state.view];
const mirrorOf = currentMirror;

const withMirror = (state: ExplorableState, mirror: MirrorMemory): ExplorableState => ({
  ...state,
  mirrors: { ...state.mirrors, [state.view]: mirror },
});

const mapRows = (rows: readonly RowMemory[], change: (row: RowMemory, index: number) => RowMemory) => rows.map(change);

const played = (row: RowMemory): RowMemory => ({ ...row, passes: Math.max(row.passes, 1) });
const replayed = (row: RowMemory): RowMemory => ({ ...row, passes: row.passes + 1 });

function open(state: ExplorableState, target: Target): ExplorableState {
  const mirror = mirrorOf(state);
  if (mirror.open === target) return state;
  if (target === 'closing')
    return withMirror(state, { rows: mapRows(mirror.rows, (row) => played(row)), open: target, blank: false });
  return withMirror(state, {
    rows: mapRows(mirror.rows, (row, index) => (index === target ? replayed(row) : row)),
    open: target,
    blank: false,
  });
}

function turn(state: ExplorableState, row: number, side: Side): ExplorableState {
  const mirror = mirrorOf(state);
  if ((mirror.rows[row]?.passes ?? 0) === 0) return state;
  const rows = mapRows(mirror.rows, (each, index) => {
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

const ON: Handlers = {
  view: (state, { view }) => (state.view === view ? state : { ...state, view }),
  open: (state, { target }) => open(state, target),
  leave: (state, { target }) =>
    mirrorOf(state).open === target ? withMirror(state, { ...mirrorOf(state), open: null, blank: false }) : state,
  dismiss: (state) =>
    mirrorOf(state).open === null ? state : withMirror(state, { ...mirrorOf(state), open: null, blank: false }),
  replay: (state, { row }) => {
    const mirror = mirrorOf(state);
    if (mirror.open !== row) return state;
    return withMirror(state, {
      ...mirror,
      rows: mapRows(mirror.rows, (each, index) => (index === row ? replayed(each) : each)),
    });
  },
  turn: (state, { row, side }) => turn(state, row, side),
  blank: (state) => {
    const mirror = mirrorOf(state);
    return mirror.open === 'closing' && !mirror.blank ? withMirror(state, { ...mirror, blank: true }) : state;
  },
  showAll: (state) => {
    const mirror = mirrorOf(state);
    return withMirror(state, {
      rows: mapRows(mirror.rows, (row) => (row.passes > 0 ? replayed(row) : played(row))),
      open: null,
      blank: false,
    });
  },
  reset: (state) => withMirror(state, emptyMirror(mirrorOf(state).rows.length)),
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
  const mirror = mirrorOf(state);
  const memory = mirror.rows[row] ?? { passes: 0, turned: [] };
  return {
    shown: memory.passes > 0,
    pass: memory.passes,
    looping: mirror.open === row,
    blank: mirror.open === 'closing' && mirror.blank,
    turned: { freelancer: memory.turned.includes('freelancer'), ai: memory.turned.includes('ai') },
  };
}

export const isWiping = (state: ExplorableState): boolean => mirrorOf(state).open === 'closing';

export function nextTimer(
  { open, blank }: Pick<MirrorMemory, 'open' | 'blank'>,
  beatMilliseconds: readonly number[],
): { readonly milliseconds: number; readonly event: ExplorableEvent } | null {
  if (open === null) return null;
  if (open === 'closing') return blank ? null : { milliseconds: BLANK_MILLISECONDS, event: { type: 'blank' } };
  return { milliseconds: (beatMilliseconds[open] ?? 0) + HOLD_MILLISECONDS, event: { type: 'replay', row: open } };
}
