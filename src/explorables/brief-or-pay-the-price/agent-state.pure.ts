import type { MoveId, TraitId, ViewId } from './brief-or-pay-the-price.types';

export const ZOOM_LEVELS = ['agent', 'workflow'] as const;
export type ZoomLevel = (typeof ZOOM_LEVELS)[number];
export type Level = 'define' | ZoomLevel;

export interface CellKey {
  readonly move: MoveId;
  readonly trait: TraitId;
}

export type Lit = { readonly kind: 'move'; readonly id: MoveId } | { readonly kind: 'trait'; readonly id: TraitId };

export const CELL_MEMORY = 'cell';
export const CELL_ROWS = 2;

export type AgentEvent =
  | { readonly type: 'zoom'; readonly level: Level }
  | { readonly type: 'openCell'; readonly cell: CellKey }
  | { readonly type: 'closeCell' }
  | { readonly type: 'light'; readonly lit: Lit }
  | { readonly type: 'unlight' }
  | { readonly type: 'focused' };

export interface AgentSlice<Memory> {
  readonly level: Level;
  readonly view: ViewId;
  readonly cell: CellKey | null;
  readonly restore: CellKey | null;
  readonly lit: Lit | null;
  readonly arrival: ViewId | null;
  readonly node: string | null;
  readonly mirrors: Readonly<Record<string, Memory>>;
}

export const AGENT_REST = {
  level: 'define',
  cell: null,
  restore: null,
  lit: null,
  arrival: null,
  node: null,
} as const;

export const sameCell = (a: CellKey | null, b: CellKey | null): boolean =>
  a === b || (a !== null && b !== null && a.move === b.move && a.trait === b.trait);

const sameLit = (a: Lit | null, b: Lit | null): boolean =>
  a === b || (a !== null && b !== null && a.kind === b.kind && a.id === b.id);

export const toDefinition = <S extends AgentSlice<unknown>>(state: S, view: ViewId): S =>
  state.view === view && state.level === 'define' ? state : { ...state, ...AGENT_REST, view };

export function zoomAgent<S extends AgentSlice<unknown>>(state: S, level: Level): S {
  if (level === state.level && state.cell === null) return state;
  if (level === 'define') return { ...state, ...AGENT_REST };
  const arrival = state.level === 'define' ? state.view : state.arrival;
  return { ...state, ...AGENT_REST, level, arrival };
}

export function openCell<Memory, S extends AgentSlice<Memory>>(state: S, cell: CellKey, played: Memory): S {
  if (sameCell(state.cell, cell) && state.level === 'agent') return state;
  const mirrors = { ...state.mirrors, [CELL_MEMORY]: played };
  return { ...state, level: 'agent', cell, restore: null, lit: null, arrival: null, node: null, mirrors };
}

export function closeCell<Memory, S extends AgentSlice<Memory>>(state: S, played: Memory): S {
  if (state.cell === null) return state;
  return { ...state, cell: null, restore: state.cell, mirrors: { ...state.mirrors, [CELL_MEMORY]: played } };
}

export const light = <S extends AgentSlice<unknown>>(state: S, lit: Lit): S =>
  sameLit(state.lit, lit) ? state : { ...state, lit };

export const unlight = <S extends AgentSlice<unknown>>(state: S): S =>
  state.lit === null ? state : { ...state, lit: null };

export const focused = <S extends AgentSlice<unknown>>(state: S): S =>
  state.restore === null ? state : { ...state, restore: null };
