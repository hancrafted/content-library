/*
 * The phase bars' data and geometry: which lane each bar sits in, the months
 * it spans, where it lands on the track, how far "today" has eaten into it,
 * when it grows in, and where its tooltip opens. No DOM, no React.
 */

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

/** The widest a tooltip grows; a phone narrows it to the viewport minus its margins. */
export const TOOLTIP_MAX_WIDTH = 272;

/** Space kept between a tooltip and its bar. */
export const TOOLTIP_GAP = 10;

/** Space kept between a tooltip and the viewport edge. */
export const TOOLTIP_MARGIN = 16;

/** The least room above a bar before its tooltip flips below. */
const MIN_ROOM = 140;

export interface Box {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

export interface TooltipPlacement {
  readonly side: 'above' | 'below';
  /** Set for `below`: the fixed `top`. */
  readonly top?: number;
  /** Set for `above`: the fixed `bottom`, so the tooltip grows upward whatever its height. */
  readonly bottom?: number;
  readonly left: number;
  readonly width: number;
}

/** Where a bar's tooltip opens (viewport coordinates): above the bar unless there is no room, centred on it, clamped inside the viewport. */
export function placeTooltip(anchor: Box, viewport: { width: number; height: number }): TooltipPlacement {
  const width = Math.min(TOOLTIP_MAX_WIDTH, viewport.width - 2 * TOOLTIP_MARGIN);
  const centre = anchor.left + anchor.width / 2;
  const left = Math.min(Math.max(centre - width / 2, TOOLTIP_MARGIN), viewport.width - TOOLTIP_MARGIN - width);
  return anchor.top - TOOLTIP_GAP >= MIN_ROOM
    ? { side: 'above', bottom: viewport.height - anchor.top + TOOLTIP_GAP, left, width }
    : { side: 'below', top: anchor.top + anchor.height + TOOLTIP_GAP, left, width };
}
