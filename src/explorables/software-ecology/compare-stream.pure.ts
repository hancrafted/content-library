/*
 * The compare stream (design-ADR 0024 §17, §19), as the reference build's `pick`, `renderCompareWidget`, `openCompare`,
 * `exitCompare` and `renderCompare` keep it: compare mode picks up to three work centers, Show flattens them into
 * columns in flow order, a belt between neighbours, a gap counting the stations skipped otherwise. The compare set is
 * transient state the client parent owns (FE-001 §1). No DOM.
 */
import type { Topology } from './factory-model.pure.ts';

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

const isCenter = (m: Pick<Topology, 'nodes'>, id: string) => m.nodes.get(id)?.kind === 'role';

/** The picked work centers in flow order, with a belt or a gap between each two. */
export const streamOf = (m: Pick<Topology, 'nodes' | 'order' | 'edges'>, ids: readonly string[]): StreamPart[] => {
  const cols = m.order.filter((id) => ids.includes(id) && isCenter(m, id));
  return cols.flatMap((id, i): StreamPart[] => {
    if (i === 0) return [{ kind: 'column', id }];
    const prev = cols[i - 1] as string,
      e = m.edges.find((f) => f.from.id === prev && f.to.id === id);
    const skipped = m.order.slice(m.order.indexOf(prev) + 1, m.order.indexOf(id)).filter((x) => isCenter(m, x)).length;
    return [e ? { kind: 'belt', key: e.key } : { kind: 'gap', skipped }, { kind: 'column', id }];
  });
};
