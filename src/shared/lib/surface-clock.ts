export type SurfaceTone = 'normal' | 'inverse';
export interface SurfaceBoundary {
  readonly id: string;
  readonly top: number;
  readonly tone: SurfaceTone;
  readonly anchorOffset?: number;
  readonly startOffset?: number;
  readonly endOffset?: number;
}
export interface SurfaceGeometry {
  readonly surfaces: readonly SurfaceBoundary[];
  readonly viewport: number;
  readonly maximum: number;
  readonly samplingLine: number;
}
export interface SurfaceEdge {
  readonly id: string;
  readonly outgoing: SurfaceTone;
  readonly incoming: SurfaceTone;
  readonly top: number;
  readonly start: number;
  readonly end: number;
  readonly progress: number;
}
export interface SurfaceSnapshot {
  readonly suppressed: boolean;
  readonly tone: SurfaceTone;
  readonly edges: readonly SurfaceEdge[];
}
/** Presentation consumes correlation/status only, never target or active identity. */
export interface SurfaceNavigation {
  readonly id: number;
  readonly status: 'navigating' | 'settled' | 'interrupted' | 'timed-out' | 'superseded';
}

const clamp = (value: number, maximum: number) => Math.max(0, Math.min(value, maximum));
const finite = (value = 0) => (Number.isFinite(value) ? value : 0);
const progressAt = (edge: SurfaceEdge, position: number) =>
  edge.start === edge.end ? Number(position >= edge.end) : clamp((position - edge.start) / (edge.end - edge.start), 1);

function edgesOf(input: SurfaceGeometry): SurfaceEdge[] {
  return input.surfaces.slice(1).map((surface, index) => {
    const landing = clamp(surface.top - finite(surface.anchorOffset), input.maximum);
    const end = clamp(landing + Math.min(0, finite(surface.endOffset)), landing);
    const start = clamp(surface.top - input.viewport + finite(surface.startOffset), end);
    const outgoing = input.surfaces[index];
    return {
      id: `${outgoing.id}→${surface.id}`,
      outgoing: outgoing.tone,
      incoming: surface.tone,
      top: surface.top,
      start,
      end,
      progress: 0,
    };
  });
}

/** First item strictly above a document coordinate, in a sorted numeric index. */
function upperBound<T>(items: readonly T[], position: number, valueOf: (item: T) => number) {
  let low = 0;
  let high = items.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (valueOf(items[mid]) <= position) low = mid + 1;
    else high = mid;
  }
  return low;
}

class PageSurfaceClock {
  private geometry: SurfaceGeometry = { surfaces: [], viewport: 0, maximum: 0, samplingLine: 0 };
  private position = 0;
  private disposed = false;
  private snapshot: SurfaceSnapshot = { tone: 'normal', edges: [], suppressed: false };
  private navigation: SurfaceNavigation | null = null;
  private events: { at: number; index: number }[] = [];
  private active = new Set<number>();
  private subscriptions = new Set<() => void>();
  constructor(private readonly refresh?: () => void) {}
  getSnapshot = () => this.snapshot;
  private updatedEdges(indices: Iterable<number>) {
    const edges = [...this.snapshot.edges];
    for (const index of indices) {
      const edge = edges[index];
      const progress = progressAt(edge, this.position);
      if (progress !== edge.progress) edges[index] = { ...edge, progress };
      if (this.position >= edge.start && this.position < edge.end) this.active.add(index);
      else this.active.delete(index);
    }
    return edges;
  }
  private publish(indices: Iterable<number>) {
    const { surfaces, samplingLine } = this.geometry;
    const selected = upperBound(surfaces, this.position + samplingLine, (surface) => surface.top) - 1;
    this.snapshot = {
      edges: this.updatedEdges(indices),
      tone: surfaces[Math.max(0, selected)]?.tone ?? 'normal',
      suppressed: this.navigation?.status === 'navigating',
    };
    for (const notify of [...this.subscriptions]) if (!this.disposed && this.subscriptions.has(notify)) notify();
  }
  setGeometry(input: SurfaceGeometry, position = this.position) {
    if (this.disposed) return;
    this.position = position;
    this.geometry = input;
    this.snapshot = { ...this.snapshot, edges: edgesOf(input) };
    this.events = this.snapshot.edges
      .flatMap((edge, index) => [
        { at: edge.start, index },
        { at: edge.end, index },
      ])
      .sort((a, b) => a.at - b.at);
    this.active.clear();
    this.publish(this.snapshot.edges.map((_, index) => index));
  }
  setPosition(next: number) {
    if (this.disposed || next === this.position) return;
    const first = upperBound(this.events, Math.min(this.position, next), (event) => event.at);
    const last = upperBound(this.events, Math.max(this.position, next), (event) => event.at);
    const relevant = new Set(this.active);
    for (let index = first; index < last; index++) relevant.add(this.events[index].index);
    if (next < this.position) this.eventsAt(next).forEach((index) => relevant.add(index));
    this.position = next;
    this.publish(relevant);
  }
  setNavigation(navigation: SurfaceNavigation | null) {
    if (this.disposed || !navigation) return;
    if (
      this.navigation &&
      (navigation.id < this.navigation.id ||
        (navigation.id === this.navigation.id && this.navigation.status !== 'navigating'))
    )
      return;
    this.navigation = navigation;
    this.publish([]);
  }
  private eventsAt(position: number) {
    const indices: number[] = [];
    for (
      let index = upperBound(this.events, position, (event) => event.at) - 1;
      index >= 0 && this.events[index].at === position;
      index--
    )
      indices.push(this.events[index].index);
    return indices;
  }
  subscribe<T>(
    select: (value: SurfaceSnapshot) => T,
    listener: (value: T) => void,
    equal: (a: T, b: T) => boolean = Object.is,
  ) {
    if (this.disposed) return () => undefined;
    let previous = select(this.snapshot);
    const notify = () => {
      const next = select(this.snapshot);
      if (!equal(previous, next)) {
        previous = next;
        listener(next);
      }
    };
    this.subscriptions.add(notify);
    return () => {
      this.subscriptions.delete(notify);
    };
  }
  requestRefresh() {
    if (!this.disposed) this.refresh?.();
  }
  dispose() {
    this.disposed = true;
    this.active.clear();
    this.subscriptions.clear();
  }
}

/** Transient, DOM-independent presentation. It owns neither navigation nor active identity. */
export function createSurfaceClock(refresh?: () => void) {
  return new PageSurfaceClock(refresh);
}
export type SurfaceClock = ReturnType<typeof createSurfaceClock>;
