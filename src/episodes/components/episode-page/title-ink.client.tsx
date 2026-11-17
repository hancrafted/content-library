'use client';

import { LiquidInkTransition } from '@/shared/components/animations/liquid-ink-transition.client';
import { useSyncExternalStore } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

function useReducedOnClient(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(REDUCED).matches,
    () => true,
  );
}

export function TitleInk({ targetId }: { targetId: string }) {
  const reduced = useReducedOnClient();
  return reduced ? null : <LiquidInkTransition targetId={targetId} color="var(--background)" />;
}
