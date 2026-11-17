import { useCallback, useEffect, useState, type RefObject } from 'react';
import type { FactoryRun } from './factory-run.pure.ts';
import { readoutFor, type HeldReadout } from './readout-for.pure.ts';

export type Read = (run: FactoryRun, charts?: boolean) => void;

export interface Watched {
  readonly watch: readonly string[];
  readonly stream: readonly string[];
}

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
