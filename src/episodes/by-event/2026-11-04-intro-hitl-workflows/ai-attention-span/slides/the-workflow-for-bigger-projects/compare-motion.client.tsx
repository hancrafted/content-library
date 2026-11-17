'use client';

import { useSlideEntry } from '@/episodes/hooks/use-slide-zone';
import { useState, type FocusEvent, type ReactNode } from 'react';
import { workflowLights } from './compare-motion.pure';

const TRIGGER = 'rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

function useComparePlay() {
  const entry = useSlideEntry();
  const [entryAtMount] = useState(entry);
  const [replays, setReplays] = useState(0);
  const replay = () => setReplays((count) => count + 1);
  const plays = workflowLights({ entryAtMount, entry, replays });
  return { play: plays ? (replays % 2 === 0 ? 'a' : 'b') : undefined, replay };
}

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
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
