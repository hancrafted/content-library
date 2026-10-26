import { describe, expect, it } from 'vitest';
import type { UiWords } from './human-in-the-loop.types';
import { viewOptions } from './view-options.pure';

const words = {
  viewPresentation: 'Presentation',
  viewDetailed: 'Detailed',
  viewHandson: 'Hands-on',
  viewSoon: 'Coming soon',
} as UiWords;

describe('success cases', () => {
  it('lists Presentation, Detailed and Hands-on in that order', () => {
    // ARRANGE
    // ACT
    const options = viewOptions(words);
    // ASSERT
    expect(options.map(({ view, label }) => [view, label])).toEqual([
      ['presentation', 'Presentation'],
      ['detailed', 'Detailed'],
      ['handson', 'Hands-on'],
    ]);
  });

  it('enables Presentation, the one view built so far', () => {
    // ARRANGE
    // ACT
    const enabled = viewOptions(words).filter((option) => option.enabled);
    // ASSERT
    expect(enabled.map(({ view }) => view)).toEqual(['presentation']);
  });
});

describe('failure cases', () => {
  it('says "Coming soon" on each view that is not built yet, and nothing on the one that is', () => {
    // ARRANGE
    // ACT
    const tips = viewOptions(words).map(({ tip }) => tip);
    // ASSERT
    expect(tips).toEqual([undefined, 'Coming soon', 'Coming soon']);
  });
});

describe('edge cases', () => {
  it('never offers a view the state cannot hold twice', () => {
    // ARRANGE
    // ACT
    const views = viewOptions(words).map(({ view }) => view);
    // ASSERT
    expect(new Set(views).size).toBe(views.length);
  });
});
