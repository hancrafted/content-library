'use client';

import { LiquidInkTransition } from '@/shared/components/animations/liquid-ink-transition.client';
import { useSyncExternalStore } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

/** Reduced motion, read as true on the server so the static HTML draws no ink. */
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

/**
 * The landing page's liquid ink at the foot of an inverse Title slide, in the page's own background, so scrolling bleeds
 * the page up into the Slide as `targetId`, the first page Slide, arrives. The transition paints a full static fill when motion is reduced, which
 * would bury the hero, so under reduced motion the hero simply ends. Nothing is drawn in the static HTML.
 */
export function TitleInk({ targetId }: { targetId: string }) {
  const reduced = useReducedOnClient();
  return reduced ? null : <LiquidInkTransition targetId={targetId} color="var(--background)" />;
}
