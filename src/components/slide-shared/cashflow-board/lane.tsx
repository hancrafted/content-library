import { cn } from '@/lib/utils';
import styles from './cashflow-board.module.css';
import type { BoardLabels, CashflowColumn } from './cashflow-board.types';
import { placeOn } from './place-on';
import { StickyNote } from './sticky-note';

interface LaneProps {
  column: CashflowColumn;
  /** The column's number, counted from 1. */
  number: number;
  /** The reading-order index of the lane's first note. */
  firstOrder: number;
  highlighted: boolean;
  labels: BoardLabels;
  locale: string;
}

/** The three slots of a lane, top to bottom; an empty slot keeps its row and says nothing. */
function Slots({ column, number, firstOrder, labels, locale }: LaneProps) {
  let order = firstOrder;
  return (
    <ul role="list" className={styles.slots}>
      {[1, 2, 3].map((slot) => {
        const note = column.notes[slot - 1] ?? null;
        if (note === null) return <li key={slot} aria-hidden="true" />;
        const props = { note, column: number, slot, order: order++, labels, locale };
        return <StickyNote key={slot} {...props} />;
      })}
    </ul>
  );
}

/** One column of the board: a pale lane under a dark pill label, its notes, and its footer. */
export function Lane(props: LaneProps) {
  const { column, number, highlighted } = props;
  return (
    <li
      data-cashflow="lane"
      data-highlight={highlighted ? 'true' : undefined}
      style={placeOn(number)}
      className={cn(
        styles.lane,
        'relative rounded-xl border bg-muted px-2 pt-12 pb-5',
        highlighted && 'ring-4 ring-primary ring-offset-4 ring-offset-card',
      )}
    >
      <h4 className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-8 py-1.5 text-caption font-medium whitespace-nowrap text-background shadow-md">
        {column.label}
      </h4>
      <Slots {...props} />
      {column.footer ? <div className={styles.footer}>{column.footer}</div> : null}
    </li>
  );
}
