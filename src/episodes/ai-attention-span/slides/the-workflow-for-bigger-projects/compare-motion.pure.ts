import type { SlideEntry } from '@/episodes/lib/slide-zone.pure';

export interface CompareMotionState {
  /** The Slide's entrance when the panels mounted: `done` means the Slide entered before, so it does not play again. */
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  readonly replays: number;
}

/**
 * Whether the comparison plays (design-ADR-0012 §9, the Slide's one emphasis motion): the one long chat fades back as
 * the workflow lights, once from the Slide's first `active` and again on every mouse enter or keyboard focus. Panels
 * mounted again after their Slide entered stand at their end state until pointed at.
 */
export function workflowLights({ entryAtMount, entry, replays }: CompareMotionState): boolean {
  if (replays > 0) return true;
  return entryAtMount !== 'done' && entry !== 'pending';
}
