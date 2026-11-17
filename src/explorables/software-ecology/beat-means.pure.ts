// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { WEEKS_PER_STEP } from './factory-dials.pure.ts';

export const WINDOW_WEEKS = 2;
const SAMPLES_A_WEEK = 8;

export type Values = Readonly<Record<string, number>>;

export const stepsTo = (weeks: number): number => Math.round(weeks / WEEKS_PER_STEP);

const sampleSteps = (x: { start: number; end: number; window?: number }): number[] => {
  const w = Math.min(x.end - x.start, stepsTo(x.window ?? WINDOW_WEEKS)),
    every = Math.max(1, Math.round(1 / SAMPLES_A_WEEK / WEEKS_PER_STEP));
  if (w <= 0) return [x.end];
  const out: number[] = [];
  for (let done = 0; done < w;) {
    done += Math.min(every, w - done);
    out.push(x.end - w + done);
  }
  return out;
};

interface Sampled {
  step(weeks: number): void;
  read(o: { measures: readonly string[] }): { readonly measures: Values };
}

export interface Sampler {
  run(f: Sampled, x: { k: number; n: number }): void;
  mean(): Values;
  readonly readings: readonly Values[];
}

export const createSampler = (x: { start: number; end: number; window?: number; keys: readonly string[] }): Sampler => {
  const at = sampleSteps(x),
    got: Values[] = [];
  return {
    run(f, r) {
      const stop = r.k + r.n;
      let k = r.k;
      for (let next = at[got.length]; next !== undefined && next <= stop; next = at[got.length]) {
        if (next > k) f.step((next - k) * WEEKS_PER_STEP);
        k = Math.max(k, next);
        got.push({ ...f.read({ measures: x.keys }).measures });
      }
      if (stop > k) f.step((stop - k) * WEEKS_PER_STEP);
    },
    mean: () => meanOf(x.keys, got),
    get readings() {
      return got;
    },
  };
};

const meanOf = (keys: readonly string[], samples: readonly Values[]): Values =>
  Object.fromEntries(
    keys.map((k) => [k, samples.length ? samples.reduce((a, v) => a + (v[k] ?? 0), 0) / samples.length : 0]),
  );
