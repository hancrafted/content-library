/** Where a scrolling track stands: its scroll position, how far it can scroll, and each card's snap position. */
export interface TrackGeometry {
  scrollLeft: number;
  maxScroll: number;
  offsets: readonly number[];
}

/** What the controls show for a track: progress 0 to 1, the active card's index, and whether either end is reached. */
export interface TrackReading {
  progress: number;
  active: number;
  atStart: boolean;
  atEnd: boolean;
}

/** Browsers report fractional scroll positions on zoomed or high-density screens; within this many pixels counts as there. */
const EDGE_SLACK = 1;

/** Read the controls' state off a track's geometry. At the far end the last card is active, though it cannot scroll to its own snap position. */
export function readTrack({ scrollLeft, maxScroll, offsets }: TrackGeometry): TrackReading {
  if (offsets.length === 0) throw new Error('A scrolling track with no cards has no active card.');
  const atStart = scrollLeft <= EDGE_SLACK;
  const atEnd = scrollLeft >= maxScroll - EDGE_SLACK;
  const progress = atEnd ? 1 : atStart ? 0 : scrollLeft / maxScroll;
  const active = atEnd ? offsets.length - 1 : nearestIndex(offsets, scrollLeft);
  return { progress, active, atStart, atEnd };
}

function nearestIndex(offsets: readonly number[], position: number): number {
  return offsets.reduce(
    (best, offset, index) => (Math.abs(offset - position) < Math.abs(offsets[best] - position) ? index : best),
    0,
  );
}

/**
 * How far a previous (`-1`) or next (`1`) button scrolls: to the nearest card whose snap position, clamped to the
 * track, lies beyond the current position in that direction — so near the far end, where several cards share the
 * end position, one press still moves. Zero when no such card exists.
 */
export function stepDelta({ scrollLeft, maxScroll, offsets }: TrackGeometry, direction: -1 | 1): number {
  const stops = offsets.map((offset) => Math.min(Math.max(offset, 0), maxScroll) - scrollLeft);
  const ahead = stops.filter((delta) => delta * direction > EDGE_SLACK);
  if (ahead.length === 0) return 0;
  return direction > 0 ? Math.min(...ahead) : Math.max(...ahead);
}
