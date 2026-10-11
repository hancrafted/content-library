/*
 * The horizontal rail's geometry and timing: which side of the line a label
 * sits on, when each dot pops in behind the drawing line, and where a dot's
 * toggletip lands in the viewport. No DOM, no React.
 */

/** The milestones on the rail, in order; each names its Translation keys under `items.<key>`. */
export const RAIL_ITEMS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type RailItem = (typeof RAIL_ITEMS)[number];

export type RailSide = 'above' | 'below';

/** How long the line takes to draw from the first dot to the last. */
export const LINE_DRAW_MS = 1200;

/** The widest a toggletip grows; a phone narrows it to the viewport minus its margins. */
export const TOGGLETIP_MAX_WIDTH = 256;

/** Space kept between a toggletip and its label. */
const GAP = 12;

/** Space kept between a toggletip and the viewport edge. */
const MARGIN = 16;

/** The least room a side needs before a toggletip opens there instead of flipping. */
const MIN_ROOM = 120;

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

export interface Box {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

export interface ToggletipPlacement {
  readonly side: RailSide;
  /** Set for `below`: the fixed `top`. */
  readonly top?: number;
  /** Set for `above`: the fixed `bottom`, so the toggletip grows upward whatever its height. */
  readonly bottom?: number;
  readonly left: number;
  readonly width: number;
  /** The arrow's x inside the toggletip, pointing at the label's centre. */
  readonly arrowX: number;
}

/**
 * Where a toggletip opens for a label at `anchor` (viewport coordinates):
 * on the label's side, flipped when that side has less than `MIN_ROOM`,
 * centred on the label and clamped inside the viewport.
 */
export function placeToggletip({
  anchor,
  viewport,
  side,
}: {
  anchor: Box;
  viewport: { width: number; height: number };
  side: RailSide;
}): ToggletipPlacement {
  const roomAbove = anchor.top - GAP;
  const roomBelow = viewport.height - (anchor.top + anchor.height) - GAP;
  const preferredRoom = side === 'above' ? roomAbove : roomBelow;
  const placed: RailSide = preferredRoom >= MIN_ROOM ? side : side === 'above' ? 'below' : 'above';
  const width = Math.min(TOGGLETIP_MAX_WIDTH, viewport.width - 2 * MARGIN);
  const centre = anchor.left + anchor.width / 2;
  const left = Math.min(Math.max(centre - width / 2, MARGIN), viewport.width - MARGIN - width);
  const arrowX = centre - left;
  return placed === 'above'
    ? { side: placed, bottom: viewport.height - anchor.top + GAP, left, width, arrowX }
    : { side: placed, top: anchor.top + anchor.height + GAP, left, width, arrowX };
}
