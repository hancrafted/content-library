'use client';

import { createContext, useState } from 'react';
import type { BoxId } from './start-step.pure';

export interface Ticks {
  readonly ticked: ReadonlySet<BoxId>;
  readonly toggle: (id: BoxId) => void;
}

export const TicksContext = createContext<Ticks | null>(null);

// decision: FE-001 §1
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
