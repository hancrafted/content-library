/*
 * A guided tour on the page (design-ADR 0024 §10): a scenario's steps, each setting its dials, running at 20× to its
 * week and pausing there with its caption and its checks. It starts from the file's own settings, warmed as the
 * headless runner warms, and reads on the very model steps `runScenario` reads (the mean over a step's last WINDOW
 * weeks (`beat-means.pure.ts`), `sampleSteps` and `meanOf`), so both read the same values; Back
 * replays from the start at once, with the same seed and the same steps. Ported from the reference build's
 * `startTour`, `tourGo`, `tourArrived`, `tourReplay` and `fmtTourClock`. No DOM: the hook drives it.
 */
import { meanOf, sampleSteps, stepsTo } from './beat-means.pure.ts';
import { DAYS, DTW, startSettings } from './factory-dials.pure.ts';
import { FactoryRun, presetOf } from './factory-run.pure.ts';
import { settingsAfter, stepsOf, type Check } from './factory-scenario.pure.ts';
import { judge } from './scenario-tests.pure.ts';
import type { Bundle, Preset } from './software-ecology.types';

/** A tour runs at 20× between its steps (Q118; 10× before the 1× was halved, so the pace is the same). */
export const TOUR_SPEED = 20;

export interface Tour {
  readonly preset: Preset;
  /** The step on show or on its way, from 0. */
  readonly i: number;
  /** Warming the line first, running to the step's week, or paused there. */
  readonly phase: 'warm' | 'run' | 'show';
  /** The model step the tour started on, once the line is warm. */
  readonly t0k: number | null;
  /** Each shown step's readings of every measure the tour names. */
  readonly vals: readonly Readonly<Record<string, number>>[];
  /** The speed the viewer had; Close gives it back. */
  readonly userSpeed: number;
}

export interface TourRun {
  readonly run: FactoryRun;
  readonly tour: Tour;
}

const keysOf = (p: Preset): string[] => [...new Set(stepsOf(p).flatMap((st) => Object.keys(st.expect ?? {})))];

const stepOf = (t: Tour) => stepsOf(t.preset)[t.i];

/**
 * Sets the run to stop on step `i`'s week and to read on its sample steps, the headless judge's: a step's reading is
 * the mean over its last WINDOW weeks (grill 11 Q224).
 */
const aimAtStep = (run: FactoryRun, x: { p: Preset; i: number; t0k: number }) => {
  const steps = stepsOf(x.p),
    st = steps[x.i] as (typeof steps)[number];
  run.set(settingsAfter(st.set, run.topology.B, run.settings));
  const end = x.t0k + stepsTo(st.run);
  run.aim({
    at: end,
    sampling: {
      at: sampleSteps({ start: x.t0k + stepsTo(steps[x.i - 1]?.run ?? 0), end }),
      keys: keysOf(x.p),
      got: [],
    },
  });
};

/** The step's reading: the mean of what the run read on its sample steps. */
const readMean = (run: FactoryRun, p: Preset): Record<string, number> => ({
  ...meanOf(keysOf(p), run.sampled),
});

/** Applies the step's dials and sets the run to stop on its week. */
const go = (run: FactoryRun, t: Tour): Tour => {
  const t0k = t.t0k ?? run.k;
  aimAtStep(run, { p: t.preset, i: t.i, t0k });
  return { ...t, t0k, phase: 'run' };
};

const arrive = (run: FactoryRun, t: Tour): Tour => {
  const vals = [...t.vals];
  vals[t.i] = readMean(run, t.preset);
  return { ...t, vals, phase: 'show' };
};

/** A fresh run of the preset from the file's settings, and its tour; null for a state without a tour. */
export const startTour = (B: Bundle, id: string, o: { userSpeed: number }): TourRun | null => {
  const preset = presetOf(B, id);
  if (preset.id !== id || !preset.tour?.length) return null;
  const run = new FactoryRun({ B, preset: id, now: false, s: startSettings(B, preset) });
  const tour: Tour = { preset, i: 0, phase: 'warm', t0k: null, vals: [], userSpeed: o.userSpeed };
  return { run, tour: run.warming ? tour : go(run, tour) };
};

/** After a frame: on once the line is warm, paused once the step's week is reached. The same tour when nothing changed. */
export const tickTour = (run: FactoryRun, t: Tour): Tour => {
  if (t.phase === 'warm' && !run.warming) return go(run, t);
  if (t.phase === 'run' && run.arrived) return arrive(run, t);
  return t;
};

/** Under reduced motion or off screen: the step's week at once. */
export const settleTour = (run: FactoryRun, t: Tour): Tour => {
  let x = tickTour(run, t);
  if (x.phase === 'warm') {
    run.finishWarm();
    x = tickTour(run, x);
  }
  if (x.phase === 'run' && run.stopAt !== null) run.runTo(run.stopAt);
  return tickTour(run, x);
};

/** On to the next step; null after the last, the run free to go on at the viewer's speed. */
export const nextTour = (run: FactoryRun, t: Tour): Tour | null => {
  if (t.i >= stepsOf(t.preset).length - 1) {
    run.aim(null);
    return null;
  }
  return go(run, { ...t, i: t.i + 1 });
};

/** Back: a new run replayed at once from the start to the step before, shown there. */
export const backTour = (B: Bundle, t: Tour): TourRun => {
  const idx = Math.max(0, t.i - 1),
    p = t.preset;
  const run = new FactoryRun({ B, preset: p.id, now: true, s: startSettings(B, p) });
  const t0k = run.k,
    vals: Record<string, number>[] = [];
  stepsOf(p)
    .slice(0, idx + 1)
    .forEach((st, j) => {
      aimAtStep(run, { p, i: j, t0k });
      run.runTo(t0k + stepsTo(st.run));
      vals[j] = readMean(run, p);
    });
  run.aim({ at: run.k, sampling: null });
  return { run, tour: { ...t, i: idx, phase: 'show', t0k, vals } };
};

/** The step's checks with the model's values, judged against the step before. Empty until the step shows. */
export const tourChecks = (t: Tour): Check[] => {
  const vals = t.vals[t.i];
  if (t.phase !== 'show' || !vals) return [];
  const prev = t.vals[t.i - 1] ?? {};
  return Object.entries(stepOf(t).expect ?? {}).map(([key, test]) => ({
    key,
    test,
    v: vals[key] as number,
    prev: prev[key],
    ok: judge(vals[key] as number, test, prev[key]),
  }));
};

/** The step's card, where its caption points. */
export const tourCard = (t: Tour): string | undefined => stepOf(t).card;
/** The step's week, as the file names it. */
export const tourWeekOf = (t: Tour): number => stepOf(t).run;
export const tourLength = (t: Tour): number => stepsOf(t.preset).length;

/** Weeks since the tour started, for "Running to week 8… week 5". */
export const tourWeeks = (run: FactoryRun, t: Tour): number => (t.t0k === null ? 0 : (run.k - t.t0k) * DTW);

/** The clock while a tour runs: weeks and working days from its start; null while the line still warms. */
export const tourClock = (run: FactoryRun, t: Tour): { week: number; day: number } | null => {
  if (t.t0k === null) return null;
  const d = Math.floor((run.k - t.t0k) * DTW * DAYS + 1e-9);
  return { week: Math.floor(d / DAYS), day: (d % DAYS) + 1 };
};
