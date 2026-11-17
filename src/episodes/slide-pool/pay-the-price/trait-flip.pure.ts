export const TRAITS = ['probabilistic', 'relentless', 'informed', 'confident', 'every-word-billed'] as const;
export type Trait = (typeof TRAITS)[number];

export type Side = 'freelancer' | 'ai';

export type FlipTarget = Trait | 'closing';

export interface FlipState {
  readonly open: FlipTarget | null;
  readonly passes: Readonly<Record<Trait, number>>;
  readonly turned: readonly `${Trait}:${Side}`[];
  readonly blank: boolean;
}

export const CLOSED: FlipState = {
  open: null,
  passes: { probabilistic: 0, relentless: 0, informed: 0, confident: 0, 'every-word-billed': 0 },
  turned: [],
  blank: false,
};

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

export function flip(state: FlipState, event: FlipEvent): FlipState {
  return (ON[event.type] as (state: FlipState, event: FlipEvent) => FlipState)(state, event);
}

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

export const HOLD_MILLISECONDS = 1500;

export const BEAT_MILLISECONDS: Readonly<Record<Trait, number>> = {
  probabilistic: 2600,
  relentless: 3600,
  informed: 3600,
  confident: 2900,
  'every-word-billed': 9900,
};

const BLANK_MILLISECONDS = 900;

export function nextTimer(state: Pick<FlipState, 'open' | 'blank'>): { milliseconds: number; event: FlipEvent } | null {
  if (state.open === null) return null;
  if (state.open === 'closing')
    return state.blank ? null : { milliseconds: BLANK_MILLISECONDS, event: { type: 'blank' } };
  return {
    milliseconds: BEAT_MILLISECONDS[state.open] + HOLD_MILLISECONDS,
    event: { type: 'replay', target: state.open },
  };
}
