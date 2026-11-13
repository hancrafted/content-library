/*
 * A beat's reading (design-ADR 0024 §12, grill 11 Q208, Q224): the mean of each measure over the beat's last WINDOW
 * weeks, sampled SAMPLES_A_WEEK times a week. The headless judge (`factory-scenario.pure.ts`) and the page's tour
 * (`factory-tour.pure.ts`, through `FactoryRun`) read on the same model steps and average them here, so the page's
 * checks and `ecology:sim` judge the same numbers.
 */
import { DTW } from './factory-dials.pure.ts';

/** Weeks at a beat's end its readings are averaged over. */
export const WINDOW = 2;
/** Samples a week inside the window. */
const SAMPLES_A_WEEK = 8;

/** Each measure's value by its key. */
export type Values = Readonly<Record<string, number>>;

/** Weeks from the scenario start to model steps: the page and the runner stop on the same step. */
export const stepsTo = (weeks: number): number => Math.round(weeks / DTW);

/**
 * The model steps a beat that runs from step `start` to step `end` is read on: every 1/SAMPLES_A_WEEK week over its
 * last `window` weeks (WINDOW unless told), the last on `end`; a beat shorter than the window is read over all of it,
 * and a window of 0 reads `end` once.
 */
const sampleSteps = (x: { start: number; end: number; window?: number }): number[] => {
  const w = Math.min(x.end - x.start, stepsTo(x.window ?? WINDOW)),
    every = Math.max(1, Math.round(1 / SAMPLES_A_WEEK / DTW));
  if (w <= 0) return [x.end];
  const out: number[] = [];
  for (let done = 0; done < w;) {
    done += Math.min(every, w - done);
    out.push(x.end - w + done);
  }
  return out;
};

/** The model a Sampler reads: stepped in weeks, read by measure. */
interface Sampled {
  step(weeks: number): void;
  read(o: { measures: readonly string[] }): { readonly measures: Values };
}

/** A beat's readings: it steps a model and reads it on the beat's sample steps, then gives their mean. */
export interface Sampler {
  /**
   * Steps a model `n` model steps on from step `k`, stopping on each sample step it reaches to read the measures: the
   * one stepper the headless judge and the page's run share, so both read on the same steps.
   */
  run(f: Sampled, x: { k: number; n: number }): void;
  /** The beat's reading: the mean of each measure over the readings so far; 0 for a measure with none. */
  mean(): Values;
  /** The readings taken so far, one per sample step reached. */
  readonly readings: readonly Values[];
}

/** A Sampler for the beat that runs from step `start` to step `end`, reading `keys` (`window` weeks, WINDOW unless told). */
export const createSampler = (x: { start: number; end: number; window?: number; keys: readonly string[] }): Sampler => {
  const at = sampleSteps(x),
    got: Values[] = [];
  return {
    run(f, r) {
      const stop = r.k + r.n;
      let k = r.k;
      for (let next = at[got.length]; next !== undefined && next <= stop; next = at[got.length]) {
        if (next > k) f.step((next - k) * DTW);
        k = Math.max(k, next);
        got.push({ ...f.read({ measures: x.keys }).measures });
      }
      if (stop > k) f.step((stop - k) * DTW);
    },
    mean: () => meanOf(x.keys, got),
    get readings() {
      return got;
    },
  };
};

/** A beat's reading: the mean of each measure over its samples; 0 for a beat with none. */
const meanOf = (keys: readonly string[], samples: readonly Values[]): Values =>
  Object.fromEntries(
    keys.map((k) => [k, samples.length ? samples.reduce((a, v) => a + (v[k] ?? 0), 0) / samples.length : 0]),
  );
