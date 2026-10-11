import { describe, expect, it } from 'vitest';
import { readTrack, stepDelta } from './horizontal-scroll-snap.pure';

describe('success cases', () => {
  it('reads a track scrolled to its third card: progress, active card and neither end', () => {
    // ARRANGE
    const geometry = { scrollLeft: 400, maxScroll: 800, offsets: [0, 200, 400, 600, 800, 1000] };
    const expected = { progress: 0.5, active: 2, atStart: false, atEnd: false };
    // ACT
    const reading = readTrack(geometry);
    // ASSERT
    expect(reading).toEqual(expected);
  });

  it('scrolls by exactly the distance to the next card, from a track resting between two cards', () => {
    // ARRANGE
    const geometry = { scrollLeft: 230, maxScroll: 800, offsets: [0, 200, 400, 600, 800, 1000] };
    const expected = 170;
    // ACT
    const delta = stepDelta(geometry, 1);
    // ASSERT
    expect(delta).toBe(expected);
  });
});

describe('failure cases', () => {
  it('rejects a track with no cards instead of reporting card 0 as active', () => {
    // ARRANGE
    const geometry = { scrollLeft: 0, maxScroll: 0, offsets: [] };
    const reason = 'no cards';
    // ACT
    const read = () => readTrack(geometry);
    // ASSERT
    expect(read).toThrow(reason);
  });
});

describe('edge cases', () => {
  it('makes the last card active at the far end, though it cannot scroll to its own snap position', () => {
    // ARRANGE
    const geometry = { scrollLeft: 799.5, maxScroll: 800, offsets: [0, 200, 400, 600, 800, 1000] };
    const expected = { progress: 1, active: 5, atStart: false, atEnd: true };
    // ACT
    const reading = readTrack(geometry);
    // ASSERT
    expect(reading).toEqual(expected);
  });

  it('stops at the far end when the next card sits beyond what the track can scroll', () => {
    // ARRANGE
    const geometry = { scrollLeft: 700, maxScroll: 750, offsets: [0, 200, 400, 600, 800, 1000] };
    const expected = 50;
    // ACT
    const delta = stepDelta(geometry, 1);
    // ASSERT
    expect(delta).toBe(expected);
  });

  it('steps back from the far end to the first card whose snap position is actually behind it', () => {
    // ARRANGE
    const geometry = { scrollLeft: 1368, maxScroll: 1368, offsets: [0, 408, 816, 1224, 1632, 2040] };
    const expected = -144;
    // ACT
    const delta = stepDelta(geometry, -1);
    // ASSERT
    expect(delta).toBe(expected);
  });
});
