'use client';

import { useSlideEntry } from '@/hooks/use-slide-zone';
import { useState, type ReactNode } from 'react';
import { funnelPlays } from './funnel-motion.pure';

/**
 * The funnel's box, which starts its dots' travel: once on the Slide's first `active`, and again on every mouse
 * enter, by mounting the funnel afresh. `data-play` is the CSS hook; the keyframes and reduced motion live in the
 * Slide's CSS module.
 */
export function FunnelMotion({ className, children }: { className?: string; children: ReactNode }) {
  const entry = useSlideEntry();
  const [entryAtMount] = useState(entry);
  const [replays, setReplays] = useState(0);
  const plays = funnelPlays({ entryAtMount, entry, replays });
  return (
    <div
      key={replays}
      data-play={plays ? '' : undefined}
      onMouseEnter={() => setReplays((count) => count + 1)}
      className={className}
    >
      {children}
    </div>
  );
}
