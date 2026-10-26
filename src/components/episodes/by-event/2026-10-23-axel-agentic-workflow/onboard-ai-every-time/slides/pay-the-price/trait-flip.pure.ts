/*
 * The trait flip's rules (.scratch/price-progressive-disclosure/handoff.md): which rows are shown, which pass each
 * plays, which cards are turned to their text, and the closing line's wipe. Pure, so the client part only keeps the
 * timer `nextTimer` names.
 */

/** The five PRICE traits, in letter order. */
export const TRAITS = ['probabilistic', 'relentless', 'informed', 'confident', 'every-word-billed'] as const;
export type Trait = (typeof TRAITS)[number];

/** A row's two cards: the freelancer's on the left, the AI's on the right. */
export type Side = 'freelancer' | 'ai';

/** What a control opens: one trait's row, or the closing line's wipe over every row. */
export type FlipTarget = Trait | 'closing';

export interface FlipState {
  /** The control pointed at or focused now. */
  readonly open: FlipTarget | null;
  /** Each row's passes so far: 0 until its chip is first entered; every entry and every loop starts one more. */
  readonly passes: Readonly<Record<Trait, number>>;
  /** The cards clicked round to their text, as `trait:side`. */
  readonly turned: readonly `${Trait}:${Side}`[];
  /** Whether the open wipe has blanked the rows. */
  readonly blank: boolean;
}

export const CLOSED: FlipState = {
  open: null,
  passes: { probabilistic: 0, relentless: 0, informed: 0, confident: 0, 'every-word-billed': 0 },
  turned: [],
  blank: false,
};

/**
 * `open`: a chip or the closing line is pointed at, focused or tapped. `leave`: the pointer leaves it or it blurs.
 * `dismiss`: a tap elsewhere or Escape. `reset`: the Slide leaving `active`, back to rest. `replay` and `blank`: the
 * timer firing. `turn`: a shown card is clicked.
 */
export type FlipEvent =
  | { readonly type: 'open'; readonly target: FlipTarget }
  | { readonly type: 'leave'; readonly target: FlipTarget }
  | { readonly type: 'dismiss' }
  | { readonly type: 'reset' }
  | { readonly type: 'replay'; readonly target: Trait }
  | { readonly type: 'blank' }
  | { readonly type: 'turn'; readonly target: Trait; readonly side: Side };

const nextPass = (state: FlipState, trait: Trait): FlipState => ({
  ...state,
  passes: { ...state.passes, [trait]: state.passes[trait] + 1 },
});

const closeAll = (state: FlipState): FlipState => ({ ...state, open: null, blank: false });

function open(state: FlipState, target: FlipTarget): FlipState {
  if (state.open === target) return state;
  const opened = { ...state, open: target, blank: false };
  return target === 'closing' ? opened : nextPass(opened, target);
}

function turn(state: FlipState, target: Trait, side: Side): FlipState {
  if (!rowAt(state, target).shown) return state;
  const card = `${target}:${side}` as const;
  const turned = state.turned.includes(card) ? state.turned.filter((each) => each !== card) : [...state.turned, card];
  return { ...state, turned };
}

type Handlers = {
  readonly [K in FlipEvent['type']]: (state: FlipState, event: Extract<FlipEvent, { type: K }>) => FlipState;
};

const ON: Handlers = {
  open: (state, { target }) => open(state, target),
  leave: (state, { target }) => (state.open === target ? closeAll(state) : state),
  dismiss: (state) => (state.open === null ? state : closeAll(state)),
  reset: () => CLOSED,
  replay: (state, { target }) => (state.open === target ? nextPass(state, target) : state),
  blank: (state) => (state.open === 'closing' && !state.blank ? { ...state, blank: true } : state),
  turn: (state, { target, side }) => turn(state, target, side),
};

/** One control open at a time; entering a row starts a new pass; leaving closes only what it opened, shown rows stay. */
export function flip(state: FlipState, event: FlipEvent): FlipState {
  return (ON[event.type] as (state: FlipState, event: FlipEvent) => FlipState)(state, event);
}

/** One row as drawn: shown once entered or while wiped, the pass its backs play, and which cards show their text. */
export function rowAt(state: FlipState, trait: Trait) {
  const wiping = state.open === 'closing';
  return {
    shown: state.passes[trait] > 0 || wiping,
    pass: state.passes[trait],
    looping: state.open === trait,
    blank: wiping && state.blank,
    turned: {
      freelancer: state.turned.includes(`${trait}:freelancer`),
      ai: state.turned.includes(`${trait}:ai`),
    },
  };
}

/** How long a back holds its last frame before it replays. */
export const HOLD_MS = 1500;

/** Each back's beat, from the prototype (`build2.py`); Every word billed is its five-item scan schedule's length. */
export const BEAT_MS: Readonly<Record<Trait, number>> = {
  probabilistic: 2600,
  relentless: 3600,
  informed: 3600,
  confident: 2900,
  'every-word-billed': 9900,
};

/** When the wipe blanks the rows, after every row has shown. */
const BLANK_MS = 900;

/** The next event the clock fires and in how many ms: the pointed row's replay, or the wipe's blank; `null` at rest. */
export function nextTimer(state: Pick<FlipState, 'open' | 'blank'>): { ms: number; event: FlipEvent } | null {
  if (state.open === null) return null;
  if (state.open === 'closing') return state.blank ? null : { ms: BLANK_MS, event: { type: 'blank' } };
  return { ms: BEAT_MS[state.open] + HOLD_MS, event: { type: 'replay', target: state.open } };
}
