'use client';

import { useSlideEntry } from '@/hooks/use-slide-zone';
import { useState, type FocusEvent, type ReactNode } from 'react';
import { funnelPlays } from './funnel-motion.pure';

const TRIGGER = 'rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

/** Whether the dots play, how often they have been replayed, and the replay itself. */
function useFunnelPlay() {
  const entry = useSlideEntry();
  const [entryAtMount] = useState(entry);
  const [replays, setReplays] = useState(0);
  const replay = () => setReplays((count) => count + 1);
  return { plays: funnelPlays({ entryAtMount, entry, replays }), replays, replay };
}

/**
 * The funnel's trigger (FE-012 §4), which starts its dots' travel: once on the Slide's first `active`, and again on
 * every mouse enter and keyboard focus, by mounting the funnel inside it afresh. The trigger itself stays mounted, so
 * focus stays on it. `data-play` is the CSS hook; the keyframes and reduced motion live in the Slide's CSS module.
 */
export function FunnelMotion({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const { plays, replays, replay } = useFunnelPlay();
  // A click focuses the trigger after the pointer has already entered it: only keyboard focus replays.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.matches(':focus-visible')) replay();
  };
  return (
    <div role="group" aria-label={label} tabIndex={0} onMouseEnter={replay} onFocus={onFocus} className={TRIGGER}>
      <div key={replays} data-play={plays ? '' : undefined} className={className}>
        {children}
      </div>
    </div>
  );
}
