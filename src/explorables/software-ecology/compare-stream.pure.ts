/*
 * The compare stream (design-ADR 0024 §17, §19), as the reference build's `pick`, `renderCompareWidget`, `openCompare`,
 * `exitCompare` and `renderCompare` keep it: compare mode picks up to three work centers, Show flattens them into
 * columns in flow order, a belt between neighbours, a gap counting the stations skipped otherwise. The compare set is
 * transient state the client parent owns (FE-001 §1). No DOM.
 */
import { Q } from './factory-dials.pure.ts';
import { COMPL, REDO } from './factory-flow.pure.ts';
import type { Factory, FactoryNode } from './factory.types';

export const COMPARE_MAX = 3;

/** The hint beside the widget: how to pick, or that three is the most. */
export type CompareNote = 'pick' | 'max' | null;

export interface CompareState {
  /** Compare mode is on: a click on a work center picks it. */
  readonly picking: boolean;
  /** The stream is shown. */
  readonly open: boolean;
  /** The picks, in the order they were picked. */
  readonly ids: readonly string[];
  readonly note: CompareNote;
}

export const closedCompare = (): CompareState => ({ picking: false, open: false, ids: [], note: null });

/** A preset's `compare` opens the stream directly; without one, compare is off. */
export const presetCompare = (ids: readonly string[] | undefined): CompareState =>
  ids?.length ? { picking: false, open: true, ids: ids.slice(0, COMPARE_MAX), note: null } : closedCompare();

/** A click (or shift-click) on a work center: picks it, drops it again, or refuses a fourth. */
export const pickCompare = (c: CompareState, id: string): CompareState => {
  const base = { ...c, picking: true };
  if (c.ids.includes(id)) return { ...base, ids: c.ids.filter((x) => x !== id), note: null };
  if (c.ids.length >= COMPARE_MAX) return { ...base, note: 'max' };
  return { ...base, ids: [...c.ids, id], note: null };
};

/** The Compare button while the stream is closed: picking on with its hint, or off with the picks cleared. */
export const togglePicking = (c: CompareState): CompareState =>
  c.picking ? closedCompare() : { ...c, picking: true, note: 'pick' };

/** Show: the picks as a stream. */
export const openCompare = (c: CompareState): CompareState => ({ ...c, picking: false, open: true, note: null });

/** A slot's remove button; the stream closes with its last column. */
export const removeCompare = (c: CompareState, id: string): CompareState => {
  const ids = c.ids.filter((x) => x !== id);
  return c.open && !ids.length ? closedCompare() : { ...c, ids, note: null };
};

/** One piece of the stream, left to right. */
export type StreamPart =
  | { readonly kind: 'column'; readonly id: string }
  /** Neighbours on the line: the belt between them carries the live flow. */
  | { readonly kind: 'belt'; readonly key: string }
  /** The work centers in flow order between two columns no belt joins. */
  | { readonly kind: 'gap'; readonly skipped: number };

const isCenter = (m: Pick<Factory, 'nodes'>, id: string) => m.nodes.get(id)?.kind === 'role';

/** The picked work centers in flow order, with a belt or a gap between each two. */
export const streamOf = (m: Pick<Factory, 'nodes' | 'order' | 'edges'>, ids: readonly string[]): StreamPart[] => {
  const cols = m.order.filter((id) => ids.includes(id) && isCenter(m, id));
  return cols.flatMap((id, i): StreamPart[] => {
    if (i === 0) return [{ kind: 'column', id }];
    const prev = cols[i - 1] as string,
      e = m.edges.find((f) => f.from.id === prev && f.to.id === id);
    const skipped = m.order.slice(m.order.indexOf(prev) + 1, m.order.indexOf(id)).filter((x) => isCenter(m, x)).length;
    return [e ? { kind: 'belt', key: e.key } : { kind: 'gap', skipped }, { kind: 'column', id }];
  });
};

/** A document as a chip in the stream: its quality, AI-made, a warning for rework or a complaint. */
export interface Chip {
  readonly good: boolean;
  readonly ai: boolean;
  readonly warn: boolean;
}

/** What a column's station shows besides its signs: the backlog as chips, and its plain numbers. */
export interface ColumnReadout {
  /** The front of the backlog, at most ten chips. */
  readonly queue: readonly Chip[];
  /** Waiting beyond the chips, the "+n". */
  readonly more: number;
  readonly waiting: number;
  /** Weeks of work waiting. */
  readonly weeks: number;
  /** Busy, in percent. */
  readonly busy: number;
  /** Done a week. */
  readonly done: number;
}

const QUEUE_SHOWN = 10;

const queueOf = (n: FactoryNode): Chip[] => {
  const out: Chip[] = [];
  for (let i = 0; i < n.runs.n && out.length < QUEUE_SHOWN; i++) {
    const r = n.runs.at(i),
      chip = { good: !(r.fl & COMPL) && r.q === Q.GOOD, ai: !!r.ai, warn: (r.fl & (REDO | COMPL)) !== 0 };
    for (let j = 0; j < r.c && out.length < QUEUE_SHOWN; j++) out.push(chip);
  }
  return out;
};

export const columnOf = (n: FactoryNode): ColumnReadout => ({
  queue: queueOf(n),
  more: Math.max(0, n.L - QUEUE_SHOWN),
  waiting: n.L,
  weeks: n.Ws,
  busy: Math.round(n.u.busy * 100),
  done: n.rate.done,
});
