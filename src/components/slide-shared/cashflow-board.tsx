import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import styles from './cashflow-board.module.css';

/*
 * The cashflow board several Slides share: a monthly sticky-note board of
 * cash received and paid, never booked revenue. Server parts, plain props:
 * every string arrives translated, a tone always comes with the words that
 * carry its meaning, and motion stays in the Slide that uses the board
 * (`className`, `[data-state]`, `[data-tone]`).
 */

/** What a tone means: `neutral` is plain; the status tones are the global ones; `primary` marks a Slide's one point of focus. */
export type CashflowTone = 'neutral' | 'success' | 'warning' | 'destructive' | 'primary';

/** `actual` happened; `counterfactual` is a hypothetical aside; `vacated` is the place a paper left. */
export type CashflowPaperState = 'actual' | 'counterfactual' | 'vacated';

interface CashflowBoardProps {
  label: ReactNode;
  rule?: ReactNode;
  above?: ReactNode;
  below?: ReactNode;
  labelTarget?: TargetProps;
  ruleTarget?: TargetProps;
  className?: string;
  children: ReactNode;
}

/**
 * The board: a labelled figure of months in reading order, then its rule. `above`
 * and `below` hold a Slide's own rows (arrows, verdicts, strips). Its months
 * reflow by the board's own width: one column, then two, then
 * `--cashflow-columns` (default 4).
 */
export function CashflowBoard(props: CashflowBoardProps) {
  const { label, rule, above, below, labelTarget, ruleTarget, className, children } = props;
  return (
    <figure className={cn(styles.board, 'flex flex-col gap-4', className)}>
      <figcaption
        {...labelTarget}
        className="self-start rounded-md border border-border px-3 py-1 text-caption font-medium text-foreground"
      >
        {label}
      </figcaption>
      {above && <div>{above}</div>}
      <ol className={cn(styles.months, 'grid gap-3')}>{children}</ol>
      {rule && (
        <p {...ruleTarget} className="text-caption text-muted-foreground">
          {rule}
        </p>
      )}
      {below && <div className="flex flex-col gap-3">{below}</div>}
    </figure>
  );
}

interface CashflowMonthProps {
  name: ReactNode;
  badge?: ReactNode;
  tone?: CashflowTone;
  target?: TargetProps;
  className?: string;
  children?: ReactNode;
}

/** One month: a card naming the month, an optional written status, then its papers in reading order. */
export function CashflowMonth({ name, badge, tone = 'neutral', target, className, children }: CashflowMonthProps) {
  return (
    <li
      {...target}
      data-tone={tone}
      className={cn(
        styles.month,
        'flex min-w-0 flex-col gap-2 rounded-md border border-border bg-card p-3 text-card-foreground',
        className,
      )}
    >
      <span className="text-caption font-semibold text-muted-foreground uppercase">{name}</span>
      {badge && <span className={cn(styles.status, 'text-caption font-medium')}>{badge}</span>}
      <div className="flex flex-col gap-2">{children}</div>
    </li>
  );
}

interface CashflowPaperProps {
  label: ReactNode;
  amount?: ReactNode;
  tone?: CashflowTone;
  state?: CashflowPaperState;
  target?: TargetProps;
  className?: string;
  children?: ReactNode;
}

/** A sticky note: a label, an optional amount and an optional status line, edged in its tone. */
export function CashflowPaper(props: CashflowPaperProps) {
  const { label, amount, tone = 'neutral', state = 'actual', target, className, children } = props;
  return (
    <div
      {...target}
      data-tone={tone}
      data-state={state}
      className={cn(styles.paper, 'flex min-w-0 flex-col rounded-sm border border-border bg-card px-3 py-2', className)}
    >
      <span className="text-caption text-muted-foreground">{label}</span>
      {amount && (
        <span className={cn(styles.amount, 'text-body font-semibold text-foreground tabular-nums')}>{amount}</span>
      )}
      {children && <span className={cn(styles.status, 'text-caption font-medium')}>{children}</span>}
    </div>
  );
}

/** A stamped verdict beside the board: its words are the meaning, and it never covers a number. */
export function CashflowStamp({
  target,
  className,
  children,
}: {
  target?: TargetProps;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      {...target}
      className={cn(
        'm-2 inline-block -rotate-6 rounded-sm border-2 border-destructive px-3 py-1 text-subheading font-semibold text-destructive uppercase',
        className,
      )}
    >
      {children}
    </p>
  );
}
