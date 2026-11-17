'use client';

import { useSlideEntry } from '@/episodes/hooks/use-slide-zone';
import { cn } from '@/shared/lib/utils';
import { Fragment, useState, type CSSProperties, type FocusEvent, type ReactNode } from 'react';
import { flowPlays } from './flow-motion.pure';

const TRIGGER = 'rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

function useFlowPlay() {
  const entry = useSlideEntry();
  const [entryAtMount] = useState(entry);
  const [replays, setReplays] = useState(0);
  const replay = () => setReplays((count) => count + 1);
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.matches(':focus-visible')) replay();
  };
  return { plays: flowPlays({ entryAtMount, entry, replays }), replays, replay, onFocus };
}

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
export function FlowMotion({
  label,
  className,
  delay,
  children,
}: {
  label: string;
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  const { plays, replays, replay, onFocus } = useFlowPlay();
  const style = delay === undefined ? undefined : ({ '--flow-delay': `${delay}ms` } as CSSProperties);
  return (
    <div
      role="group"
      aria-label={label}
      tabIndex={0}
      onMouseEnter={replay}
      onFocus={onFocus}
      className={cn(TRIGGER, className)}
    >
      <div data-play={plays ? '' : undefined} style={style}>
        <Fragment key={replays}>{children}</Fragment>
      </div>
    </div>
  );
}
