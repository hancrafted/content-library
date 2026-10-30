'use client';

import { createContext, useState } from 'react';
import type { BoxId } from './start-step.pure';

/** The ticked boxes and the way to flip one. */
export interface Ticks {
  readonly ticked: ReadonlySet<BoxId>;
  readonly toggle: (id: BoxId) => void;
}

/** Set by the Overview view, so ticking "I ran hancrafted-check-setup" can switch the whole Scene to ready. */
export const TicksContext = createContext<Ticks | null>(null);

/** The ticked boxes: transient client state (FE-001), so a reload starts clean. */
export function useTicks(): Ticks {
  const [ticked, setTicked] = useState<ReadonlySet<BoxId>>(new Set());
  const toggle = (id: BoxId) =>
    setTicked((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  return { ticked, toggle };
}
