import type { SlideEntry } from '@/episodes/lib/slide-zone.pure';

export interface FlowMotionState {
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  readonly replays: number;
}

// decision: docs/decision-records/0012-slide-header-and-play-once-motion.md
export function flowPlays({ entryAtMount, entry, replays }: FlowMotionState): boolean {
  if (replays > 0) return true;
  return entryAtMount !== 'done' && entry !== 'pending';
}
