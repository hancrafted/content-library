import { cn } from '@/lib/utils';
import { useId, type CSSProperties } from 'react';
import styles from './cashflow-board.module.css';

export type CashflowRow = 'cash' | 'cost' | 'revenue';

export interface CashflowNote {
  readonly row: CashflowRow;
  /** Localized amount as shown, e.g. "$50k" / "50k $". */
  readonly amount: string;
  /** The zero-cash note: `destructive` surface instead of `info`. Cash notes only; on a cost or revenue note it throws. */
  readonly zero?: boolean;
  /** Month id this note slid in from: it carries the `primary` ring, its old cell keeps a dashed outline, and the entrance slides it from there. */
  readonly movedFrom?: string;
  /** `data-target` for a Speaker note item. */
  readonly target?: string;
}

export interface CashflowMonth {
  /** `'jan' | 'feb' | …`; the list order is the column order. */
  readonly id: string;
  readonly label: string;
  /** At most one per row. */
  readonly notes: readonly CashflowNote[];
}

export interface CashflowBoardProps {
  /** Accessible name of the board figure. */
  readonly label: string;
  /** Row heads (md+) and the kind word printed on every note. */
  readonly rowLabels: Readonly<Record<CashflowRow, string>>;
  readonly months: readonly CashflowMonth[];
  /** Rotated stamp over one month's cash and cost cells. */
  readonly stamp?: { readonly month: string; readonly text: string; readonly target?: string };
  /** One arrow under the revenue row, drawn from `from` back to `to`. */
  readonly arrow?: { readonly from: string; readonly to: string; readonly label?: string; readonly target?: string };
  /** A dashed gutter line after one month, as a note target. */
  readonly gap?: { readonly after: string; readonly target: string };
  readonly 'data-target'?: string;
}

type Columns = ReadonlyMap<string, number>;

const ROWS: readonly CashflowRow[] = ['cash', 'cost', 'revenue'];

// The global status tokens (FE-011), as `bg-(--info)`: `tests/boundaries/no-daisyui.test.ts` reads the bare utility as a DaisyUI leftover.
const NOTE_SURFACE: Readonly<Record<CashflowRow, string>> = {
  cash: 'bg-(--info) text-info-foreground',
  cost: 'bg-(--warning) text-warning-foreground',
  revenue: 'bg-(--success) text-success-foreground',
};

/** Plain numbers as inline custom properties: they carry no colour or size (FE-011). */
function vars(values: Readonly<Record<string, number>>): CSSProperties {
  return values as CSSProperties;
}

/** The column index of every month id; throws on a repeated id. */
function columnsOf(months: readonly CashflowMonth[]): Columns {
  const columns = new Map<string, number>();
  months.forEach((month, index) => {
    if (columns.has(month.id)) throw new Error(`CashflowBoard: month "${month.id}" twice.`);
    columns.set(month.id, index);
  });
  return columns;
}

function requireMonth(columns: Columns, id: string): number {
  const column = columns.get(id);
  if (column === undefined) throw new Error(`CashflowBoard: unknown month "${id}".`);
  return column;
}

function validateMonth(month: CashflowMonth, columns: Columns): void {
  const seen = new Set<CashflowRow>();
  for (const note of month.notes) {
    if (seen.has(note.row)) throw new Error(`CashflowBoard: two notes in the ${note.row} row of "${month.id}".`);
    seen.add(note.row);
    if (note.zero && note.row !== 'cash') {
      throw new Error(`CashflowBoard: zero on a ${note.row} note of "${month.id}"; only a cash note can hit zero.`);
    }
    if (note.movedFrom !== undefined) requireMonth(columns, note.movedFrom);
  }
}

/** The checks the props' types cannot make, so a wrong board fails the build instead of drawing a lie. */
function validate({ months, stamp, arrow, gap }: CashflowBoardProps, columns: Columns): void {
  months.forEach((month) => validateMonth(month, columns));
  const named = [stamp?.month, arrow?.from, arrow?.to, gap?.after];
  named.forEach((id) => id !== undefined && requireMonth(columns, id));
}

function noteClass(note: CashflowNote): string {
  const moved = note.movedFrom !== undefined;
  return cn(
    styles.note,
    styles[note.row],
    'flex min-w-0 flex-col rounded-sm p-1 shadow-sm sm:p-2',
    note.zero ? 'bg-destructive text-destructive-foreground' : NOTE_SURFACE[note.row],
    moved && [styles.moved, 'ring-2 ring-primary ring-offset-2 ring-offset-muted'],
  );
}

function Note({ note, kind, shift }: { note: CashflowNote; kind: string; shift: number }) {
  return (
    <li data-target={note.target} style={vars({ '--shift': shift })} className={noteClass(note)}>
      <span className="text-caption">{kind}</span>
      <span className="text-body font-semibold wrap-anywhere">{note.amount}</span>
    </li>
  );
}

interface PanelProps {
  readonly month: CashflowMonth;
  readonly column: number;
  readonly columns: Columns;
  readonly rowLabels: CashflowBoardProps['rowLabels'];
  /** Rows whose note moved away from this month: each keeps an empty dashed cell. */
  readonly leftRows: readonly CashflowRow[];
  readonly labelId: string;
}

function MonthPanel({ month, column, columns, rowLabels, leftRows, labelId }: PanelProps) {
  const shiftOf = (note: CashflowNote) => (note.movedFrom === undefined ? 0 : columns.get(note.movedFrom)! - column);
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      style={vars({ '--col': column })}
      className={cn(styles.month, 'rounded-lg bg-muted px-1 py-2 md:p-2')}
    >
      <span
        id={labelId}
        className="justify-self-center rounded-full bg-card px-3 text-caption font-medium text-muted-foreground"
      >
        {month.label}
      </span>
      <ol className={styles.notes}>
        {month.notes.map((note) => (
          <Note key={note.row} note={note} kind={rowLabels[note.row]} shift={shiftOf(note)} />
        ))}
        {leftRows.map((row) => (
          <li
            key={`left-${row}`}
            aria-hidden="true"
            className={cn(styles[row], 'rounded-sm border border-dashed border-border')}
          />
        ))}
      </ol>
    </div>
  );
}

function Arrow({ arrow, columns }: { arrow: NonNullable<CashflowBoardProps['arrow']>; columns: Columns }) {
  const from = columns.get(arrow.from)!;
  const to = columns.get(arrow.to)!;
  return (
    <div
      data-target={arrow.target}
      style={vars({ '--start': Math.min(from, to), '--end': Math.max(from, to) })}
      className={cn(styles.arrow, 'flex flex-col items-center gap-1')}
    >
      <div
        className={cn(styles.shaft, to < from ? styles.leftward : styles.rightward, 'relative h-0.5 w-full bg-primary')}
      >
        <span aria-hidden="true" className={cn(styles.head, 'absolute top-1/2 size-3 bg-primary')} />
      </div>
      {arrow.label && <span className="text-caption font-medium text-primary">{arrow.label}</span>}
    </div>
  );
}

function Stamp({ stamp, column }: { stamp: NonNullable<CashflowBoardProps['stamp']>; column: number }) {
  return (
    <span
      data-target={stamp.target}
      style={vars({ '--col': column })}
      className={cn(
        styles.stamp,
        'relative z-10 place-self-center -rotate-12 rounded-md border-2 border-destructive bg-card px-3 text-subheading font-semibold tracking-widest text-destructive uppercase',
      )}
    >
      {stamp.text}
    </span>
  );
}

function RowHeads({ rowLabels }: { rowLabels: CashflowBoardProps['rowLabels'] }) {
  return ROWS.map((row) => (
    <span
      key={row}
      className={cn(styles.rowHead, styles[row], 'hidden self-center text-caption text-muted-foreground md:block')}
    >
      {rowLabels[row]}
    </span>
  ));
}

/** A dashed line in the gutter after one month. */
function Gap({ target, column }: { target: string; column: number }) {
  return (
    <div
      aria-hidden="true"
      data-target={target}
      style={vars({ '--col': column })}
      className={cn(styles.gap, 'border-l border-dashed border-border')}
    />
  );
}

function leftRowsOf(months: readonly CashflowMonth[], id: string): CashflowRow[] {
  return months.flatMap((month) => month.notes.filter((note) => note.movedFrom === id).map((note) => note.row));
}

/**
 * The Episode's cashflow board: one column per month, sticky notes in three
 * rows (cash, cost, revenue). Server only, plain props (FE-007 §5.2). The base
 * styles are the finished board; the entrance plays only on the active Slide
 * and never under reduced motion (FE-009 §6).
 */
export function CashflowBoard(props: CashflowBoardProps) {
  const { label, rowLabels, months, stamp, arrow, gap } = props;
  const columns = columnsOf(months);
  validate(props, columns);
  const baseId = useId();
  return (
    <figure
      aria-label={label}
      data-target={props['data-target']}
      style={vars({ '--months': months.length })}
      className={cn(styles.board, 'w-full')}
    >
      <RowHeads rowLabels={rowLabels} />
      {months.map((month, column) => (
        <MonthPanel
          key={month.id}
          {...{ month, column, columns, rowLabels }}
          leftRows={leftRowsOf(months, month.id)}
          labelId={`${baseId}-${month.id}`}
        />
      ))}
      {gap && <Gap target={gap.target} column={columns.get(gap.after)!} />}
      {stamp && <Stamp stamp={stamp} column={columns.get(stamp.month)!} />}
      {arrow && <Arrow arrow={arrow} columns={columns} />}
    </figure>
  );
}
