'use client';

import { useEffect, useState } from 'react';
import { ViewBody, type ViewBodyProps } from './readiness';
import { parseReadyFlags, viewFor, type ReadyFlags } from './ready-state.pure';
import { TicksContext, useTicks } from './ticks.client';

const NO_FLAGS: ReadyFlags = { skills: undefined, localSetup: undefined };

/**
 * Reads the real query string after mount (the static export has no server): the normal view ships in the HTML and
 * switches once the page has hydrated. The ticks live here, so ticking "I ran check-workshop-readiness" shows the same
 * ready view as the flags do. All of it is transient client state (FE-001).
 */
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
