/*
 * The first day's rail: its geometry and timing, copied from the horizontal-rail
 * master with changes. Which side of the line a label sits on, which stops are
 * hand-overs and which are check-ins, where the line breaks into the dashed gap
 * while the newcomer works, when each dot pops in behind the drawing line, when
 * the rail is wide enough to run across, and how wide a dot's toggletip grows.
 * No DOM, no React.
 */

import type { PopoverRules, PopoverSide } from '@/lib/popover-placement.pure';

/** The milestones on the rail, in order; each names its Translation keys under `items.<key>`. */
export const RAIL_ITEMS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type RailItem = (typeof RAIL_ITEMS)[number];

/** 13:00 and 16:00: the moments you look at their work, your judgement; the morning stops hand over. */
const CHECK_INS: readonly RailItem[] = ['e', 'f'];

/** The stop after which the newcomer works alone until the first check-in: the line is dashed from here to the next. */
const GAP_AFTER = 3;

/** The rail runs across once its own width reaches this many rem (Tailwind's `@5xl` container), else it runs down. */
export const ACROSS_REM = 64;

export type RailSide = PopoverSide;

/** How long the line takes to draw from the first dot to the last. */
export const LINE_DRAW_MS = 1200;

/** The toggletip's widths and gaps for the shared popover placement (`@/lib/popover-placement.pure`). */
export const TOGGLETIP_RULES: PopoverRules = {
  /** The widest a toggletip grows; a phone narrows it to the viewport minus its margins. */
  maxWidth: 256,
  /** Space kept between a toggletip and its label. */
  gap: 12,
  /** The least room a side needs before a toggletip opens there instead of flipping. */
  minRoom: 120,
};

function assertOnRail(index: number, count: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= count) {
    throw new Error(`${index} is not a position on a rail of ${count}.`);
  }
}

/** Whether a stop hands something over or checks the work. */
export function stopKind(item: RailItem): 'hand-over' | 'check-in' {
  return CHECK_INS.includes(item) ? 'check-in' : 'hand-over';
}

/** Whether a rail `widthPx` wide runs across: by its own container width, so the drawer beside it turns it down. */
export function runsAcross(widthPx: number, remPx: number): boolean {
  return widthPx >= ACROSS_REM * remPx;
}

/** Labels alternate, the first above the line. */
export function railSide(index: number): RailSide {
  assertOnRail(index, Number.POSITIVE_INFINITY);
  return index % 2 === 0 ? 'above' : 'below';
}

/** A dot sits at the centre of its column, so it pops in when the line, drawn in `LINE_DRAW_MS`, reaches that centre. */
export function dotDelayMs(index: number, count: number): number {
  assertOnRail(index, count);
  return (LINE_DRAW_MS * (2 * index + 1)) / (2 * count);
}

/**
 * The line is drawn in one segment per column, each spanning its column, so
 * segment `index` starts when the previous one ends and the six read as one stroke.
 */
export function segmentTiming(index: number, count: number): { delayMs: number; durationMs: number } {
  assertOnRail(index, count);
  const durationMs = LINE_DRAW_MS / count;
  return { delayMs: durationMs * index, durationMs };
}

/**
 * A column's segment in its two halves, before and after its dot, each drawn in half the segment's time so the line
 * still reads as one stroke. The halves between the gap's two dots are `dashed`: time passing while they work.
 */
export function segmentHalves(
  index: number,
  count: number,
): [
  { delayMs: number; durationMs: number; dashed: boolean },
  { delayMs: number; durationMs: number; dashed: boolean },
] {
  const { delayMs, durationMs } = segmentTiming(index, count);
  const half = durationMs / 2;
  return [
    { delayMs, durationMs: half, dashed: index === GAP_AFTER + 1 },
    { delayMs: delayMs + half, durationMs: half, dashed: index === GAP_AFTER },
  ];
}

/** The dashed gap is not drawn: it fades in as the first check-in's dot pops in. */
export function gapFadeDelayMs(count: number): number {
  return dotDelayMs(GAP_AFTER + 1, count);
}
