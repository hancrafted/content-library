'use client';

import { useSlideEntry } from '@/episodes/hooks/use-slide-zone';
import { Fragment, useState, type FocusEvent, type ReactNode } from 'react';
import { funnelPlays } from './funnel-motion.pure';

const TRIGGER = 'rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

function useFunnelPlay() {
  const entry = useSlideEntry();
  const [entryAtMount] = useState(entry);
  const [replays, setReplays] = useState(0);
  const replay = () => setReplays((count) => count + 1);
  return { plays: funnelPlays({ entryAtMount, entry, replays }), replays, replay };
}

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
export function FunnelMotion({
  label,
  className,
  still,
  children,
}: {
  label: string;
  className?: string;
  still: ReactNode;
  children: ReactNode;
}) {
  const { plays, replays, replay } = useFunnelPlay();
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.matches(':focus-visible')) replay();
  };
  return (
    <div role="group" aria-label={label} tabIndex={0} onMouseEnter={replay} onFocus={onFocus} className={TRIGGER}>
      <div data-play={plays ? '' : undefined} className={className}>
        {still}
        <Fragment key={replays}>{children}</Fragment>
      </div>
    </div>
  );
}
