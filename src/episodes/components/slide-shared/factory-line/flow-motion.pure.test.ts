import { describe, expect, it } from 'vitest';
import { flowPlays } from './flow-motion.pure';

/*
 * When the factory line's flow plays: once from its Slide's first entrance, and again on every pointer or keyboard
 * replay; a line mounted again after its Slide entered stands at its end state until pointed at.
 */

describe('success cases', () => {
  it('plays once the Slide starts entering', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const actual = flowPlays({ entryAtMount: 'pending', entry: 'entering', replays: 0 });
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('keeps playing when the entrance is done, so the last documents arrive', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const actual = flowPlays({ entryAtMount: 'pending', entry: 'done', replays: 0 });
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('plays again on a replay after the Slide entered', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const actual = flowPlays({ entryAtMount: 'done', entry: 'done', replays: 1 });
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('failure cases', () => {
  it('stands still in the static HTML, before the Slide is reached', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const actual = flowPlays({ entryAtMount: 'pending', entry: 'pending', replays: 0 });
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('edge cases', () => {
  it('stands at its end state when mounted again after its Slide entered', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const actual = flowPlays({ entryAtMount: 'done', entry: 'done', replays: 0 });
    // ASSERT
    expect(actual).toBe(expected);
  });
});
