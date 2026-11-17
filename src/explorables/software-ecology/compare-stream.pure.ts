// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
// decision: FE-001 §1
import type { Topology } from './factory-model.pure.ts';

export const COMPARE_MAX = 3;

export type CompareNote = 'pick' | 'max' | null;

export interface CompareState {
  readonly picking: boolean;
  readonly open: boolean;
  readonly ids: readonly string[];
  readonly note: CompareNote;
}

export const closedCompare = (): CompareState => ({ picking: false, open: false, ids: [], note: null });

export const presetCompare = (ids: readonly string[] | undefined): CompareState =>
  ids?.length ? { picking: false, open: true, ids: ids.slice(0, COMPARE_MAX), note: null } : closedCompare();

export const pickCompare = (c: CompareState, id: string): CompareState => {
  const base = { ...c, picking: true };
  if (c.ids.includes(id)) return { ...base, ids: c.ids.filter((x) => x !== id), note: null };
  if (c.ids.length >= COMPARE_MAX) return { ...base, note: 'max' };
  return { ...base, ids: [...c.ids, id], note: null };
};

export const togglePicking = (c: CompareState): CompareState =>
  c.picking ? closedCompare() : { ...c, picking: true, note: 'pick' };

export const openCompare = (c: CompareState): CompareState => ({ ...c, picking: false, open: true, note: null });

export const removeCompare = (c: CompareState, id: string): CompareState => {
  const ids = c.ids.filter((x) => x !== id);
  return c.open && !ids.length ? closedCompare() : { ...c, ids, note: null };
};

export type StreamPart =
  | { readonly kind: 'column'; readonly id: string }
  | { readonly kind: 'belt'; readonly key: string }
  | { readonly kind: 'gap'; readonly skipped: number };

const isCenter = (m: Pick<Topology, 'nodes'>, id: string) => m.nodes.get(id)?.kind === 'role';

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
