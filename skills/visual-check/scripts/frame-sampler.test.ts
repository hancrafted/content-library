import { describe, expect, it } from 'vitest';
import './frame-sampler.js';

/*
 * The frame sampler's statistics: from requestAnimationFrame deltas, how many frames, how many missed the 60 fps
 * budget (16.7 ms), their share and the 95th-percentile delta. The sampling itself needs a browser and is checked
 * there.
 */

interface Stats {
  frames: number;
  slowFrames: number;
  slowShare: number;
  p95: number;
}
const { frameStats } = globalThis as unknown as { frameStats: (deltas: number[], budget?: number) => Stats };

describe('success cases', () => {
  it('counts the frames that missed 60 fps and the slowest twentieth', () => {
    // ARRANGE
    const deltas = [...Array.from({ length: 18 }, () => 16.6), 33.3, 50];
    const expected = { frames: 20, slowFrames: 2, slowShare: 0.1, p95: 33.3 };
    // ACT
    const stats = frameStats(deltas);
    // ASSERT
    expect(stats).toEqual(expected);
  });

  it('judges against another budget when given one', () => {
    // ARRANGE
    const deltas = [8.3, 8.4, 9, 16.6];
    const budget = 8.4;
    const expected = { frames: 4, slowFrames: 2, slowShare: 0.5, p95: 16.6 };
    // ACT
    const stats = frameStats(deltas, budget);
    // ASSERT
    expect(stats).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reports no frames, none slow, when no frame was sampled', () => {
    // ARRANGE
    const expected = { frames: 0, slowFrames: 0, slowShare: 0, p95: 0 };
    // ACT
    const stats = frameStats([]);
    // ASSERT
    expect(stats).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('counts a frame exactly on the budget as on time', () => {
    // ARRANGE
    const deltas = [16.7, 16.7, 16.8];
    const expected = { frames: 3, slowFrames: 1, slowShare: 0.333, p95: 16.8 };
    // ACT
    const stats = frameStats(deltas);
    // ASSERT
    expect(stats).toEqual(expected);
  });
});
