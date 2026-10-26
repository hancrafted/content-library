'use client';

import { useSlideEntry } from '@/episodes/hooks/use-slide-zone';
import { Fragment, useState, type FocusEvent, type ReactNode } from 'react';
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
 * The funnel's trigger (design-ADR-0012 §9), which starts its dots' travel: once on the Slide's first `active`, and again on
 * every mouse enter and keyboard focus, by mounting the moving part (`children`) afresh. The trigger and the `still`
 * part stay mounted, so focus on the trigger or on a Context marker in the still part survives a replay. `data-play`
 * is the CSS hook; the keyframes and reduced motion live in the Slide's CSS module.
 */
export function FunnelMotion({
  label,
  className,
  still,
  children,
}: {
  label: string;
  className?: string;
  /** What never replays, and may hold something focusable. */
  still: ReactNode;
  /** What replays: nothing focusable, as it is mounted afresh. */
  children: ReactNode;
}) {
  const { plays, replays, replay } = useFunnelPlay();
  // A click focuses the trigger after the pointer has already entered it: only keyboard focus replays.
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
