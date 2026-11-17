import { cn } from '@/shared/lib/utils';
import styles from './cashflow-board.module.css';
import type { BoardLabels, CashflowColumn } from './cashflow-board.types';
import { placeOn } from './place-on';
import { StickyNote } from './sticky-note';

interface LaneProps {
  column: CashflowColumn;
  number: number;
  highlighted: boolean;
  labels: BoardLabels;
  locale: string;
  slots: number;
}

function Slots({ column, number, labels, locale, slots }: LaneProps) {
  return (
    <ul role="list" className={styles.slots}>
      {Array.from({ length: slots }, (_, index) => index + 1).map((slot) => {
        const note = column.notes[slot - 1] ?? null;
        if (note === null) return <li key={slot} aria-hidden="true" />;
        const props = { note, column: number, slot, labels, locale };
        return <StickyNote key={slot} {...props} />;
      })}
    </ul>
  );
}

export function Lane(props: LaneProps) {
  const { column, number, highlighted } = props;
  return (
    <li
      data-cashflow="lane"
      data-highlight={highlighted ? 'true' : undefined}
      style={placeOn(number)}
      className={cn(
        styles.lane,
        'focus-group__item',
        'relative rounded-xl border bg-muted px-2 pt-12 pb-5',
        highlighted && 'ring-4 ring-primary ring-offset-4 ring-offset-card',
      )}
    >
      <h4 className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-8 py-1.5 text-caption font-medium whitespace-nowrap text-background shadow-md">
        {column.label}
      </h4>
      {column.marker}
      <Slots {...props} />
      {column.footer ? <div className={styles.footer}>{column.footer}</div> : null}
    </li>
  );
}
