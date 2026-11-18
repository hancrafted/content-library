import type { ExplorableEvent } from './explorable-state.pure';

export interface Timers {
  readonly set: (run: () => void, milliseconds: number) => number;
  readonly clear: (id: number) => void;
}

export interface Landings {
  readonly count: number;
  readonly landsAt: (index: number) => number;
  readonly land: (index: number) => void;
  readonly timers: Timers;
}

export function scheduleLandings({ count, landsAt, land, timers }: Landings): () => void {
  const ids = Array.from({ length: count }, (_, index) => timers.set(() => land(index), landsAt(index)));
  return () => ids.forEach((id) => timers.clear(id));
}

const VIEWER_BRACE_EVENTS = new Set<ExplorableEvent['type']>(['braceStep', 'play']);

export const yieldingToViewer =
  (dispatch: (event: ExplorableEvent) => void, cancel: () => void) =>
  (event: ExplorableEvent): void => {
    if (VIEWER_BRACE_EVENTS.has(event.type)) cancel();
    dispatch(event);
  };
