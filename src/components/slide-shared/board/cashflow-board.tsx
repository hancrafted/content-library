import type { TargetProps } from '@/lib/context-link.pure';
import type { Locale } from '@/lib/locale.pure';
import { cn } from '@/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import { formatAmount } from './amount.pure';
import { Board, type BoardColumnProps } from './board';
import { BoardArrow } from './board-arrow';
import styles from './cashflow-board.module.css';
import { StickyNote, type NoteTone } from './sticky-note';

/** The four fixed rows of every cashflow board, top to bottom: cash at the start, cost, revenue, cash at the end. */
export type CashSlot = 'opening' | 'cost' | 'revenue' | 'closing';

const SLOTS: readonly CashSlot[] = ['opening', 'cost', 'revenue', 'closing'];

/** The grid row of each slot: row 1 is the pill. */
const ROW: Readonly<Record<CashSlot, number>> = { opening: 2, cost: 3, revenue: 4, closing: 5 };

const TONE: Readonly<Record<CashSlot, NoteTone>> = {
  opening: 'neutral',
  cost: 'cost',
  revenue: 'revenue',
  closing: 'neutral',
};

export interface CashNote {
  slug: string;
  slot: CashSlot;
  label: string;
  /** Whole units of the board's `currency`; written by `locale`, compact below `sm`, in full from `sm`. */
  amount: number;
  /** The month cash hits zero: a warning note with the primary ring. */
  zeroCash?: boolean;
  primary?: boolean;
  target?: TargetProps;
}

export interface CashColumn {
  slug: string;
  label: string;
  primary?: boolean;
  /** A month the company never reaches: a dashed column. */
  outOfReach?: boolean;
  /** One note per slot. */
  notes: readonly CashNote[];
}

export interface CashflowBoardProps {
  columns: readonly CashColumn[];
  /** The page's locale, which writes every amount. */
  locale: Locale;
  /** An ISO 4217 code, such as `USD`. */
  currency: string;
  /** A stamp across one month; `column` is 1-based. */
  stamp?: { text: string; column: number };
  /** An arrow across the columns strictly between `from` and `to` (1-based), in the row of `slot`. */
  arrow?: { from: number; to: number; slot: CashSlot; label?: string; target?: TargetProps };
  /** Layered states the Slide places itself, painted last: its own grid-column, grid-row and `--i`. */
  overlays?: ReactNode;
  target?: TargetProps;
  noteClassName?: string;
  stampClassName?: string;
  arrowClassName?: string;
}

const bySlot = (a: CashNote, b: CashNote) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot);

/** How a note writes its amount: below `sm` compact, so four columns fit a phone; from `sm` in full. */
interface AmountFormat {
  readonly locale: Locale;
  readonly currency: string;
}

function Amount({ value, format }: { value: number; format: AmountFormat }) {
  const { full, compact } = formatAmount(value, format.currency, format.locale);
  return (
    <>
      <span data-amount="compact" className="sm:hidden">
        {compact}
      </span>
      <span data-amount="full" className="hidden sm:inline">
        {full}
      </span>
    </>
  );
}

function Note({
  note,
  index,
  format,
  className,
}: {
  note: CashNote;
  index: number;
  format: AmountFormat;
  className?: string;
}) {
  return (
    <StickyNote
      tone={note.zeroCash ? 'warning' : TONE[note.slot]}
      primary={note.zeroCash || note.primary}
      label={note.label}
      value={<Amount value={note.amount} format={format} />}
      target={note.target}
      dataSlot={note.slug}
      style={{ '--i': index, gridRow: ROW[note.slot] } as CSSProperties}
      className={className}
    />
  );
}

/** The board's columns with their notes placed, and the reading-order index of the stamp and of the next item. */
function placeNotes(
  columns: readonly CashColumn[],
  stampColumn: number | undefined,
  { format, noteClassName }: { format: AmountFormat; noteClassName?: string },
): { columns: BoardColumnProps[]; stampIndex?: number; next: number } {
  let next = 0;
  let stampIndex: number | undefined;
  const placed = columns.map((column, position) => {
    const notes = [...column.notes]
      .sort(bySlot)
      .map((note) => <Note key={note.slug} note={note} index={next++} format={format} className={noteClassName} />);
    if (stampColumn === position + 1) stampIndex = next++;
    const { slug, label, primary, outOfReach } = column;
    return { slug, label, primary, dashed: outOfReach, children: notes };
  });
  return { columns: placed, stampIndex, next };
}

function Stamp({
  text,
  column,
  index,
  className,
}: {
  text: string;
  column: number;
  index?: number;
  className?: string;
}) {
  return (
    <p
      data-board-stamp=""
      style={{ '--i': index, '--col': column } as CSSProperties}
      className={cn(styles.stamp, 'rounded-md px-4 py-1 text-heading font-semibold uppercase', className)}
    >
      {text}
    </p>
  );
}

function Arrow({
  from,
  to,
  slot,
  label,
  target,
  index,
  className,
}: NonNullable<CashflowBoardProps['arrow']> & { index: number; className?: string }) {
  const style = {
    '--i': index,
    gridColumn: `${Math.min(from, to) + 1} / ${Math.max(from, to)}`,
    gridRow: ROW[slot],
  } as CSSProperties;
  return (
    <BoardArrow
      direction={from > to ? 'left' : 'right'}
      label={label}
      target={target}
      style={style}
      className={cn(styles.arrow, className)}
    />
  );
}

/**
 * The cashflow board the Episode returns to: one column per month, notes in four fixed rows, so a note keeps its
 * row on every board. Each note, the stamp and the arrow carry `--i` in reading order (column by column, row by
 * row; the stamp right after its column, the arrow last) for the Slide's motion classes. Paint order: columns,
 * stamp, arrow, then the Slide's overlays. A server part with plain props (FE-007 §5.2).
 */
export function CashflowBoard(props: CashflowBoardProps) {
  const { stamp, arrow, overlays, target, locale, currency } = props;
  const placed = placeNotes(props.columns, stamp?.column, {
    format: { locale, currency },
    noteClassName: props.noteClassName,
  });
  const overlay = (
    <>
      {stamp && <Stamp {...stamp} index={placed.stampIndex} className={props.stampClassName} />}
      {arrow && <Arrow {...arrow} index={placed.next} className={props.arrowClassName} />}
      {overlays}
    </>
  );
  return <Board columns={placed.columns} rows={SLOTS.length} overlay={overlay} target={target} />;
}
