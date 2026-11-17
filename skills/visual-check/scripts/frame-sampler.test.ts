import { describe, expect, it } from 'vitest';
import './frame-sampler.js';

interface Stats {
  frames: number;
  droppedFrames: number;
  droppedShare: number;
  p95: number;
}
const { frameStats } = globalThis as unknown as { frameStats: (deltas: number[], budget?: number) => Stats };

describe('success cases', () => {
  it('counts the dropped frames and the slowest twentieth, and lets jitter around 16.7 ms pass', () => {
    // ARRANGE
    const deltas = [...Array.from({ length: 9 }, () => 16.6), ...Array.from({ length: 9 }, () => 16.9), 33.3, 50];
    const expected = { frames: 20, droppedFrames: 2, droppedShare: 0.1, p95: 33.3 };
    // ACT
    const stats = frameStats(deltas);
    // ASSERT
    expect(stats).toEqual(expected);
  });

  it('judges against another threshold when given one, as for a 120 Hz display', () => {
    // ARRANGE
    const deltas = [8.3, 8.4, 9, 16.6];
    const budget = 12.5;
    const expected = { frames: 4, droppedFrames: 1, droppedShare: 0.25, p95: 16.6 };
    // ACT
    const stats = frameStats(deltas, budget);
    // ASSERT
    expect(stats).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reports no frames, none dropped, when no frame was sampled', () => {
    // ARRANGE
    const expected = { frames: 0, droppedFrames: 0, droppedShare: 0, p95: 0 };
    // ACT
    const stats = frameStats([]);
    // ASSERT
    expect(stats).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('counts a frame exactly on the threshold as delivered', () => {
    // ARRANGE
    const deltas = [25, 25, 25.1];
    const expected = { frames: 3, droppedFrames: 1, droppedShare: 0.333, p95: 25.1 };
    // ACT
    const stats = frameStats(deltas);
    // ASSERT
    expect(stats).toEqual(expected);
  });
});
