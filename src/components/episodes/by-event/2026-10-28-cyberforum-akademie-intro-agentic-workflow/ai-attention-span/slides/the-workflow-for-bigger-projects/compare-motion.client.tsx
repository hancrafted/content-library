'use client';

import { useSlideEntry } from '@/hooks/use-slide-zone';
import { useState, type FocusEvent, type ReactNode } from 'react';
import { workflowLights } from './compare-motion.pure';

const TRIGGER = 'rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

/** The `data-play` value: absent at rest, then `a` and `b` in turn, so each replay restarts the keyframes. */
function useComparePlay() {
  const entry = useSlideEntry();
  const [entryAtMount] = useState(entry);
  const [replays, setReplays] = useState(0);
  const replay = () => setReplays((count) => count + 1);
  const plays = workflowLights({ entryAtMount, entry, replays });
  return { play: plays ? (replays % 2 === 0 ? 'a' : 'b') : undefined, replay };
}

/**
 * The comparison's trigger (design-ADR-0012 §9): the one long chat fades back as the workflow lights, once on the
 * Slide's first `active` and again on every mouse enter and keyboard focus. Only the `data-play` attribute toggles,
 * off and on again across a replay, so the panels and the Context markers in them stay mounted and keep focus. The
 * keyframes and reduced motion live in the Slide's CSS module.
 */
export function CompareMotion({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const { play, replay } = useComparePlay();
  // A click focuses the trigger after the pointer has already entered it: only keyboard focus replays.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.currentTarget.matches(':focus-visible')) replay();
  };
  return (
    <div role="group" aria-label={label} tabIndex={0} onMouseEnter={replay} onFocus={onFocus} className={TRIGGER}>
      <div data-play={play} className={className}>
        {children}
      </div>
    </div>
  );
}
