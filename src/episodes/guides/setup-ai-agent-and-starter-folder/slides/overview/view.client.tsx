'use client';

import { parseReadyFlags, type ReadyFlags } from '@/episodes/lib/guide-ready-flags.pure';
import { useEffect, useState } from 'react';
import { ViewBody, type ViewBodyProps } from './readiness';
import { viewFor } from './ready-state.pure';
import { TicksContext, useTicks } from './ticks.client';

const NO_FLAGS: ReadyFlags = { skills: undefined, localSetup: undefined };

// decision: FE-001 §1
export function OverviewView(props: Omit<ViewBodyProps, 'view' | 'onReopen'>) {
  const [flags, setFlags] = useState<ReadyFlags>(NO_FLAGS);
  const ticks = useTicks();
  useEffect(() => {
    setFlags(parseReadyFlags(window.location.search));
  }, []);
  const ran = ticks.ticked.has('skill-ran');
  return (
    <TicksContext.Provider value={ticks}>
      <ViewBody view={viewFor(flags, ran)} onReopen={ran ? () => ticks.toggle('skill-ran') : undefined} {...props} />
    </TicksContext.Provider>
  );
}
