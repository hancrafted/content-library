/*
 * The phase bars' data and geometry: which lane each bar sits in, the months
 * it spans, where it lands on the track, how far "today" has eaten into it,
 * when it grows in, and how wide its tooltip grows. No DOM, no React.
 */

import type { PopoverRules } from '@/lib/popover-placement.pure';

/** The axis runs one year, in months; a quarter is three of them. */
export const AXIS_MONTHS = 12;

/** How long the entrance sweep takes to cross the whole year. */
export const SWEEP_MS = 1440;

/** The lanes, top to bottom; each names its Translation key under `lanes.<key>`. */
export const GANTT_LANES = ['a', 'b', 'c'] as const;

export type GanttLane = (typeof GANTT_LANES)[number];

export interface Bar {
  readonly lane: GanttLane;
  /** Months from the year's start. */
  readonly start: number;
  readonly end: number;
}

/** The phase bars; each names its Translation keys under `items.<key>`. */
export const GANTT_ITEMS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type GanttItem = (typeof GANTT_ITEMS)[number];

/** Placeholder months, chosen so the bars overlap across lanes and never within one; they match the `items.*.date` quarters. */
export const GANTT_BARS: Record<GanttItem, Bar> = {
  a: { lane: 'a', start: 0, end: 2.5 },
  b: { lane: 'b', start: 1, end: 5.5 },
  c: { lane: 'a', start: 4, end: 8.5 },
  d: { lane: 'c', start: 6, end: 8.5 },
  e: { lane: 'c', start: 8.5, end: 11.5 },
  f: { lane: 'b', start: 9.5, end: 12 },
};

/** Where the "today" marker stands, in months from the year's start. */
export const TODAY = 7;

export interface BarBox {
  readonly leftPct: number;
  readonly widthPct: number;
}

function assertRange({ start, end }: Bar): void {
  if (!(start >= 0 && end > start && end <= AXIS_MONTHS)) {
    throw new Error(`${start}–${end} is not a range on a ${AXIS_MONTHS}-month axis.`);
  }
}

/** Where a bar sits on its lane's track, as shares of the track's width. */
export function barBox(bar: Bar): BarBox {
  assertRange(bar);
  return { leftPct: (bar.start / AXIS_MONTHS) * 100, widthPct: ((bar.end - bar.start) / AXIS_MONTHS) * 100 };
}

/** How much of a bar lies left of `today`: 0 before it starts, 1 once it has ended. */
export function elapsedShare(bar: Bar, today: number): number {
  assertRange(bar);
  return Math.min(Math.max((today - bar.start) / (bar.end - bar.start), 0), 1);
}

/** The entrance sweeps the year left to right: a bar starts growing when the sweep reaches its start and keeps its pace. */
export function growTiming(bar: Bar): { delayMs: number; durationMs: number } {
  assertRange(bar);
  const msPerMonth = SWEEP_MS / AXIS_MONTHS;
  return { delayMs: bar.start * msPerMonth, durationMs: (bar.end - bar.start) * msPerMonth };
}

/** Every pair of bars that share a lane and overlap; touching end to start is not an overlap. */
export function laneClashes<K extends string>(bars: Readonly<Record<K, Bar>>): [K, K][] {
  const entries = Object.entries(bars) as [K, Bar][];
  return entries.flatMap(([key, bar], index) =>
    entries
      .slice(index + 1)
      .filter(([, other]) => other.lane === bar.lane && other.start < bar.end && bar.start < other.end)
      .map(([otherKey]): [K, K] => [key, otherKey]),
  );
}

/** The tooltip's widths and gaps for the shared popover placement (`@/lib/popover-placement.pure`); it prefers to open above its bar. */
export const TOOLTIP_RULES: PopoverRules = {
  /** The widest a tooltip grows; a phone narrows it to the viewport minus its margins. */
  maxWidth: 272,
  /** Space kept between a tooltip and its bar. */
  gap: 10,
  /** The least room above a bar before its tooltip flips below. */
  minRoom: 140,
};
