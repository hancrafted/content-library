import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './cashflow-board.module.css';
import { formatEuro, signedAmount, tiltOf, type Note } from './cashflow-board.pure';
import type { BoardLabels } from './cashflow-board.types';

const TINT = { cash: styles.cash, cost: styles.cost, revenue: styles.revenue } as const;

interface StickyNoteProps {
  note: Note;
  column: number;
  slot: number;
  /** The note's place in reading order, `--i`, which a Slide's entrance motion staggers by. */
  order: number;
  labels: BoardLabels;
  locale: string;
}

/** The note's list item attributes: its kind, its target and the custom properties its tilt and motion read. */
function placement({ note, column, slot, order }: StickyNoteProps) {
  const style = { '--i': order, '--tilt': `${tiltOf(column, slot)}deg` } as CSSProperties;
  const ring = note.ring ? 'true' : undefined;
  return { 'data-cashflow': 'note', 'data-kind': note.kind, 'data-target': note.target, 'data-ring': ring, style };
}

/** A dashed outline where a note used to be, its label in mono. */
function Ghost(props: StickyNoteProps) {
  return (
    <li {...placement(props)} className={cn(styles.note, props.note.big && styles.big)}>
      <div className="flex aspect-square items-center justify-center rounded-sm border-2 border-dashed border-muted-foreground/60 p-3 text-center font-mono text-caption text-muted-foreground uppercase">
        {props.labels.ghost}
      </div>
    </li>
  );
}

/** The note's amount; a big note writes a short amount, such as €0, at heading size. */
function Amount({ text, big }: { text: string; big: boolean }) {
  const size = big && text.length <= 4 ? 'text-heading' : 'text-body';
  return <span className={cn('font-semibold text-foreground tabular-nums', size)}>{text}</span>;
}

/** One square of paper: its kind in small mono at the top, its euro amount at the bottom, at its slot's tilt. */
export function StickyNote(props: StickyNoteProps) {
  const { note, labels, locale } = props;
  if (note.kind === 'ghost') return <Ghost {...props} />;
  const big = note.big === true;
  const amount = note.amount === undefined ? '' : formatEuro(signedAmount(note), locale);
  return (
    <li
      {...placement(props)}
      className={cn(
        styles.note,
        big && styles.big,
        'bg-card',
        big ? 'shadow-xl' : 'shadow-md',
        note.ring && 'ring-4 ring-primary ring-offset-4 ring-offset-muted',
      )}
    >
      <div className={cn(TINT[note.kind], 'flex aspect-square flex-col justify-between', big ? 'p-4' : 'p-3')}>
        <span className="font-mono text-caption text-foreground/70 uppercase">{labels[note.kind]}</span>
        <Amount text={amount} big={big} />
      </div>
    </li>
  );
}
