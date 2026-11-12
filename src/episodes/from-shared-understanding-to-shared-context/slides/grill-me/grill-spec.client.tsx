'use client';

import { useSlideEntry } from '@/episodes/hooks/use-slide-zone';
import { Fragment, useState, type FocusEvent, type ReactNode } from 'react';
import styles from './grill-me.module.css';
import { specSlides } from './grill-spec.pure';

const TRIGGER = 'rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

/**
 * The spec card's trigger: the card slides from the chat onto the bench on the Slide's first `active`, and again on
 * every mouse enter and keyboard focus, by mounting it afresh under `data-play`. The card holds nothing focusable,
 * since a replay mounts it again.
 */
export function GrillSpec({ label, children }: { label: string; children: ReactNode }) {
  const entry = useSlideEntry();
  const [entryAtMount] = useState(entry);
  const [replays, setReplays] = useState(0);
  const replay = () => setReplays((count) => count + 1);
  // A click focuses the trigger after the pointer has already entered it: only keyboard focus replays.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.matches(':focus-visible')) replay();
  };
  const plays = specSlides({ entryAtMount, entry, replays });
  return (
    <div role="group" aria-label={label} tabIndex={0} onMouseEnter={replay} onFocus={onFocus} className={TRIGGER}>
      <div data-play={plays ? '' : undefined} className={styles.spec}>
        <Fragment key={replays}>{children}</Fragment>
      </div>
    </div>
  );
}
