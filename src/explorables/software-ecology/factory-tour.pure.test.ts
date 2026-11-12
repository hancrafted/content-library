import { describe, expect, it } from 'vitest';
import { FactoryRun } from './factory-run.pure.ts';
import { runScenario } from './factory-scenario.pure.ts';
import {
  backTour,
  nextTour,
  startTour,
  tickTour,
  TOUR_SPEED,
  tourChecks,
  tourClock,
  type Tour,
} from './factory-tour.pure.ts';
import { builtinBundle } from './use-case-data.ts';

/*
 * A guided tour as the page drives it: frames of real time at the tour's speed, a stop on each step's model step, the
 * checks read there. It must read what the headless runner reads, step by step (design-ADR 0024 §10, §12).
 */

const B = builtinBundle('tire');
const TOURS = B.data.presets.filter((p) => p.tour).map((p) => p.id);
const FRAME = 1 / 60;

/** Drives a tour frame by frame until its current step shows; returns the tour then. */
const playStep = (run: FactoryRun, t0: Tour): Tour => {
  let t = t0;
  for (let f = 0; f < 200_000 && t.phase !== 'show'; f++) {
    run.advance(FRAME, TOUR_SPEED);
    t = tickTour(run, t);
  }
  return t;
};

/** Every step's checks as "key=value" with two decimals. */
const shown = (run: FactoryRun, t0: Tour): string[][] => {
  const rows: string[][] = [];
  let t: Tour | null = t0;
  while (t) {
    t = playStep(run, t);
    rows.push(tourChecks(t).map((c) => `${c.key}=${c.v.toFixed(2)}`));
    t = nextTour(run, t);
  }
  return rows;
};

const headless = (id: string): string[][] =>
  runScenario(B, id).map((r) => r.checks.map((c) => `${c.key}=${c.v.toFixed(2)}`));

describe('success cases', () => {
  it.each(TOURS)('tire %s: every step shows the values the headless runner reads', (id) => {
    // ARRANGE
    const expected = headless(id);
    const started = startTour(B, id, { userSpeed: 5 });
    if (!started) throw new Error(`no tour ${id}`);
    // ACT
    const seen = shown(started.run, started.tour);
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('Back replays to the step before at once and shows its values again', () => {
    // ARRANGE
    const expected = headless('ai-unbalanced')[1];
    const started = startTour(B, 'ai-unbalanced', { userSpeed: 5 });
    if (!started) throw new Error('no tour');
    let t = playStep(started.run, started.tour);
    for (let i = 0; i < 2; i++) t = playStep(started.run, nextTour(started.run, t) as Tour);
    // ACT
    const back = backTour(B, t);
    const seen = tourChecks(back.tour).map((c) => `${c.key}=${c.v.toFixed(2)}`);
    // ASSERT
    expect(back.tour.phase).toBe('show');
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('starts no tour for a state without one', () => {
    // ARRANGE
    const id = 'realistic';
    // ACT
    const started = startTour(B, id, { userSpeed: 5 });
    // ASSERT
    expect(started).toBeNull();
  });
});

describe('edge cases', () => {
  it('reads the clock from the tour start, and Next on the last step ends the tour and frees the run', () => {
    // ARRANGE
    const lastWeek = 20;
    const started = startTour(B, 'ai-unbalanced', { userSpeed: 5 });
    if (!started) throw new Error('no tour');
    const { run } = started;
    let t = playStep(run, started.tour);
    for (let i = 0; i < 2; i++) t = playStep(run, nextTour(run, t) as Tour);
    // ACT
    const clock = tourClock(run, t);
    const after = nextTour(run, t);
    // ASSERT
    expect(clock).toEqual({ week: lastWeek, day: 1 });
    expect(after).toBeNull();
    expect(run.stopAt).toBeNull();
  });
});
