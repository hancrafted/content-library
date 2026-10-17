import { describe, expect, it } from 'vitest';
import { funnelPlays } from './funnel-motion.pure';

describe('success cases', () => {
  it('plays the arrival once the Slide starts entering', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const plays = funnelPlays({ entryAtMount: 'pending', entry: 'entering', replays: 0 });
    // ASSERT
    expect(plays).toBe(expected);
  });

  it('keeps the arrival playing when the entrance is done, so the dots finish their travel', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const plays = funnelPlays({ entryAtMount: 'pending', entry: 'done', replays: 0 });
    // ASSERT
    expect(plays).toBe(expected);
  });

  it('replays on mouse enter, after the entrance is done', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const plays = funnelPlays({ entryAtMount: 'done', entry: 'done', replays: 1 });
    // ASSERT
    expect(plays).toBe(expected);
  });
});

describe('failure cases', () => {
  it('holds the arrival while the Slide waits to enter', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const plays = funnelPlays({ entryAtMount: 'pending', entry: 'pending', replays: 0 });
    // ASSERT
    expect(plays).toBe(expected);
  });
});

describe('edge cases', () => {
  it('never replays the arrival when the funnel mounts again after its Slide has entered', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const plays = funnelPlays({ entryAtMount: 'done', entry: 'done', replays: 0 });
    // ASSERT
    expect(plays).toBe(expected);
  });
});
