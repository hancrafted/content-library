import { BoardNote } from '@/components/slide-shared/board-note';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './pipeline-by-the-numbers.module.css';

/** Half months on the strip: ten months, like the cashflow board's month columns. */
const HALVES = 20;
const MONTHS = Array.from({ length: HALVES / 2 }, (_, index) => index + 1);
/** Entrance steps (× the module's step unit): the bars after the funnel, the revenue note after the bars. */
const BAR_STEPS = [5, 5.5, 7.5] as const;
/** How long each bar takes to grow, left to right. */
const BAR_DURATIONS = ['150ms', '600ms', '400ms'] as const;
const REVENUE_STEP = 9;

export interface MonthStripBar {
  readonly label: string;
  /** Half months from first contact to where the bar starts. */
  readonly startHalf: number;
  readonly spanHalves: number;
}

export interface MonthStripProps {
  readonly bars: readonly MonthStripBar[];
  readonly axisLabel: string;
  readonly totalLabel: string;
  readonly revenueLabel: string;
  readonly 'data-target'?: string;
}

function step(value: number, duration?: string): CSSProperties {
  return { '--step': value, '--duration': duration } as CSSProperties;
}

/** The checks the types cannot make, so a wrong strip fails the build instead of drawing a lie. */
function validate(bars: readonly MonthStripBar[]): void {
  for (const { label, startHalf, spanHalves } of bars) {
    if (!Number.isInteger(spanHalves) || spanHalves < 1) {
      throw new Error(`MonthStrip: bar "${label}" needs a whole number of halves, at least one.`);
    }
    if (startHalf < 0 || startHalf + spanHalves > HALVES) {
      throw new Error(`MonthStrip: bar "${label}" runs past half ${HALVES}.`);
    }
  }
}

function Bar({ bar, index }: { bar: MonthStripBar; index: number }) {
  return (
    <div className="grid grid-cols-[repeat(20,minmax(0,1fr))]">
      <div style={{ gridColumn: `${bar.startHalf + 1} / span ${bar.spanHalves}` }} className="min-w-0">
        <span className="block text-caption font-medium whitespace-nowrap text-foreground">{bar.label}</span>
        <span
          aria-hidden="true"
          style={step(BAR_STEPS[index] ?? REVENUE_STEP, BAR_DURATIONS[index])}
          className={cn(styles.grow, 'mt-1 block h-3 rounded-sm border border-border bg-muted')}
        />
      </div>
    </div>
  );
}

function Revenue({ label }: { label: string }) {
  return (
    <div style={step(REVENUE_STEP)} className={cn(styles.land, 'flex flex-col items-end gap-1 justify-self-end')}>
      <svg aria-hidden="true" viewBox="0 0 12 8" className="size-3 text-muted-foreground @xl:hidden">
        <path d="M6 0 L12 8 H0 Z" fill="currentColor" />
      </svg>
      <BoardNote tone="revenue" className="w-fit font-semibold">
        {label}
      </BoardNote>
    </div>
  );
}

/**
 * The three durations to scale on one axis of half months, a staircase of
 * bars ending in the revenue note. Server only, plain props.
 */
export function MonthStrip({ bars, axisLabel, totalLabel, revenueLabel, ...rest }: MonthStripProps) {
  validate(bars);
  return (
    <div data-target={rest['data-target']}>
      <div className="grid grid-cols-1 gap-3 @xl:grid-cols-[minmax(0,1fr)_auto] @xl:items-end">
        <div className="flex flex-col gap-2">
          <div aria-hidden="true" className="grid grid-cols-[repeat(20,minmax(0,1fr))]">
            {MONTHS.map((month) => (
              <span key={month} className="col-span-2 text-caption text-muted-foreground tabular-nums">
                {month}
              </span>
            ))}
          </div>
          {bars.map((bar, index) => (
            <Bar key={bar.label} bar={bar} index={index} />
          ))}
        </div>
        <Revenue label={revenueLabel} />
      </div>
      <p className="mt-3 flex flex-wrap justify-between gap-x-4 text-caption text-muted-foreground">
        <span>{axisLabel}</span>
        <span className="font-medium text-foreground">{totalLabel}</span>
      </p>
    </div>
  );
}
