export interface TrackGeometry {
  scrollLeft: number;
  maxScroll: number;
  offsets: readonly number[];
}

export interface TrackReading {
  progress: number;
  active: number;
  atStart: boolean;
  atEnd: boolean;
}

const EDGE_SLACK_PIXELS = 1;

export function readTrack({ scrollLeft, maxScroll, offsets }: TrackGeometry): TrackReading {
  if (offsets.length === 0) throw new Error('A scrolling track with no cards has no active card.');
  const atStart = scrollLeft <= EDGE_SLACK_PIXELS;
  const atEnd = scrollLeft >= maxScroll - EDGE_SLACK_PIXELS;
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

export function stepDelta({ scrollLeft, maxScroll, offsets }: TrackGeometry, direction: -1 | 1): number {
  const stops = offsets.map((offset) => Math.min(Math.max(offset, 0), maxScroll) - scrollLeft);
  const ahead = stops.filter((delta) => delta * direction > EDGE_SLACK_PIXELS);
  if (ahead.length === 0) return 0;
  return direction > 0 ? Math.min(...ahead) : Math.max(...ahead);
}
