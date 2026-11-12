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
export const sampleSteps = (x: { start: number; end: number; window?: number }): number[] => {
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

/** A beat's sample steps, the measures it reads and the readings taken so far. */
export interface Sampling {
  readonly at: readonly number[];
  readonly keys: readonly string[];
  readonly got: Values[];
}

/** The model a sampling reads: stepped in weeks, read by measure. */
interface Sampled {
  step(weeks: number): void;
  read(o: { measures: readonly string[] }): { readonly measures: Values };
}

/**
 * Steps a model `n` model steps on from step `k`, stopping on each of the sampling's steps it reaches to read its
 * measures: the one stepper the headless judge and the page's run share, so both read on the same steps.
 */
export const stepSampled = (f: Sampled, x: { k: number; n: number; s: Sampling | null }): void => {
  const { s } = x,
    stop = x.k + x.n;
  let k = x.k;
  for (let next = s?.at[s.got.length]; s && next !== undefined && next <= stop; next = s.at[s.got.length]) {
    if (next > k) f.step((next - k) * DTW);
    k = Math.max(k, next);
    s.got.push({ ...f.read({ measures: s.keys }).measures });
  }
  if (stop > k) f.step((stop - k) * DTW);
};

/** A beat's reading: the mean of each measure over its samples; 0 for a beat with none. */
export const meanOf = (keys: readonly string[], samples: readonly Values[]): Values =>
  Object.fromEntries(
    keys.map((k) => [k, samples.length ? samples.reduce((a, v) => a + (v[k] ?? 0), 0) / samples.length : 0]),
  );
