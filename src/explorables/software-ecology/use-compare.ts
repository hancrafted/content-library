// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
// decision: FE-001 §1
import { useEffect, useMemo, useState } from 'react';
import {
  closedCompare,
  openCompare,
  pickCompare,
  presetCompare,
  removeCompare,
  togglePicking,
  type CompareState,
} from './compare-stream.pure.ts';
import type { DashboardState } from './use-dashboard.ts';

export interface CompareActions {
  readonly state: CompareState;
  readonly stream: readonly string[];
  pick(id: string): void;
  toggle(): void;
  remove(id: string): void;
  show(): void;
  exit(): void;
  reset(ids: readonly string[] | undefined): void;
}

const NONE: readonly string[] = [];

function useEscape(on: boolean, leave: () => void) {
  useEffect(() => {
    if (!on) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leave();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [on, leave]);
}

const leaveAll = (set: (c: CompareState) => void) => () => set(closedCompare());

export function useCompare(initial: readonly string[] | undefined): CompareActions {
  const [state, set] = useState(() => presetCompare(initial));
  const leave = useMemo(() => leaveAll(set), []);
  useEscape(state.picking && !state.open, leave);
  const ids = state.ids,
    open = state.open;
  const stream = useMemo(() => (open ? ids : NONE), [open, ids]);
  return {
    state,
    stream,
    pick: (id) => set((c) => pickCompare(c, id)),
    toggle: () => set((c) => (c.open ? closedCompare() : togglePicking(c))),
    remove: (id) => set((c) => removeCompare(c, id)),
    show: () => set(openCompare),
    exit: leave,
    reset: (next) => set(presetCompare(next)),
  };
}

export function useWatch(dash: DashboardState, compare: CompareActions): readonly string[] {
  const { watch } = dash,
    { stream } = compare;
  return useMemo(() => (stream.length ? [...watch, ...stream] : watch), [watch, stream]);
}
