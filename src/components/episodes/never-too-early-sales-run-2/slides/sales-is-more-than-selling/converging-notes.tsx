import { Board } from '@/components/slide-shared/board/board';
import { BoardArrow } from '@/components/slide-shared/board/board-arrow';
import { StickyNote } from '@/components/slide-shared/board/sticky-note';
import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './sales-is-more-than-selling.module.css';

interface PayoffNote {
  slug: string;
  label: string;
  line: string;
  target: TargetProps;
}

export interface ConvergingNotesProps {
  /** The sentence the board reads as. */
  label: string;
  /** The three payoffs, top to bottom. */
  notes: readonly PayoffNote[];
  outcome: { label: string; line: string };
}

const ROWS = ['row-start-1', 'row-start-2', 'row-start-3'] as const;

/** `--i` for the library motions: the payoffs 0 to 2, their arrows 3 to 5, the outcome last. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;

function Payoffs({ notes }: Pick<ConvergingNotesProps, 'notes'>) {
  return (
    <ul role="list" className="contents">
      {notes.map((note, i) => (
        <li key={note.slug} className={cn('col-start-1', ROWS[i])}>
          <StickyNote
            tone="neutral"
            fill
            label={note.label}
            target={note.target}
            style={order(i)}
            className={styles.note}
          >
            {note.line}
          </StickyNote>
        </li>
      ))}
    </ul>
  );
}

/** One arrow per payoff row, filling the middle column from note edge to outcome edge. */
function Arrows({ notes }: Pick<ConvergingNotesProps, 'notes'>) {
  return notes.map((note, i) => (
    <BoardArrow
      key={note.slug}
      direction="right"
      style={order(notes.length + i)}
      className={cn(styles.arrow, 'col-start-2 self-center', ROWS[i])}
    />
  ));
}

/**
 * Three payoff notes in one column, each with an arrow into one outcome note as tall as all three rows. The grid
 * switches on the surface's own width, so it keeps three columns at every width and beside the Context drawer. A
 * Slide-local server part with plain props (FE-007 §5.2).
 */
export function ConvergingNotes({ label, notes, outcome }: ConvergingNotesProps) {
  return (
    <Board aria-label={label} className="max-w-5xl">
      <div className="@container">
        <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] grid-rows-3 gap-y-4 @2xl:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)] @2xl:gap-y-6">
          <Payoffs notes={notes} />
          <Arrows notes={notes} />
          <div className="col-start-3 row-span-3 row-start-1">
            <StickyNote
              tone="neutral"
              fill
              primary
              label={outcome.label}
              style={order(notes.length * 2)}
              className={cn(styles.note, 'h-full')}
            >
              {outcome.line}
            </StickyNote>
          </div>
        </div>
      </div>
    </Board>
  );
}
