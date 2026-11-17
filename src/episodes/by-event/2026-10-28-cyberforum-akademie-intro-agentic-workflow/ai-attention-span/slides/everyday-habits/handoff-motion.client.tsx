'use client';

import { useSlideEntry } from '@/episodes/hooks/use-slide-zone';
import { Fragment, useState, type FocusEvent, type ReactNode } from 'react';
import { handoffLights } from './handoff-motion.pure';

const TRIGGER = 'rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

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
  readonly before: ReactNode;
  readonly card: ReactNode;
  readonly after: ReactNode;
}

// decision: docs/decision-records/0012-slide-header-and-play-once-motion.md
export function HandoffMotion({ label, className, before, card, after }: HandoffMotionProps) {
  const { lights, replays, replay } = useHandoffLight();
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
