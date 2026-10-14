import { BoardNote } from '@/components/slide-shared/board-note';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './why-it-takes-time-to-ramp-up.module.css';

/** One row template for the header row and every row: notes side by side from 448px, the title a column from 768px. */
export const ROW_TEMPLATE =
  '@md:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] @md:gap-3 @3xl:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_2rem_minmax(0,1fr)] @3xl:gap-6 @3xl:items-center';

interface RampRowProps {
  index: number;
  title: string;
  lack: string;
  unlock: string;
  lackHeader: string;
  unlockHeader: string;
  'data-target'?: string;
}

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-6 rotate-90 justify-self-center stroke-current text-muted-foreground @md:rotate-0"
    >
      <path
        d="M3 12h17m-5-5 5 5-5 5"
        pathLength={1}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.draw}
      />
    </svg>
  );
}

/**
 * One reason a pipeline needs months: what you don't have yet (dashed), an
 * arrow, and how you get it (solid). Each note names its column for screen
 * readers, since the column headers hide below 448px. Server only, plain props.
 */
export function RampRow({ index, title, lack, unlock, lackHeader, unlockHeader, ...rest }: RampRowProps) {
  return (
    <li
      data-target={rest['data-target']}
      style={{ '--row': index - 1 } as CSSProperties}
      className={cn('grid grid-cols-1 gap-3 py-6', ROW_TEMPLATE)}
    >
      <h4 className={cn(styles.place, 'text-body font-semibold text-foreground @md:col-span-3 @3xl:col-span-1')}>
        <span className="mr-2 text-caption text-muted-foreground tabular-nums">{index}</span>
        {title}
      </h4>
      <BoardNote tone="unknown" className={cn(styles.place, 'min-w-0 p-4')}>
        <span className="sr-only">{lackHeader}: </span>
        {lack}
      </BoardNote>
      <Arrow />
      <BoardNote className={cn(styles.land, 'min-w-0 p-4')}>
        <span className="sr-only">{unlockHeader}: </span>
        {unlock}
      </BoardNote>
    </li>
  );
}
