import type { SlideEntry } from '@/lib/slide-zone.pure';

/** What decides whether the funnel's dots travel: the Slide's entrance when the funnel mounted, now, and the replays. */
export interface FunnelMotionState {
  /** The Slide's entrance when the funnel mounted: `done` means the Slide entered before, so it does not play again. */
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  /** How many times the pointer has entered the funnel. */
  readonly replays: number;
}

/**
 * Whether the funnel's dots play their travel (FE-012 §2.4: emphasis motion with a purpose). They arrive once, from
 * the Slide's first `active`, and keep playing past the end of the shared entrance so the last dots finish; every
 * mouse enter replays them. A funnel mounted again after its Slide entered stands at rest until pointed at.
 */
export function funnelPlays({ entryAtMount, entry, replays }: FunnelMotionState): boolean {
  if (replays > 0) return true;
  return entryAtMount !== 'done' && entry !== 'pending';
}
