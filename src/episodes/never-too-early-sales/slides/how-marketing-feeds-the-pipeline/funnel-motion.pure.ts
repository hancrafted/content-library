import type { SlideEntry } from '@/episodes/lib/slide-zone.pure';

export interface FunnelMotionState {
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  readonly replays: number;
}

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
export function funnelPlays({ entryAtMount, entry, replays }: FunnelMotionState): boolean {
  if (replays > 0) return true;
  return entryAtMount !== 'done' && entry !== 'pending';
}
