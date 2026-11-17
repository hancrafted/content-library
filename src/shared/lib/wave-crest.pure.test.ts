import { describe, expect, it } from 'vitest';
import { crestPath, waveCrest } from './wave-crest.pure';

describe('success cases', () => {
  it('draws the same crest for the same seed, left to right inside its box', () => {
    // ARRANGE
    const options = { seed: 7, width: 2000, height: 120, peaks: 9 };
    const expected = { firstX: 0, lastX: 2000, backwards: [], outside: [], again: [] };
    // ACT
    const crest = waveCrest(options);
    const again = waveCrest(options);
    const seen = {
      firstX: crest[0]![0],
      lastX: crest.at(-1)![0],
      backwards: crest.filter(([x], at) => at > 0 && x <= crest[at - 1]![0]),
      outside: crest.filter(([, y]) => y < 0 || y > options.height),
      again: again.filter((point, at) => point.join() !== crest[at]!.join()),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('raises taller and lower peaks, never one height for all', () => {
    // ARRANGE
    const height = 100;
    const tallReachesAbove = 15;
    const lowStaysBelow = 45;
    // ACT
    const crest = waveCrest({ seed: 3, width: 1600, height, peaks: 8 });
    const tops = crest
      .slice(1, -1)
      .filter(([, y], at) => y < crest[at]![1] && y < crest[at + 2]![1])
      .map(([, y]) => y);
    const seen = { tallest: Math.min(...tops), lowest: Math.max(...tops) };
    // ASSERT
    expect(seen.tallest).toBeLessThan(tallReachesAbove);
    expect(seen.lowest).toBeGreaterThan(lowStaysBelow);
  });

  it('closes the crest down to its base as one filled path', () => {
    // ARRANGE
    const points = [
      [0, 80],
      [50, 10],
      [100, 70],
    ] as const;
    const expected = 'M0 120L0 80L50 10L100 70L100 120Z';
    // ACT
    const path = crestPath(points, 120);
    // ASSERT
    expect(path).toBe(expected);
  });
});

describe('failure cases', () => {
  it('refuses fewer than two peaks, part of one, or an empty box', () => {
    // ARRANGE
    const expected = /wave crest needs/;
    const attempts = [
      { seed: 1, width: 1000, height: 100, peaks: 1 },
      { seed: 1, width: 1000, height: 100, peaks: 3.5 },
      { seed: 1, width: 0, height: 100, peaks: 4 },
      { seed: 1, width: 1000, height: -5, peaks: 4 },
    ];
    // ACT
    const calls = attempts.map((options) => () => waveCrest(options));
    // ASSERT
    calls.forEach((call) => expect(call).toThrow(expected));
  });
});

describe('edge cases', () => {
  it('draws a different crest for a different seed', () => {
    // ARRANGE
    const box = { width: 1000, height: 100, peaks: 6 };
    // ACT
    const first = waveCrest({ ...box, seed: 1 })
      .map((point) => point.join())
      .join(' ');
    const second = waveCrest({ ...box, seed: 2 })
      .map((point) => point.join())
      .join(' ');
    // ASSERT
    expect(second).not.toBe(first);
  });
});
