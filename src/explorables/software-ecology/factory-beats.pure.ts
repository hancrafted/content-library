/*
 * A preset's beat plan (design-ADR 0024 §10, §12): for each beat its dials, the model step it is read from and the
 * step it ends on, and the measures it reads. The page's tour (`factory-tour.pure.ts`) and the headless judge
 * (`factory-scenario.pure.ts`) both take their stops and sample windows from here, so they cannot drift apart.
 */
import { stepsTo } from './beat-means.pure.ts';
import type { Preset, StepSet, TourStep } from './software-ecology.types';

/** The steps of a preset: its tour, or its check as one step. */
export const stepsOf = (p: Preset): readonly TourStep[] => (p.tour ? p.tour : p.check ? [p.check] : []);

/** One beat on the model's step clock. */
export interface Beat {
  readonly i: number;
  readonly step: TourStep;
  /** The beat's dials, applied when it starts. */
  readonly set: StepSet | undefined;
  /** The model step the beat runs from: the end of the beat before, or the scenario's start. */
  readonly start: number;
  /** The model step the beat ends on and is read at. */
  readonly end: number;
  /** The measures every beat of the preset reads: those its `expect:` ranges name. */
  readonly keys: readonly string[];
}

/** The beats of a preset for a scenario that starts on model step `t0k`. */
export const beatsOf = (p: Preset, t0k: number): Beat[] => beatsOfSteps(stepsOf(p), t0k);

/** The beats of these steps, for a scenario that starts on model step `t0k`. */
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
