import { describe, expect, it } from 'vitest';
import { DTW, startSettings, WARM_WEEKS } from './factory-dials.pure.ts';
import { FactoryRun, MAX_STEPS, presetOf, SPEED_1X, WARM_CHUNK } from './factory-run.pure.ts';
import { builtinBundle } from './use-case-data.ts';

describe('success cases', () => {
  it('warms a preset 60 weeks at once when asked to', () => {
    // ARRANGE
    const B = builtinBundle('tire'),
      digits = 6;
    // ACT
    const run = new FactoryRun({ B, preset: 'ideal', now: true });
    // ASSERT
    expect(run.m.t).toBeCloseTo(WARM_WEEKS, digits);
    expect(run.warming).toBe(false);
  });

  it('warms across frames in chunks, then runs at the chosen speed', () => {
    // ARRANGE
    const run = new FactoryRun({ B: builtinBundle('tire'), preset: 'realistic', now: false });
    const frames = Math.ceil(WARM_WEEKS / DTW / WARM_CHUNK);
    const second = 1,
      speed = 5,
      expected = WARM_WEEKS + second * speed * SPEED_1X,
      digits = 2;
    // ACT
    let ended = false;
    for (let i = 0; i < frames; i++) ended = run.advance(1 / 60, speed);
    for (let i = 0; i < 60; i++) run.advance(second / 60, speed);
    // ASSERT
    expect(ended).toBe(true);
    expect(run.m.t).toBeCloseTo(expected, digits);
  });
});

describe('failure cases', () => {
  it('drops time instead of spiralling when a frame is late', () => {
    // ARRANGE
    const run = new FactoryRun({ B: builtinBundle('tire'), preset: 'ideal', now: true });
    const t0 = run.m.t,
      longest = MAX_STEPS * DTW,
      digits = 6;
    // ACT
    run.advance(10, 10);
    // ASSERT
    expect(run.m.t - t0).toBeCloseTo(longest, digits);
    expect(run.dropped).toBeGreaterThan(0);
  });
});

describe('edge cases', () => {
  it('starts from the settings it is given, so Clear keeps a dial the viewer turned', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    const turned = { ...startSettings(B, presetOf(B, 'ideal')), over: { qa: { eff: 300 } } };
    const eff = 300;
    // ACT
    const run = new FactoryRun({ B, preset: 'ideal', now: false, clear: true, s: turned });
    // ASSERT
    expect(run.m.s.over.qa?.eff).toBe(eff);
    expect(run.m.t).toBe(0);
  });

  it('starts empty at day 0 on Clear and on a preset that starts clear', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    // ACT
    const cleared = new FactoryRun({ B, preset: 'ideal', now: true, clear: true });
    const spiral = new FactoryRun({ B, preset: 'bug-spiral', now: true });
    // ASSERT
    expect(cleared.m.t).toBe(0);
    expect(spiral.m.t).toBe(0);
  });

  it('falls back to the first factory preset for an unknown id', () => {
    // ARRANGE
    const fallback = 'ideal';
    // ACT
    const run = new FactoryRun({ B: builtinBundle('tire'), preset: 'nope', now: false });
    // ASSERT
    expect(run.preset.id).toBe(fallback);
  });
});
