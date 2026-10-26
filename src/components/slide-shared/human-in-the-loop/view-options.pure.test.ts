import { describe, expect, it } from 'vitest';
import type { UiWords } from './human-in-the-loop.types';
import { viewOptions } from './view-options.pure';

const words = {
  viewPresentation: 'Presentation',
  viewDetailed: 'Detailed',
  viewHandson: 'Hands-on',
} as UiWords;

describe('success cases', () => {
  it('lists Presentation, Detailed and Hands-on in that order', () => {
    // ARRANGE
    // ACT
    const options = viewOptions(words);
    // ASSERT
    expect(options.map(({ value, label }) => [value, label])).toEqual([
      ['presentation', 'Presentation'],
      ['detailed', 'Detailed'],
      ['handson', 'Hands-on'],
    ]);
  });

  it('offers Hands-on as a view the viewer can pick, like the other two', () => {
    // ARRANGE
    // ACT
    const handson = viewOptions(words).find(({ value }) => value === 'handson');
    // ASSERT
    expect(handson).toEqual({ value: 'handson', label: 'Hands-on' });
  });
});

describe('failure cases', () => {
  it('labels every view with its own word, so no segment is left blank', () => {
    // ARRANGE
    // ACT
    const labels = viewOptions(words).map(({ label }) => label);
    // ASSERT
    expect(labels.every((label) => label.length > 0)).toBe(true);
  });
});

describe('edge cases', () => {
  it('never offers a view the state cannot hold twice', () => {
    // ARRANGE
    // ACT
    const views = viewOptions(words).map(({ value }) => value);
    // ASSERT
    expect(new Set(views).size).toBe(views.length);
  });
});
