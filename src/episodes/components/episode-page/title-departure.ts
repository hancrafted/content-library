import { ownSignals } from '@/shared/lib/owned-signals';
import type { SurfaceClock } from '@/shared/lib/surface-clock';

export interface TitleRevealRange {
  readonly start: number;
  readonly end: number;
}

/** Episode policy inputs are cached with geometry, never read on scroll. */
export function readTitleReveal(root: HTMLElement): TitleRevealRange {
  const css = getComputedStyle(root);
  const read = (name: string, fallback: number) => {
    const text = css.getPropertyValue(name).trim();
    return text === '' ? fallback : Number(text);
  };
  const start = read('--toc-reveal-start', 0);
  const end = read('--toc-reveal-end', 1);
  if (Number.isFinite(start) && Number.isFinite(end) && start >= 0 && start < end && end <= 1) return { start, end };
  if (process.env.NODE_ENV !== 'production') console.warn('[surface clock] Invalid ToC reveal interval; using 0..1');
  return { start: 0, end: 1 };
}

/** Title departure is the first resolved surface edge, including effect-free and incoming-winner edges. */
export function publishTitleDeparture(root: HTMLElement, clock: SurfaceClock, range: () => TitleRevealRange) {
  const signals = ownSignals(root);
  const render = (edge: ReturnType<SurfaceClock['getSnapshot']>['edges'][number] | undefined) => {
    const { start, end } = range();
    const progress = Math.max(0, Math.min(1, ((edge?.progress ?? 1) - start) / (end - start)));
    signals.property('--title-departure-progress', String(progress));
    signals.attribute('data-title-departure', progress === 0 ? 'start' : progress === 1 ? 'complete' : 'moving');
  };
  render(clock.getSnapshot().edges[0]);
  // Geometry refresh replaces the edge even when its progress is unchanged, so CSS-input edits reconcile too.
  const unsubscribe = clock.subscribe((snapshot) => snapshot.edges[0], render);
  return () => {
    unsubscribe();
    signals.dispose();
  };
}
