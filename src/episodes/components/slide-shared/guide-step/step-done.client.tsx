'use client';

import { isReady, parseReadyFlags } from '@/episodes/lib/guide-ready-flags.pure';
import { useEffect, useState } from 'react';
import { StepDoneBadge } from './guide-step';

// decision: FE-001 §1
export function StepDone({ label }: { readonly label: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(isReady(parseReadyFlags(window.location.search)));
  }, []);
  return <StepDoneBadge ready={ready} label={label} />;
}
