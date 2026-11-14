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

/** The ToC hosts that read the progress: `[data-toc-entrance]` inside the Episode page. */
const TOC_HOSTS = '[data-toc-entrance]';

/**
 * Title departure is the first resolved surface edge, including effect-free and incoming-winner edges. The discrete
 * `data-title-departure` sits on the page root; the per-frame `--title-departure-progress` sits on the ToC hosts that
 * read it, because an inherited custom property changed on the root restyles every Slide under it each frame.
 */
export function publishTitleDeparture(root: HTMLElement, clock: SurfaceClock, range: () => TitleRevealRange) {
  const signals = ownSignals(root);
  const hosts = [...root.querySelectorAll<HTMLElement>(TOC_HOSTS)].map(ownSignals);
  const render = (edge: ReturnType<SurfaceClock['getSnapshot']>['edges'][number] | undefined) => {
    const { start, end } = range();
    const progress = Math.max(0, Math.min(1, ((edge?.progress ?? 1) - start) / (end - start)));
    for (const host of hosts) host.property('--title-departure-progress', String(progress));
    signals.attribute('data-title-departure', progress === 0 ? 'start' : progress === 1 ? 'complete' : 'moving');
  };
  render(clock.getSnapshot().edges[0]);
  // Geometry refresh replaces the edge even when its progress is unchanged, so CSS-input edits reconcile too.
  const unsubscribe = clock.subscribe((snapshot) => snapshot.edges[0], render);
  return () => {
    unsubscribe();
    hosts.forEach((host) => host.dispose());
    signals.dispose();
  };
}
