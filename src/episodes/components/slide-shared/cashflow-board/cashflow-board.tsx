import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './cashflow-board.module.css';
import { checkBoard, formatEuro, slotRows } from './cashflow-board.pure';
import type { CashflowBoardProps } from './cashflow-board.types';
import { Lane } from './lane';
import { Annotation, Arrow, Stamp } from './overlays';

export { cashLeft } from './cashflow-board.pure';
export type { CashflowBoardProps, CashflowColumn } from './cashflow-board.types';

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
  target?: string;
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
