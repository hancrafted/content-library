import type { SlideEntry } from '@/episodes/lib/slide-zone.pure';

export interface SpecSlideState {
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  readonly replays: number;
}

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
export function specSlides({ entryAtMount, entry, replays }: SpecSlideState): boolean {
  if (replays > 0) return true;
  return entryAtMount !== 'done' && entry !== 'pending';
}
