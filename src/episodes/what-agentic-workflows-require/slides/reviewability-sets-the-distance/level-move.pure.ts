import type { SlideEntry } from '@/episodes/lib/slide-zone.pure';

export interface LevelMoveState {
  /** The Slide's entrance when the move mounted: `done` means the Slide entered before, so it does not play again. */
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  readonly replays: number;
}

/**
 * Whether the activity's pill slides from in to on (the Slide's one local motion, design-ADR-0012 §9): once from the
 * Slide's first `active`, and again on every mouse enter or keyboard focus. A move mounted again after its Slide entered
 * stands at its end state until pointed at.
 */
export function levelMovePlays({ entryAtMount, entry, replays }: LevelMoveState): boolean {
  if (replays > 0) return true;
  return entryAtMount !== 'done' && entry !== 'pending';
}
