import { zoomAgent, toDefinition, type AgentSlice, type Level } from './agent-state.pure';
import type { ViewId } from './brief-or-pay-the-price.types';
import { MAX_STEP, clampStep } from './workflow-annotations.pure';

export interface WorkflowSlice<Memory> extends AgentSlice<Memory> {
  readonly braceStep: number;
  readonly playing: boolean;
}

export const WORKFLOW_REST = { braceStep: 0, playing: false } as const;

export type WorkflowEvent =
  | { readonly type: 'node'; readonly node: string }
  | { readonly type: 'braceStep'; readonly step: number }
  | { readonly type: 'play' }
  | { readonly type: 'tick' };

export const PLAY_MILLISECONDS = 2200;

const atRest = (state: WorkflowSlice<unknown>): boolean => state.braceStep === 0 && !state.playing;

export const showDefinition = <S extends WorkflowSlice<unknown>>(state: S, view: ViewId): S => {
  const next = toDefinition(state, view);
  return atRest(next) ? next : { ...next, ...WORKFLOW_REST };
};

export function zoomTo<S extends WorkflowSlice<unknown>>(state: S, level: Level): S {
  const next = zoomAgent(state, level);
  if (next === state) return state;
  const fromBrace = state.level === 'define' && state.view === 'brace';
  return {
    ...next,
    ...WORKFLOW_REST,
    braceStep: level === 'workflow' && !fromBrace ? 1 : 0,
  };
}

export const selectNode = <S extends WorkflowSlice<unknown>>(state: S, node: string): S => ({
  ...zoomTo(state, 'agent'),
  node,
});

export const braceStep = <S extends WorkflowSlice<unknown>>(state: S, step: number): S =>
  state.braceStep === clampStep(step) && !state.playing
    ? state
    : { ...state, braceStep: clampStep(step), playing: false };

export function togglePlay<S extends WorkflowSlice<unknown>>(state: S): S {
  if (state.playing) return { ...state, playing: false };
  return {
    ...state,
    playing: true,
    braceStep: state.braceStep >= MAX_STEP ? 1 : state.braceStep,
  };
}

export function tick<S extends WorkflowSlice<unknown>>(state: S): S {
  if (!state.playing) return state;
  const next = clampStep(state.braceStep + 1);
  return { ...state, braceStep: next, playing: next < MAX_STEP };
}

export const switchScenario = <S extends WorkflowSlice<unknown> & { readonly scenario: string }>(
  state: S,
  scenario: string,
): S => {
  if (state.scenario === scenario) return state;
  const braceStep = state.level === 'workflow' ? 1 : state.braceStep;
  return { ...state, scenario, braceStep, playing: false };
};
