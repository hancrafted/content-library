import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './cashflow-board.module.css';
import { checkBoard, formatEuro, LANE_ROWS } from './cashflow-board.pure';
import type { CashflowBoardProps } from './cashflow-board.types';
import { Lane } from './lane';
import { Annotation, Arrow, Stamp } from './overlays';

// The part's public names; the remaining prop types (`Note`, `BoardCell`, `CashflowAnnotation`, …) are in
// `cashflow-board.types.ts` and `cashflow-board.pure.ts`.
export { cashLeft } from './cashflow-board.pure';
export type { CashflowBoardProps, CashflowColumn } from './cashflow-board.types';

/**
 * The cashflow board (Slides 1, 6 and 10 of "Why it's never too early to start with sales"): month lanes under dark
 * pills on a dotted card, three square paper notes per lane tinted as cash, cost or revenue, with an optional stamp,
 * arrow, ringed column and a row of call-outs and brackets, all placed on the lanes' grid by column and slot. All
 * lanes stand side by side when the board is wide enough, two by two when it is not.
 */
export function CashflowBoard(props: CashflowBoardProps) {
  const { columns, labels, locale, stamp, arrow, highlight, annotations = [] } = props;
  checkBoard({ ...props, count: columns.length });
  const firstOrders = columns.map((_, index) =>
    columns.slice(0, index).reduce((sum, column) => sum + column.notes.filter(Boolean).length, 0),
  );
  const gridStyle = { '--lanes': columns.length, '--lane-rows': LANE_ROWS } as CSSProperties;
  return (
    <div data-slot="cashflow-board" className={cn(styles.board, 'rounded-xl border bg-card shadow-md')}>
      <div className={styles.grid} style={gridStyle}>
        <ol role="list" aria-label={labels.board} className={styles.lanes}>
          {columns.map((column, index) => (
            <Lane
              key={column.label}
              {...{ column, labels, locale }}
              number={index + 1}
              firstOrder={firstOrders[index]}
              highlighted={highlight === index + 1}
            />
          ))}
        </ol>
        {arrow ? <Arrow {...arrow} /> : null}
        {stamp ? <Stamp {...stamp} /> : null}
        {annotations.map((annotation) => (
          <Annotation key={`${annotation.kind}-${annotation.column}`} {...annotation} />
        ))}
      </div>
    </div>
  );
}

/** A column's footer: a thin rule, the label in small mono on the left, the balance on the right, red when negative. */
export function CashLeft({ label, amount, locale }: { label: string; amount: number; locale: string }) {
  return (
    <p className="flex flex-wrap items-baseline justify-between gap-x-2 border-t border-foreground/15 pt-3">
      <span className="font-mono text-caption text-muted-foreground uppercase">{label}</span>
      <span className={cn('text-body font-semibold tabular-nums', amount < 0 ? 'text-destructive' : 'text-foreground')}>
        {formatEuro(amount, locale)}
      </span>
    </p>
  );
}
