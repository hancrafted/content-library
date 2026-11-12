/*
 * The compare set the client parent owns (design-ADR 0024 §17), as the reference build keeps `S.compare`: compare
 * mode picks up to three work centers, Show opens the stream, a slot removes its pick, Exit and the Compare toggle
 * close it, and Escape leaves compare mode while no stream is shown. Transient state (FE-001 §1).
 */
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

export interface CompareActions {
  readonly state: CompareState;
  /** The work centers in the stream while it is shown, else none. */
  readonly stream: readonly string[];
  pick(id: string): void;
  /** The Compare button: picking on or off, or Exit while the stream is shown. */
  toggle(): void;
  remove(id: string): void;
  show(): void;
  exit(): void;
  /** A new state: its `compare` opens the stream directly. */
  reset(ids: readonly string[] | undefined): void;
}

const NONE: readonly string[] = [];

/** Escape leaves compare mode while picking; a menu, a tour or a dashboard hears it first. */
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
