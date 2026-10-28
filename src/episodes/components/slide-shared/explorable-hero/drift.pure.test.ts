import { describe, expect, it } from 'vitest';
import {
  areaOf,
  beatOf,
  beatPoseOf,
  bubbleCountOf,
  createClock,
  END_PROGRESS,
  fieldAreaOf,
  motionOf,
  type Area,
} from './drift.pure';

const AREA: Area = { x: 100, y: 100, w: 400, h: 500, compact: false };

describe('success cases', () => {
  it('opens a subject beat every six seconds, lasting one and a half, easing in and out', () => {
    // ARRANGE
    const startOfBeat = 2;
    const midBeat = 2.75;
    const betweenBeats = 5;
    const nextBeat = 8;
    const half = 0.5;
    // ACT
    const start = beatOf(startOfBeat);
    const middle = beatOf(midBeat);
    const rest = beatOf(betweenBeats);
    const next = beatOf(nextBeat);
    // ASSERT
    expect(start.progress).toBe(0);
    expect(middle.progress).toBe(half);
    expect(middle.strength).toBe(1);
    expect(rest.progress).toBe(1);
    expect(rest.strength).toBe(0);
    expect(next.progress).toBe(0);
  });

  it('places the art beside the copy when room is left on its right, above it otherwise', () => {
    // ARRANGE
    const copy = [{ x: 336, y: 400, width: 600, height: 300 }];
    const textRight = 936;
    const gap = 24;
    const copyTop = 300;
    const wide = { width: 1440, height: 900, text: copy, top: 72, right: 1380 };
    const narrow = { width: 390, height: 844, text: [{ x: 16, y: 300, width: 358, height: 300 }], top: 72, right: 330 };
    // ACT
    const beside = areaOf(wide);
    const above = areaOf(narrow);
    // ASSERT
    expect(beside.compact).toBe(false);
    expect(beside.x).toBe(textRight + gap);
    expect(above.compact).toBe(true);
    expect(above.y + above.h).toBeLessThanOrEqual(copyTop);
  });

  it('makes the field half as wide again as the art area, extending left, with the same right edge, top and height', () => {
    // ARRANGE
    const area: Area = { x: 960, y: 76, w: 400, h: 500, compact: false };
    const wider = 1.5;
    // ACT
    const field = fieldAreaOf(area);
    // ASSERT
    expect(field.w).toBe(area.w * wider);
    expect(field.x + field.w).toBe(area.x + area.w);
    expect([field.y, field.h]).toEqual([area.y, area.h]);
  });

  it('adds up to a dozen ambient bubbles in proportion to the area', () => {
    // ARRANGE
    const phone = { width: 390, height: 844 };
    const desktop = { width: 1440, height: 900 };
    const huge = { width: 5000, height: 3000 };
    const least = 5;
    const most = 12;
    // ACT
    const counts = [phone, desktop, huge].map(({ width, height }) => bubbleCountOf(width, height));
    // ASSERT
    expect(counts).toEqual([least, most, most]);
  });

  it('keeps the Context bubble rising into the middle, fading as it goes', () => {
    // ARRANGE
    const start = 0;
    const end = 1;
    const startY = 100 + 500 * 0.86;
    const startAlpha = 0.75;
    // ACT
    const first = beatPoseOf({ story: 'context-window', progress: start, area: AREA, size: 40 });
    const last = beatPoseOf({ story: 'context-window', progress: end, area: AREA, size: 40 });
    // ASSERT
    expect(first?.y).toBeCloseTo(startY);
    expect(first?.alpha).toBeCloseTo(startAlpha);
    expect(last?.alpha).toBe(0);
  });

  it('holds the Human bubble on the checkpoint with its check drawn, then lifts it past it', () => {
    // ARRANGE
    const checkpoint = 100 + 500 * 0.49;
    const holding = 0.6;
    const done = 1;
    const top = 100 + 500 * 0.14;
    // ACT
    const at = beatPoseOf({ story: 'human-in-the-loop', progress: holding, area: AREA, size: 40 });
    const past = beatPoseOf({ story: 'human-in-the-loop', progress: done, area: AREA, size: 40 });
    // ASSERT
    expect(at?.y).toBe(checkpoint);
    expect(at?.check).toBe(1);
    expect(past?.y).toBeCloseTo(top);
  });

  it('climbs the Disciplines bubble one tier per quarter, gaining a chip at each', () => {
    // ARRANGE
    const quarters = [0.1, 0.35, 0.6, 0.99];
    const first = 0;
    const last = quarters.length - 1;
    const threeChips = 3;
    // ACT
    const chips = quarters.map(
      (p) => beatPoseOf({ story: 'ai-capability', progress: p, area: AREA, size: 40 })?.chips ?? -1,
    );
    // ASSERT
    expect(chips[first]).toBeLessThan(1);
    expect(chips[last]).toBeGreaterThan(threeChips);
    expect(chips).toEqual([...chips].sort((a, b) => a - b));
  });
});

describe('failure cases', () => {
  it('never lets the field reach past the left edge of the hero', () => {
    // ARRANGE
    const nearTheEdge: Area = { x: 100, y: 100, w: 400, h: 500, compact: true };
    const edge = 0;
    // ACT
    const field = fieldAreaOf(nearTheEdge);
    // ASSERT
    expect(field.x).toBe(edge);
    expect(field.x + field.w).toBe(nearTheEdge.x + nearTheEdge.w);
  });

  it('draws nothing of the Context bubble once its beat is over: it was forgotten', () => {
    // ARRANGE
    const finished = END_PROGRESS;
    // ACT
    const pose = beatPoseOf({ story: 'context-window', progress: finished, area: AREA, size: 40 });
    // ASSERT
    expect(pose?.alpha ?? 0).toBe(0);
  });

  it('stops the loop for reduced motion, a pause, a hidden tab and a Slide that is not active', () => {
    // ARRANGE
    const base = { reduced: false, paused: false, hidden: false, active: true };
    // ACT
    const states = [
      motionOf(base),
      motionOf({ ...base, reduced: true }),
      motionOf({ ...base, paused: true }),
      motionOf({ ...base, hidden: true }),
      motionOf({ ...base, active: false }),
    ];
    // ASSERT
    expect(states).toEqual(['running', 'reduced', 'paused', 'hidden', 'offscreen']);
  });
});

describe('edge cases', () => {
  it('moves the art above the copy when an open drawer takes the room on its right', () => {
    // ARRANGE
    const copy = [{ x: 336, y: 400, width: 600, height: 300 }];
    const drawerLeft = 1000;
    const hero = { width: 1440, height: 900, text: copy, top: 72, right: drawerLeft };
    // ACT
    const area = areaOf(hero);
    // ASSERT
    expect(area.compact).toBe(true);
    expect(area.x + area.w).toBeLessThanOrEqual(drawerLeft);
  });

  it('does not count paused time: a resume carries on from where the clock stopped', () => {
    // ARRANGE
    const clock = createClock();
    const twoSeconds = 2;
    const threeSeconds = 3;
    // ACT
    clock.tick(1000);
    const before = clock.tick(3000);
    clock.stop();
    const resumed = clock.tick(60000);
    const after = clock.tick(61000);
    // ASSERT
    expect(before).toBe(twoSeconds);
    expect(resumed).toBe(twoSeconds);
    expect(after).toBe(threeSeconds);
  });

  it('shows a composed end state under reduced motion: Human past the checkpoint, Disciplines with every chip', () => {
    // ARRANGE
    const human = END_PROGRESS;
    const top = 100 + 500 * 0.14;
    const allChips = 4;
    // ACT
    const checked = beatPoseOf({ story: 'human-in-the-loop', progress: human, area: AREA, size: 40 });
    const grown = beatPoseOf({ story: 'ai-capability', progress: human, area: AREA, size: 40 });
    // ASSERT
    expect(checked?.check).toBe(1);
    expect(checked?.y).toBeCloseTo(top);
    expect(grown?.chips).toBe(allChips);
  });
});
