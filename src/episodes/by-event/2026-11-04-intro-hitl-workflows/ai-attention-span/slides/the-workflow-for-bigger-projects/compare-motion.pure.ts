import type { SlideEntry } from '@/episodes/lib/slide-zone.pure';

export interface CompareMotionState {
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  readonly replays: number;
}

// decision: docs/decision-records/0012-slide-header-and-play-once-motion.md
export function workflowLights({ entryAtMount, entry, replays }: CompareMotionState): boolean {
  if (replays > 0) return true;
  return entryAtMount !== 'done' && entry !== 'pending';
}
