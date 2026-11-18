'use client';

import { useSlideEntry } from '@/episodes/hooks/use-slide-zone';
import { Fragment, useState, type FocusEvent, type ReactNode } from 'react';
import { levelMovePlays } from './level-move.pure';
import styles from './reviewability-sets-the-distance.module.css';

const TRIGGER =
  'flex w-fit flex-wrap items-center gap-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

function useLevelMove() {
  const entry = useSlideEntry();
  const [entryAtMount] = useState(entry);
  const [replays, setReplays] = useState(0);
  const replay = () => setReplays((count) => count + 1);
  const replayOnKeyboardFocusOnly = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.matches(':focus-visible')) replay();
  };
  return { plays: levelMovePlays({ entryAtMount, entry, replays }), replays, replay, replayOnKeyboardFocusOnly };
}

interface LevelMoveProps {
  readonly label: string;
  readonly callout?: ReactNode;
  readonly from: ReactNode;
  readonly arrow: ReactNode;
  readonly to: ReactNode;
}

// decision: docs/decision-records/0012-slide-header-and-play-once-motion.md
export function LevelMove({ label, callout, from, arrow, to }: LevelMoveProps) {
  const { plays, replays, replay, replayOnKeyboardFocusOnly } = useLevelMove();
  return (
    <div
      role="group"
      aria-label={label}
      tabIndex={0}
      onMouseEnter={replay}
      onFocus={replayOnKeyboardFocusOnly}
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
