import type { SlideEntry } from '@/lib/slide-zone.pure';

/** How long each lighting step of a call holds before the next one starts. */
export const CALL_STEP_MS = 1400;

/** The step a timer of one play reached: `run` is the play it belongs to, counted by replays. */
export interface CallStepProgress {
  readonly run: number;
  readonly step: number;
}

/** What decides which lighting step a call shows. */
export interface CallStepState {
  /** The Slide's entrance when the steps mounted: `done` means the Slide entered before, so it does not play again. */
  readonly entryAtMount: SlideEntry;
  readonly entry: SlideEntry;
  /** How many times the pointer or keyboard focus has replayed the steps. */
  readonly replays: number;
  /** The step the timers of a play reached, or `null` before any timer fired. */
  readonly progress: CallStepProgress | null;
  /** The end state's step, which the static HTML and a finished play show. */
  readonly last: number;
}

/** Whether the steps play: from the Slide's first `active` if they mounted before it, and after any replay. */
export function callStepsPlay({
  entryAtMount,
  entry,
  replays,
}: Pick<CallStepState, 'entryAtMount' | 'entry' | 'replays'>) {
  return replays > 0 || (entryAtMount !== 'done' && entry !== 'pending');
}

/**
 * The lighting step a call shows (design-ADR-0012 §9: one emphasis motion). It plays once from the Slide's first
 * `active` and again on every replay, starting at step 0 each time; otherwise it rests at the end state, as it does in
 * the static HTML, while the Slide is pending and when it mounts again after its Slide entered.
 */
export function callStepShown(state: CallStepState): number {
  const { replays, progress, last } = state;
  if (!callStepsPlay(state)) return last;
  return progress?.run === replays ? progress.step : 0;
}
