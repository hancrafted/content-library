import type { SlideEntry } from '@/episodes/lib/slide-zone.pure';

export interface SpecSlideState {
  /** The Slide's entrance when the card mounted: `done` means the Slide entered before, so it does not slide again. */
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  readonly replays: number;
}

/**
 * Whether the spec card slides from the chat onto the bench (design-ADR-0012 §9, the Slide's one emphasis motion): once
 * from the Slide's first `active`, and again on every mouse enter or keyboard focus. At rest, and under reduced motion,
 * the card lies on the bench.
 */
export function specSlides({ entryAtMount, entry, replays }: SpecSlideState): boolean {
  if (replays > 0) return true;
  return entryAtMount !== 'done' && entry !== 'pending';
}
