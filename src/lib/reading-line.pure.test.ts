import { describe, expect, it } from 'vitest';
import { activeId, readingLineMargin } from './reading-line.pure';

describe('success cases', () => {
  it('activates the one entry crossing the reading line', () => {
    // ARRANGE
    const order = ['intro', 'intro--why', 'outro'];
    const crossing = 'intro--why';
    // ACT
    const active = activeId(new Set([crossing]), order, 'intro');
    // ASSERT
    expect(active).toBe(crossing);
  });

  it('shrinks the viewport to a band at the reading line', () => {
    // ARRANGE
    const expected = '-35% 0px -65% 0px';
    // ACT
    const margin = readingLineMargin();
    // ASSERT
    expect(margin).toBe(expected);
  });
});

describe('failure cases', () => {
  it('ignores an intersecting id that is not in the outline', () => {
    // ARRANGE
    const order = ['intro', 'outro'];
    const previous = 'intro';
    // ACT
    const active = activeId(new Set(['stray']), order, previous);
    // ASSERT
    expect(active).toBe(previous);
  });
});

describe('edge cases', () => {
  it('keeps the previous entry while the line sits in the gap between slides', () => {
    // ARRANGE
    const order = ['intro', 'outro'];
    const previous = 'outro';
    // ACT
    const active = activeId(new Set(), order, previous);
    // ASSERT
    expect(active).toBe(previous);
  });

  it('activates the earliest in page order when two entries cross at once', () => {
    // ARRANGE
    const order = ['intro', 'intro--why', 'outro'];
    const earliest = 'intro--why';
    // ACT
    const active = activeId(new Set(['outro', earliest]), order, null);
    // ASSERT
    expect(active).toBe(earliest);
  });

  it('activates the first entry before anything has crossed the line', () => {
    // ARRANGE
    const order = ['intro', 'outro'];
    const first = 'intro';
    // ACT
    const active = activeId(new Set(), order, null);
    // ASSERT
    expect(active).toBe(first);
  });

  it('activates the Title slide when the line crosses it, so scrolling back up clears the previous Slide', () => {
    // ARRANGE
    const order = ['top', 'intro', 'outro'];
    const crossing = new Set(['top']);
    // ACT
    const active = activeId(crossing, order, 'intro');
    // ASSERT
    expect(active).toBe('top');
  });
});
