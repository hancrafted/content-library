import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './cashflow-board.module.css';
import { checkBoard, formatEuro, slotRows } from './cashflow-board.pure';
import type { CashflowBoardProps } from './cashflow-board.types';
import { Lane } from './lane';
import { Annotation, Arrow, Stamp } from './overlays';

// The part's public names; the remaining prop types (`Note`, `BoardCell`, `CashflowAnnotation`, …) are in
// `cashflow-board.types.ts` and `cashflow-board.pure.ts`.
export { cashLeft } from './cashflow-board.pure';
export type { CashflowBoardProps, CashflowColumn } from './cashflow-board.types';

/**
 * The cashflow board (Slides 1, 6 and 10 of "Why it's never too early to start with sales"): month lanes under dark
 * pills on a dotted card, up to three square paper notes per lane tinted as cash, cost or revenue, the lanes only as
 * tall as the lowest note, stamp or arrow label reaches (`slotRows`); a lane may hold a Context marker in its corner
 * and a footer under it. An optional stamp, arrow, ringed column and a row of call-outs and brackets are all placed on
 * the lanes' grid by column and slot. All lanes stand side by side when the board is wide enough, two by two when it
 * is not; pointing at one dims the others.
 */
export function CashflowBoard(props: CashflowBoardProps) {
  const { columns, labels, locale, stamp, arrow, highlight, annotations = [] } = props;
  checkBoard({ ...props, count: columns.length });
  const slots = slotRows(props);
  const gridStyle = { '--lanes': columns.length, '--lane-rows': slots + 1 } as CSSProperties;
  return (
    <div data-slot="cashflow-board" className={cn(styles.board, 'rounded-xl border bg-card shadow-md')}>
      <div className={styles.grid} style={gridStyle}>
        <ol role="list" aria-label={labels.board} className={cn(styles.lanes, 'focus-group focus-group--dim-others')}>
          {columns.map((column, index) => (
            <Lane
              key={column.label}
              {...{ column, labels, locale, slots }}
              number={index + 1}
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
export function CashLeft({
  label,
  amount,
  locale,
  target,
  marker,
}: {
  label: string;
  amount: number;
  locale: string;
  /** The Context drawer target the line carries, the value a Slide kit's `target(…)` names. */
  target?: string;
  /** A Context marker beside the label. */
  marker?: ReactNode;
}) {
  return (
    <p
      data-target={target}
      className="flex flex-wrap items-baseline justify-between gap-x-2 border-t border-foreground/15 pt-3"
    >
      <span className="inline-flex items-center gap-1 font-mono text-caption text-muted-foreground uppercase">
        {label}
        {marker}
      </span>
      <span className={cn('text-body font-semibold tabular-nums', amount < 0 ? 'text-destructive' : 'text-foreground')}>
        {formatEuro(amount, locale)}
      </span>
    </p>
  );
}
