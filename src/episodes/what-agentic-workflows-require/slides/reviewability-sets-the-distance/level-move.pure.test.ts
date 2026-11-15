import { describe, expect, it } from 'vitest';
import { levelMovePlays } from './level-move.pure';

describe('success cases', () => {
  it('slides the pill once the Slide starts entering', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const actual = levelMovePlays({ entryAtMount: 'pending', entry: 'entering', replays: 0 });
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('slides the pill again on mouse enter or keyboard focus, after the entrance', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const actual = levelMovePlays({ entryAtMount: 'done', entry: 'done', replays: 1 });
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('failure cases', () => {
  it('holds the pill while the Slide waits to enter', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const actual = levelMovePlays({ entryAtMount: 'pending', entry: 'pending', replays: 0 });
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('edge cases', () => {
  it('leaves the pill at rest when it mounts again after its Slide entered', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const actual = levelMovePlays({ entryAtMount: 'done', entry: 'done', replays: 0 });
    // ASSERT
    expect(actual).toBe(expected);
  });
});
