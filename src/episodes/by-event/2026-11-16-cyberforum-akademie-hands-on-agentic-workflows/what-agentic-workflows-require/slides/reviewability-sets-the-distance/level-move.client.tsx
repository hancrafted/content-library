'use client';

import { useSlideEntry } from '@/episodes/hooks/use-slide-zone';
import { Fragment, useState, type FocusEvent, type ReactNode } from 'react';
import { levelMovePlays } from './level-move.pure';
import styles from './reviewability-sets-the-distance.module.css';

const TRIGGER =
  'flex w-fit flex-wrap items-center gap-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

/** Whether the move plays, how often it has been replayed, and the replay on mouse enter and keyboard focus. */
function useLevelMove() {
  const entry = useSlideEntry();
  const [entryAtMount] = useState(entry);
  const [replays, setReplays] = useState(0);
  const replay = () => setReplays((count) => count + 1);
  // A click focuses the trigger after the pointer has already entered it: only keyboard focus replays.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.matches(':focus-visible')) replay();
  };
  return { plays: levelMovePlays({ entryAtMount, entry, replays }), replays, replay, onFocus };
}

interface LevelMoveProps {
  readonly label: string;
  /** The numbered callout, steady across replays. */
  readonly callout?: ReactNode;
  /** The former level's pill: stays put. */
  readonly from: ReactNode;
  /** The arrow and the new level's pill: replay, so they hold nothing focusable. */
  readonly arrow: ReactNode;
  readonly to: ReactNode;
}

/**
 * The activity's level move, its trigger (design-ADR-0012 §9): the pill slides from the dashed former level along the
 * arrow to its new level once on the Slide's first `active`, and again on every mouse enter and keyboard focus, by
 * mounting the moving part afresh. `data-play` is the CSS hook; the keyframes and reduced motion live in the Slide's
 * CSS module, whose base rules are the end state.
 */
export function LevelMove({ label, callout, from, arrow, to }: LevelMoveProps) {
  const { plays, replays, replay, onFocus } = useLevelMove();
  return (
    <div
      role="group"
      aria-label={label}
      tabIndex={0}
      onMouseEnter={replay}
      onFocus={onFocus}
      data-level-move
      data-play={plays ? '' : undefined}
      className={`${styles.move} ${TRIGGER}`}
    >
      {callout}
      {from}
      <Fragment key={replays}>
        <span className={styles.arrow}>{arrow}</span>
        <span className={styles.to}>{to}</span>
      </Fragment>
    </div>
  );
}
