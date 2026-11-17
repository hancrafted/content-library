// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import { describe, expect, it } from 'vitest';
import { checksShown, headless, playStep, shown } from './factory-tour.fixture.ts';
import { backTour, nextTour, startTour, tourClock, type Tour } from './factory-tour.pure.ts';
import type { Bundle, Preset } from './software-ecology.types';
import { builtinBundle } from './use-case-data.ts';

const PROBE: Preset = {
  id: 'probe',
  view: 'factory',
  reality: 100,
  tour: [
    { run: 4, card: 'eng', expect: { 'customer.output': '>1.15', 'qa.weeksWaiting': '>2' } },
    { set: { ai: ['eng'], dials: { eng: { aiExtra: 2 } } }, run: 8, card: 'qa', expect: { 'qa.weeksWaiting': '>2' } },
    { run: 20, card: 'customer', expect: { 'customer.output': '0.4–0.75', 'qa.backlog': '>200' } },
  ],
};
const tire = builtinBundle('tire');
const B: Bundle = { ...tire, data: { ...tire.data, presets: [...tire.data.presets, PROBE] } };

describe('success cases', () => {
  it('the probe tour: every step shows the values the headless runner reads', () => {
    // ARRANGE
    const expected = headless(B, 'probe');
    const started = startTour(B, 'probe', { userSpeed: 5 });
    if (!started) throw new Error('no tour');
    // ACT
    const seen = shown(started.run, started.tour);
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('Back replays to the step before at once and shows its values again', () => {
    // ARRANGE
    const expected = headless(B, 'probe')[1];
    const started = startTour(B, 'probe', { userSpeed: 5 });
    if (!started) throw new Error('no tour');
    let t = playStep(started.run, started.tour);
    for (let i = 0; i < 2; i++) t = playStep(started.run, nextTour(started.run, t) as Tour);
    // ACT
    const back = backTour(B, t);
    const seen = checksShown(back.tour);
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
    const started = startTour(B, 'probe', { userSpeed: 5 });
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
