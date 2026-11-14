// A guided tour as the page drives it, for the tour's tests in both lanes: frames of real time at the tour's speed, a
// stop on each step's model step, the checks read there, beside what the headless runner reads (design-ADR 0024 §10, §12).
import type { FactoryRun } from './factory-run.pure.ts';
import { runScenario } from './factory-scenario.pure.ts';
import { nextTour, tickTour, TOUR_SPEED, tourChecks, type Tour } from './factory-tour.pure.ts';
import type { Bundle } from './software-ecology.types';

const FRAME = 1 / 60;

/** Drives a tour frame by frame until its current step shows; returns the tour then. */
export const playStep = (run: FactoryRun, t0: Tour): Tour => {
  let t = t0;
  for (let f = 0; f < 200_000 && t.phase !== 'show'; f++) {
    run.advance(FRAME, TOUR_SPEED);
    t = tickTour(run, t);
  }
  return t;
};

/** A step's checks as "key=value" with two decimals. */
export const checksShown = (t: Tour): string[] => tourChecks(t).map((c) => `${c.key}=${c.v.toFixed(2)}`);

/** Every step's checks, the tour played to its end. */
export const shown = (run: FactoryRun, t0: Tour): string[][] => {
  const rows: string[][] = [];
  let t: Tour | null = t0;
  while (t) {
    t = playStep(run, t);
    rows.push(checksShown(t));
    t = nextTour(run, t);
  }
  return rows;
};

/** Every step's checks as the headless runner reads them. */
export const headless = (bundle: Bundle, id: string): string[][] =>
  runScenario(bundle, id).map((r) => r.checks.map((c) => `${c.key}=${c.v.toFixed(2)}`));
