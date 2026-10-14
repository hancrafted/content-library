import { clsx } from 'clsx';
import { BoardNote } from './board-note';
import styles from './what-is-a-sales-pipeline.module.css';

const FUNNEL_MARKS = [6, 2, 1] as const;
const TICKS = [1, 2, 3, 4, 5, 6] as const;

/** Leads, opportunities and deals as rows of mini notes, fewer each row. */
export function FunnelDrawing({ rows }: { rows: readonly [string, string, string] }) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => (
        <div key={row} className="grid grid-cols-[4rem_minmax(0,1fr)] items-center">
          <span className="text-caption text-muted-foreground">{row}</span>
          <span className="flex flex-wrap gap-1">
            {Array.from({ length: FUNNEL_MARKS[index] }, (_, mark) => (
              <span key={mark} className="size-4 rounded-sm border border-border bg-card" />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

/** "3 leads" → "1 opportunity": two notes joined by an arrow that wraps rather than overflows. */
export function ConversionDrawing({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <BoardNote className="text-body whitespace-nowrap">{from}</BoardNote>
      <svg viewBox="0 0 24 24" fill="none" className="size-6 shrink-0 stroke-current text-muted-foreground">
        <path
          d="M3 12h17m-5-5 5 5-5 5"
          pathLength={1}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.draw}
        />
      </svg>
      <BoardNote className="text-body whitespace-nowrap">{to}</BoardNote>
    </div>
  );
}

/** Six months on a strip, one primary bar from first contact to the deal. */
export function CycleDrawing({ start, end }: { start: string; end: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-6">
        {TICKS.map((tick) => (
          <span key={tick} className="text-caption text-muted-foreground tabular-nums">
            {tick}
          </span>
        ))}
      </div>
      <span className={clsx(styles.grow, 'block h-1.5 w-full rounded-full bg-primary')} />
      <div className="flex justify-between gap-2 text-caption text-muted-foreground">
        <span>{start}</span>
        <span>{end}</span>
      </div>
    </div>
  );
}
