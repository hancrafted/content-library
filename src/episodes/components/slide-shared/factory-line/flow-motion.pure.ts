import type { SlideEntry } from '@/episodes/lib/slide-zone.pure';

/** What decides whether the factory line's flow plays: the Slide's entrance when it mounted, now, and the replays. */
export interface FlowMotionState {
  /** The Slide's entrance when the flow mounted: `done` means the Slide entered before, so it does not play again. */
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  /** How many times the pointer or keyboard focus has entered the flow's trigger. */
  readonly replays: number;
}

/**
 * Whether the line's flow plays (design-ADR-0012 §9: one emphasis motion with a purpose). Documents flow once from the
 * Slide's first `active` and keep going past the shared entrance until they stand at the end state; every replay plays
 * it again. Nothing loops: at rest the line shows its end state, which is also what reduced motion shows.
 */
export function flowPlays({ entryAtMount, entry, replays }: FlowMotionState): boolean {
  if (replays > 0) return true;
  return entryAtMount !== 'done' && entry !== 'pending';
}
