import { zoomTo, type AgentSlice } from './agent-state.pure';
import { MAX_STEP } from './workflow-annotations.pure';

export type WorkflowEvent =
  | { readonly type: 'node'; readonly node: string }
  | { readonly type: 'braceStep'; readonly step: number }
  | { readonly type: 'play' }
  | { readonly type: 'tick' };

export const PLAY_MILLISECONDS = 2200;

const clamp = (step: number): number => Math.min(Math.max(Math.trunc(step), 0), MAX_STEP);

export const selectNode = <S extends AgentSlice<unknown>>(state: S, node: string): S => ({
  ...zoomTo(state, 'agent'),
  node,
});

export const braceStep = <S extends AgentSlice<unknown>>(state: S, step: number): S =>
  state.step === clamp(step) && !state.playing ? state : { ...state, step: clamp(step), playing: false };

export function togglePlay<S extends AgentSlice<unknown>>(state: S): S {
  if (state.playing) return { ...state, playing: false };
  return { ...state, playing: true, step: state.step >= MAX_STEP ? 1 : state.step };
}

export function tick<S extends AgentSlice<unknown>>(state: S): S {
  if (!state.playing) return state;
  const step = clamp(state.step + 1);
  return { ...state, step, playing: step < MAX_STEP };
}
