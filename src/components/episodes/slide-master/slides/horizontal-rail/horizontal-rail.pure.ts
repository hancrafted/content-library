/*
 * The horizontal rail's geometry and timing: which side of the line a label
 * sits on, when each dot pops in behind the drawing line, and how wide a
 * dot's toggletip grows. No DOM, no React.
 */

import type { PopoverRules, PopoverSide } from '@/lib/popover-placement.pure';

/** The milestones on the rail, in order; each names its Translation keys under `items.<key>`. */
export const RAIL_ITEMS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type RailItem = (typeof RAIL_ITEMS)[number];

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
