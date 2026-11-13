'use client';

import { useSlideEntry } from '@/episodes/hooks/use-slide-zone';
import { cn } from '@/shared/lib/utils';
import { Fragment, useState, type CSSProperties, type FocusEvent, type ReactNode } from 'react';
import { flowPlays } from './flow-motion.pure';

const TRIGGER = 'rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

/** Whether the flow plays, how often it has been replayed, and the replays a pointer or keyboard focus starts. */
function useFlowPlay() {
  const entry = useSlideEntry();
  const [entryAtMount] = useState(entry);
  const [replays, setReplays] = useState(0);
  const replay = () => setReplays((count) => count + 1);
  // A click focuses the trigger after the pointer has already entered it: only keyboard focus replays.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.matches(':focus-visible')) replay();
  };
  return { plays: flowPlays({ entryAtMount, entry, replays }), replays, replay, onFocus };
}

/**
 * The trigger of the factory line's flow (design-ADR-0012 §9): it plays once on the Slide's first `active`, and again
 * on every mouse enter and keyboard focus, by mounting its children afresh under `data-play`, the CSS hook the line's
 * documents and a Scene's own parts animate on. `delay` holds the documents back while something else moves first.
 * The children must hold nothing focusable, since a replay mounts them again.
 */
export function FlowMotion({
  label,
  className,
  delay,
  children,
}: {
  label: string;
  className?: string;
  /** How long the documents wait before they ride in, in milliseconds. */
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
