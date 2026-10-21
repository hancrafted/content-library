import type { SlideEntry } from '@/lib/slide-zone.pure';

/** What decides whether the handoff card lights: the Slide's entrance when the card mounted, now, and the replays. */
export interface HandoffMotionState {
  /** The Slide's entrance when the card mounted: `done` means the Slide entered before, so it does not light again. */
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  /** How many times the pointer or keyboard focus has entered the bars. */
  readonly replays: number;
}

/**
 * Whether the handoff card plays its light (design-ADR-0012 §9, the Slide's one emphasis motion): the card lights
 * between the two bars once, from the Slide's first `active`, and again on every mouse enter or keyboard focus. A card
 * mounted again after its Slide entered stands lit at rest until pointed at.
 */
export function handoffLights({ entryAtMount, entry, replays }: HandoffMotionState): boolean {
  if (replays > 0) return true;
  return entryAtMount !== 'done' && entry !== 'pending';
}
