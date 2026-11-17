import type { SlideEntry } from '@/episodes/lib/slide-zone.pure';

export interface HandoffMotionState {
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  readonly replays: number;
}

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
export function handoffLights({ entryAtMount, entry, replays }: HandoffMotionState): boolean {
  if (replays > 0) return true;
  return entryAtMount !== 'done' && entry !== 'pending';
}
