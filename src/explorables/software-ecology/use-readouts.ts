import { useCallback, useEffect, useState, type RefObject } from 'react';
import type { FactoryRun } from './factory-run.pure.ts';
import { readoutFor, type HeldReadout } from './readout-for.pure.ts';

/** Reads the run into React: the readouts, and the dashboards on show; charts only when asked. */
export type Read = (run: FactoryRun, charts?: boolean) => void;

/** What every readout also reads: the dashboards on show and the work centers in the compare stream. */
export interface Watched {
  readonly watch: readonly string[];
  readonly stream: readonly string[];
}

/**
 * The readouts in React state, and the one way to refresh them; a new watch list reads at once. The state remembers the
 * run it was read from, so the render after a use case switch reads the new run instead of serving the old one's.
 */
export function useReadouts(run: FactoryRun, live: RefObject<Watched>, watchKey: string) {
  const [held, setHeld] = useState<HeldReadout>(() => ({ run, snap: run.read() }));
  const read = useCallback<Read>(
    (r, charts = true) =>
      setHeld((prev) => ({
        run: r,
        snap: r.read({
          watch: live.current.watch,
          stream: live.current.stream,
          charts,
          prev: prev.run === r ? prev.snap : undefined,
        }),
      })),
    [live],
  );
  useEffect(() => read(run), [read, run, watchKey]);
  return { snap: readoutFor(held, run), read };
}
