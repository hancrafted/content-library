import { describe, expect, it } from 'vitest';
import { DTW, startSettings, WARM_WEEKS } from './factory-dials.pure.ts';
import { FactoryRun, MAX_STEPS, presetOf, SPEED_1X, SPEEDS, startSpeedOf, WARM_CHUNK } from './factory-run.pure.ts';
import { builtinBundle } from './use-case-data.ts';

describe('success cases', () => {
  it('warms a preset 60 weeks at once when asked to', () => {
    // ARRANGE
    const B = builtinBundle('tire'),
      digits = 6;
    // ACT
    const run = new FactoryRun({ B, preset: 'ideal', now: true });
    // ASSERT
    expect(run.weeks).toBeCloseTo(WARM_WEEKS, digits);
    expect(run.warming).toBe(false);
  });

  it('warms across frames in chunks, then runs at the chosen speed', () => {
    // ARRANGE
    const run = new FactoryRun({ B: builtinBundle('tire'), preset: 'realistic', now: false });
    const frames = Math.ceil(WARM_WEEKS / DTW / WARM_CHUNK);
    const second = 1,
      speed = 10,
      expected = WARM_WEEKS + second * speed * SPEED_1X,
      digits = 2;
    // ACT
    let ended = false;
    for (let i = 0; i < frames; i++) ended = run.advance(1 / 60, speed);
    for (let i = 0; i < 60; i++) run.advance(second / 60, speed);
    // ASSERT
    expect(ended).toBe(true);
    expect(run.weeks).toBeCloseTo(expected, digits);
  });
});

describe('failure cases', () => {
  it('drops time instead of spiralling when a frame is late', () => {
    // ARRANGE
    const run = new FactoryRun({ B: builtinBundle('tire'), preset: 'ideal', now: true });
    const t0 = run.weeks,
      longest = MAX_STEPS * DTW,
      digits = 6;
    // ACT
    run.advance(10, 10);
    // ASSERT
    expect(run.weeks - t0).toBeCloseTo(longest, digits);
    expect(run.dropped).toBeGreaterThan(0);
  });
});

describe('edge cases', () => {
  it('plays 1× at 1/32 week a real second, with the speeds 1, 2, 5, 10 and 20 and pause', () => {
    // ARRANGE
    const perSecond = 1 / 32,
      speeds = [0, 1, 2, 5, 10, 20];
    // ACT
    const seen = { x1: SPEED_1X, all: [...SPEEDS] };
    // ASSERT
    expect(seen).toEqual({ x1: perSecond, all: speeds });
  });

  it('starts from the settings it is given, so Clear keeps a dial the viewer turned', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    const turned = { ...startSettings(B, presetOf(B, 'ideal')), over: { qa: { eff: 300 } } };
    const eff = 300;
    // ACT
    const run = new FactoryRun({ B, preset: 'ideal', now: false, clear: true, s: turned });
    // ASSERT
    expect(run.settings.over.qa?.eff).toBe(eff);
    expect(run.weeks).toBe(0);
  });

  it('starts empty at day 0 on Clear and on a preset that starts clear', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    // ACT
    const cleared = new FactoryRun({ B, preset: 'ideal', now: true, clear: true });
    const spiral = new FactoryRun({ B, preset: 'bug-spiral', now: true });
    // ASSERT
    expect(cleared.weeks).toBe(0);
    expect(spiral.weeks).toBe(0);
  });

  it('stops on the step a tour names and stays there, whatever the speed', () => {
    // ARRANGE
    const run = new FactoryRun({ B: builtinBundle('tire'), preset: 'ideal', now: true });
    const stop = run.k + 25;
    // ACT
    run.stopAt = stop;
    for (let i = 0; i < 120; i++) run.advance(1 / 60, 10);
    // ASSERT
    expect(run.k).toBe(stop);
    expect(run.arrived).toBe(true);
  });

  it('falls back to the first factory preset for an unknown id', () => {
    // ARRANGE
    const fallback = 'ideal';
    // ACT
    const run = new FactoryRun({ B: builtinBundle('tire'), preset: 'nope', now: false });
    // ASSERT
    expect(run.preset.id).toBe(fallback);
  });

  it('opens the retired swing state as the roles state', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    // ACT
    const p = presetOf(B, 'swing');
    // ASSERT
    expect(p).toMatchObject({ id: 'roles', view: 'roles' });
  });

  it('starts the page at 1×, unless the state names its own speed', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    const viewer = 1,
      spiral = 20;
    // ACT
    const atRoles = startSpeedOf(B, 'roles'),
      atSpiral = startSpeedOf(B, 'bug-spiral');
    // ASSERT
    expect(atRoles).toBe(viewer);
    expect(atSpiral).toBe(spiral);
  });
});
