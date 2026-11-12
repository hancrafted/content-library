import { describe, expect, it } from 'vitest';
import { specSlides } from './grill-spec.pure';

/*
 * When the spec card slides from the chat onto the bench (Spec Option 14a, `motion: local`): once from the Slide's
 * first entry, and again on every replay; never on a return.
 */

describe('success cases', () => {
  it('slides once the Slide first enters', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const slides = specSlides({ entryAtMount: 'pending', entry: 'entering', replays: 0 });
    // ASSERT
    expect(slides).toBe(expected);
  });

  it('slides again on a replay, even after the entrance is done', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const slides = specSlides({ entryAtMount: 'done', entry: 'done', replays: 2 });
    // ASSERT
    expect(slides).toBe(expected);
  });
});

describe('failure cases', () => {
  it('stands still in the static HTML, before the Slide has entered', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const slides = specSlides({ entryAtMount: 'pending', entry: 'pending', replays: 0 });
    // ASSERT
    expect(slides).toBe(expected);
  });
});

describe('edge cases', () => {
  it('stands at its end state when the card mounts again after the Slide entered', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const slides = specSlides({ entryAtMount: 'done', entry: 'done', replays: 0 });
    // ASSERT
    expect(slides).toBe(expected);
  });
});
