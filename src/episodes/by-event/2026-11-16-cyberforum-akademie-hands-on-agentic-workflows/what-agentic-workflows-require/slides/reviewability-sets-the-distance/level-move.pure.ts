import type { SlideEntry } from '@/episodes/lib/slide-zone.pure';

export interface LevelMoveState {
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  readonly replays: number;
}

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
export function levelMovePlays({ entryAtMount, entry, replays }: LevelMoveState): boolean {
  if (replays > 0) return true;
  return entryAtMount !== 'done' && entry !== 'pending';
}
