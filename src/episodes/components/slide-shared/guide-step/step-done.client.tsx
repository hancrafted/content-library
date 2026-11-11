'use client';

import { isReady, parseReadyFlags } from '@/episodes/lib/guide-ready-flags.pure';
import { useEffect, useState } from 'react';
import { StepDoneBadge } from './guide-step';

/**
 * Reads the check skill's flags after mount (the static export has no server), so the badge appears only on the page
 * the check opened. Transient client state (FE-001): nothing is stored.
 */
export function StepDone({ label }: { readonly label: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(isReady(parseReadyFlags(window.location.search)));
  }, []);
  return <StepDoneBadge ready={ready} label={label} />;
}
