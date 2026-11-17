// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { createSampler, stepsTo } from './beat-means.pure.ts';
import { beatsOf, stepsOf, type Beat } from './factory-beats.pure.ts';
import { DAYS, DTW } from './factory-dials.pure.ts';
import { FactoryRun, presetOf } from './factory-run.pure.ts';
import { settingsAfter, type Check } from './factory-scenario.pure.ts';
import { judge } from './scenario-tests.pure.ts';
import type { Bundle, Preset } from './software-ecology.types';
import { startSettings } from './start-settings.pure.ts';

export const TOUR_SPEED = 20;

export interface Tour {
  readonly preset: Preset;
  readonly i: number;
  readonly phase: 'warm' | 'run' | 'show';
  readonly t0k: number | null;
  readonly vals: readonly Readonly<Record<string, number>>[];
  readonly userSpeed: number;
}

export interface TourRun {
  readonly run: FactoryRun;
  readonly tour: Tour;
}

const stepOf = (t: Tour) => stepsOf(t.preset)[t.i];

const aimAtStep = (run: FactoryRun, x: { p: Preset; i: number; t0k: number }) => {
  const b = beatsOf(x.p, x.t0k)[x.i] as Beat;
  run.set(settingsAfter(b.set, run.topology.B, run.settings));
  run.aim({ at: b.end, sampling: createSampler(b) });
};

const readMean = (run: FactoryRun): Record<string, number> => ({ ...run.sampledMean() });

const go = (run: FactoryRun, t: Tour): Tour => {
  const t0k = t.t0k ?? run.k;
  aimAtStep(run, { p: t.preset, i: t.i, t0k });
  return { ...t, t0k, phase: 'run' };
};

const arrive = (run: FactoryRun, t: Tour): Tour => {
  const vals = [...t.vals];
  vals[t.i] = readMean(run);
  return { ...t, vals, phase: 'show' };
};

export const startTour = (B: Bundle, id: string, o: { userSpeed: number }): TourRun | null => {
  const preset = presetOf(B, id);
  if (preset.id !== id || !preset.tour?.length) return null;
  const run = new FactoryRun({ B, preset: id, now: false, s: startSettings(B, preset) });
  const tour: Tour = { preset, i: 0, phase: 'warm', t0k: null, vals: [], userSpeed: o.userSpeed };
  return { run, tour: run.warming ? tour : go(run, tour) };
};

export const tickTour = (run: FactoryRun, t: Tour): Tour => {
  if (t.phase === 'warm' && !run.warming) return go(run, t);
  if (t.phase === 'run' && run.arrived) return arrive(run, t);
  return t;
};

export const settleTour = (run: FactoryRun, t: Tour): Tour => {
  let x = tickTour(run, t);
  if (x.phase === 'warm') {
    run.finishWarm();
    x = tickTour(run, x);
  }
  if (x.phase === 'run' && run.stopAt !== null) run.runTo(run.stopAt);
  return tickTour(run, x);
};

export const nextTour = (run: FactoryRun, t: Tour): Tour | null => {
  if (t.i >= stepsOf(t.preset).length - 1) {
    run.aim(null);
    return null;
  }
  return go(run, { ...t, i: t.i + 1 });
};

export const backTour = (B: Bundle, t: Tour): TourRun => {
  const idx = Math.max(0, t.i - 1),
    p = t.preset;
  const run = new FactoryRun({ B, preset: p.id, now: true });
  const t0k = run.k,
    vals: Record<string, number>[] = [];
  stepsOf(p)
    .slice(0, idx + 1)
    .forEach((st, j) => {
      aimAtStep(run, { p, i: j, t0k });
      run.runTo(t0k + stepsTo(st.run));
      vals[j] = readMean(run);
    });
  run.aim({ at: run.k, sampling: null });
  return { run, tour: { ...t, i: idx, phase: 'show', t0k, vals } };
};

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

export const tourCard = (t: Tour): string | undefined => stepOf(t).card;
export const tourWeekOf = (t: Tour): number => stepOf(t).run;
export const tourLength = (t: Tour): number => stepsOf(t.preset).length;

export const tourWeeks = (run: FactoryRun, t: Tour): number => (t.t0k === null ? 0 : (run.k - t.t0k) * DTW);

export const tourClock = (run: FactoryRun, t: Tour): { week: number; day: number } | null => {
  if (t.t0k === null) return null;
  const d = Math.floor((run.k - t.t0k) * DTW * DAYS + 1e-9);
  return { week: Math.floor(d / DAYS), day: (d % DAYS) + 1 };
};
