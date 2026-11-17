// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { stepsTo } from './beat-means.pure.ts';
import type { Preset, StepSet, TourStep } from './software-ecology.types';

export const stepsOf = (p: Preset): readonly TourStep[] => (p.tour ? p.tour : p.check ? [p.check] : []);

export interface Beat {
  readonly i: number;
  readonly step: TourStep;
  readonly set: StepSet | undefined;
  readonly start: number;
  readonly end: number;
  readonly keys: readonly string[];
}

export const beatsOf = (p: Preset, t0k: number): Beat[] => beatsOfSteps(stepsOf(p), t0k);

export const beatsOfSteps = (steps: readonly TourStep[], t0k: number): Beat[] => {
  const keys = [...new Set(steps.flatMap((st) => Object.keys(st.expect ?? {})))];
  return steps.map((step, i) => ({
    i,
    step,
    set: step.set,
    start: t0k + stepsTo(steps[i - 1]?.run ?? 0),
    end: t0k + stepsTo(step.run),
    keys,
  }));
};
