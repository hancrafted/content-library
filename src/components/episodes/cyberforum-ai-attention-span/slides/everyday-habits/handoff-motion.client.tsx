'use client';

import { useSlideEntry } from '@/hooks/use-slide-zone';
import { Fragment, useState, type FocusEvent, type ReactNode } from 'react';
import { handoffLights } from './handoff-motion.pure';

const TRIGGER = 'rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

/** Whether the card lights, how often it has been replayed, and the replay itself. */
function useHandoffLight() {
  const entry = useSlideEntry();
  const [entryAtMount] = useState(entry);
  const [replays, setReplays] = useState(0);
  const replay = () => setReplays((count) => count + 1);
  return { lights: handoffLights({ entryAtMount, entry, replays }), replays, replay };
}

interface HandoffMotionProps {
  readonly label: string;
  readonly className?: string;
  /** The old chat's bar: never replays. */
  readonly before: ReactNode;
  /** The handoff card and its arrow: replays, so it holds nothing focusable. */
  readonly card: ReactNode;
  /** The fresh chat's bar: never replays. */
  readonly after: ReactNode;
}

/**
 * The bars' trigger (design-ADR-0012 §9): the handoff card between the two chats lights once on the Slide's first
 * `active`, and again on every mouse enter and keyboard focus, by mounting the card (`card`) afresh. The bars either
 * side stay mounted. `data-play` is the CSS hook; the keyframes and reduced motion live in the Slide's CSS module.
 */
export function HandoffMotion({ label, className, before, card, after }: HandoffMotionProps) {
  const { lights, replays, replay } = useHandoffLight();
  // A click focuses the trigger after the pointer has already entered it: only keyboard focus replays.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.matches(':focus-visible')) replay();
  };
  return (
    <div role="group" aria-label={label} tabIndex={0} onMouseEnter={replay} onFocus={onFocus} className={TRIGGER}>
      <div data-play={lights ? '' : undefined} className={className}>
        {before}
        <Fragment key={replays}>{card}</Fragment>
        {after}
      </div>
    </div>
  );
}
