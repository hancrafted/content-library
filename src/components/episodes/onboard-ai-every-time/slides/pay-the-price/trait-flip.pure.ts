/*
 * The trait flip's rules (.scratch/freelancer-trait-flip/handoff.md): which row is open, when its back plays and
 * replays, and the closing line's wipe. Pure, so the client part only keeps the clock.
 */

/** The five PRICE traits, in letter order. */
export const TRAITS = ['probabilistic', 'relentless', 'informed', 'confident', 'every-word-billed'] as const;
export type Trait = (typeof TRAITS)[number];

/** What a control opens: one trait's row, or the closing line's wipe over every row. */
export type FlipTarget = Trait | 'closing';

export interface FlipState {
  readonly open: FlipTarget | null;
}

export const CLOSED: FlipState = { open: null };

/**
 * `open`: a chip or the closing line is pointed at, focused or tapped. `leave`: the pointer leaves it or it blurs.
 * `dismiss`: a tap elsewhere, Escape, or the Slide leaving `active`.
 */
export type FlipEvent =
  | { readonly type: 'open'; readonly target: FlipTarget }
  | { readonly type: 'leave'; readonly target: FlipTarget }
  | { readonly type: 'dismiss' };

/** One row open at a time; leaving a control closes only what it opened. */
export function flip(state: FlipState, event: FlipEvent): FlipState {
  switch (event.type) {
    case 'open':
      return state.open === event.target ? state : { open: event.target };
    case 'leave':
      return state.open === event.target ? CLOSED : state;
    case 'dismiss':
      return state.open === null ? state : CLOSED;
  }
}

/** How long a back holds its last frame before it replays. */
export const HOLD_MS = 1500;

/** How long the card turns before its back starts to play. */
export const TURN_MS = 350;

/** Each back's beat, from the prototype (`build2.py`); Every word billed is its scan schedule's length. */
export const BEAT_MS: Readonly<Record<Trait, number>> = {
  probabilistic: 2600,
  relentless: 3600,
  informed: 3600,
  confident: 2900,
  'every-word-billed': 7200,
};

/** An open row at `elapsed` ms since it opened: whether its back plays, and which pass, so a new pass restarts it. */
export function rowAt(trait: Trait, elapsed: number): { playing: boolean; pass: number } {
  if (elapsed < TURN_MS) return { playing: false, pass: 0 };
  return { playing: true, pass: Math.floor((elapsed - TURN_MS) / (BEAT_MS[trait] + HOLD_MS)) };
}

/** The wipe's steps: every row flips, the backs blank and the arrows retract, the fronts return, the backs unblank. */
const WIPE_STEPS = [
  { at: 0, flipped: true, blank: false },
  { at: 900, flipped: true, blank: true },
  { at: 1900, flipped: false, blank: true },
  { at: 2600, flipped: false, blank: false },
] as const;

/** One wipe and its hold: the wipe repeats this often while the closing line stays open. */
export const WIPE_CYCLE_MS = 2600 + HOLD_MS;

/** The wipe at `elapsed` ms since the closing line opened. */
export function wipeAt(elapsed: number): { flipped: boolean; blank: boolean } {
  const inCycle = elapsed % WIPE_CYCLE_MS;
  const { flipped, blank } = [...WIPE_STEPS].reverse().find(({ at }) => at <= inCycle) ?? WIPE_STEPS[0];
  return { flipped, blank };
}

/** How many ms after `elapsed` the open target next changes: the turn, the next replay, or the next wipe step. */
export function nextChangeIn(target: FlipTarget, elapsed: number): number {
  if (target === 'closing') {
    const inCycle = elapsed % WIPE_CYCLE_MS;
    const next = WIPE_STEPS.find(({ at }) => at > inCycle)?.at ?? WIPE_CYCLE_MS;
    return next - inCycle;
  }
  if (elapsed < TURN_MS) return TURN_MS - elapsed;
  const period = BEAT_MS[target] + HOLD_MS;
  return period - ((elapsed - TURN_MS) % period);
}
