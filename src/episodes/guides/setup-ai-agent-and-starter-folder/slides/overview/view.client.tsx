'use client';

import { useEffect, useState } from 'react';
import { ViewBody, type ViewBodyProps } from './readiness';
import { decideView, parseReadyFlags, type OverviewView } from './ready-state.pure';

/**
 * Reads the real query string after mount (the static export has no server): the normal view ships in the HTML and
 * switches once the page has hydrated. The view is transient client state (FE-001).
 */
export function OverviewView(props: Omit<ViewBodyProps, 'view'>) {
  const [view, setView] = useState<OverviewView>({ kind: 'normal' });
  useEffect(() => {
    setView(decideView(parseReadyFlags(window.location.search)));
  }, []);
  return <ViewBody view={view} {...props} />;
}
