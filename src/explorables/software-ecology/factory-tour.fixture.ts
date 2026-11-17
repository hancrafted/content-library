// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import type { FactoryRun } from './factory-run.pure.ts';
import { runScenario } from './factory-scenario.pure.ts';
import { nextTour, tickTour, TOUR_SPEED, tourChecks, type Tour } from './factory-tour.pure.ts';
import type { Bundle } from './software-ecology.types';

const FRAME = 1 / 60;

export const playStep = (run: FactoryRun, t0: Tour): Tour => {
  let t = t0;
  for (let f = 0; f < 200_000 && t.phase !== 'show'; f++) {
    run.advance(FRAME, TOUR_SPEED);
    t = tickTour(run, t);
  }
  return t;
};

export const checksShown = (t: Tour): string[] => tourChecks(t).map((c) => `${c.key}=${c.v.toFixed(2)}`);

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

export const headless = (bundle: Bundle, id: string): string[][] =>
  runScenario(bundle, id).map((r) => r.checks.map((c) => `${c.key}=${c.v.toFixed(2)}`));
