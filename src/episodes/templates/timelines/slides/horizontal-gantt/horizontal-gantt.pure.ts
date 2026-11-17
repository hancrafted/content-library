import type { PopoverRules } from '@/shared/lib/popover-placement.pure';

export const AXIS_MONTHS = 12;

export const GANTT_LANES = ['a', 'b', 'c'] as const;

export type GanttLane = (typeof GANTT_LANES)[number];

export interface Bar {
  readonly lane: GanttLane;
  readonly start: number;
  readonly end: number;
}

export const GANTT_ITEMS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type GanttItem = (typeof GANTT_ITEMS)[number];

export const GANTT_BARS: Record<GanttItem, Bar> = {
  a: { lane: 'a', start: 0, end: 2.5 },
  b: { lane: 'b', start: 1, end: 5.5 },
  c: { lane: 'a', start: 4, end: 8.5 },
  d: { lane: 'c', start: 6, end: 8.5 },
  e: { lane: 'c', start: 8.5, end: 11.5 },
  f: { lane: 'b', start: 9.5, end: 12 },
};

export const TODAY = 7;

export interface BarBox {
  readonly leftPercent: number;
  readonly widthPercent: number;
}

function assertRange({ start, end }: Bar): void {
  if (!(start >= 0 && end > start && end <= AXIS_MONTHS)) {
    throw new Error(`${start}–${end} is not a range on a ${AXIS_MONTHS}-month axis.`);
  }
}

export function barBox(bar: Bar): BarBox {
  assertRange(bar);
  return { leftPercent: (bar.start / AXIS_MONTHS) * 100, widthPercent: ((bar.end - bar.start) / AXIS_MONTHS) * 100 };
}

export function elapsedShare(bar: Bar, today: number): number {
  assertRange(bar);
  return Math.min(Math.max((today - bar.start) / (bar.end - bar.start), 0), 1);
}

export function laneClashes<K extends string>(bars: Readonly<Record<K, Bar>>): [K, K][] {
  const entries = Object.entries(bars) as [K, Bar][];
  return entries.flatMap(([key, bar], index) =>
    entries
      .slice(index + 1)
      .filter(([, other]) => other.lane === bar.lane && other.start < bar.end && bar.start < other.end)
      .map(([otherKey]): [K, K] => [key, otherKey]),
  );
}

export const TOOLTIP_RULES: PopoverRules = {
  maxWidth: 272,
  gap: 10,
  minRoom: 140,
};
