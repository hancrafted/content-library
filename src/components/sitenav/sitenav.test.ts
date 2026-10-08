import { describe, expect, it } from 'vitest';
import { activeId, expandedSectionId, scrollProgress, type SitenavSection } from './sitenav.pure';

const SECTIONS: readonly SitenavSection[] = [
  { id: 'intro', title: 'Intro', items: [{ id: 'intro--why', title: 'Why' }] },
  { id: 'pause', title: 'Pause', items: [] },
  { id: 'outro', title: 'Outro', items: [{ id: 'outro--next', title: 'Next' }] },
];

describe('success cases', () => {
  it('activates the one slide crossing the reading line', () => {
    // ARRANGE
    const order = ['intro', 'intro--why', 'outro'];
    const crossing = 'intro--why';
    // ACT
    const active = activeId(new Set([crossing]), order, 'intro');
    // ASSERT
    expect(active).toBe(crossing);
  });

  it('opens the section that owns the active slide', () => {
    // ARRANGE
    const owner = 'outro';
    // ACT
    const expanded = expandedSectionId(SECTIONS, 'outro--next');
    // ASSERT
    expect(expanded).toBe(owner);
  });

  it('reports scroll progress as a whole percentage of the scrollable distance', () => {
    // ARRANGE
    const page = { scrollY: 1250, scrollHeight: 3000, viewportHeight: 1000 };
    const percent = 63;
    // ACT
    const progress = scrollProgress(page);
    // ASSERT
    expect(progress).toBe(percent);
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

  it('opens no section for an id outside the outline', () => {
    // ARRANGE
    const none = null;
    // ACT
    const expanded = expandedSectionId(SECTIONS, 'stray');
    // ASSERT
    expect(expanded).toBe(none);
  });

  it('clamps an overscroll past either end into 0 to 100', () => {
    // ARRANGE
    const bounce = { scrollHeight: 3000, viewportHeight: 1000 };
    const bounds = [0, 100];
    // ACT
    const progress = [scrollProgress({ ...bounce, scrollY: -40 }), scrollProgress({ ...bounce, scrollY: 2100 })];
    // ASSERT
    expect(progress).toEqual(bounds);
  });
});

describe('edge cases', () => {
  it('keeps the previous slide while the line sits in the gap between slides', () => {
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

  it('opens a slideless section when its own slide is active', () => {
    // ARRANGE
    const slideless = 'pause';
    // ACT
    const expanded = expandedSectionId(SECTIONS, slideless);
    // ASSERT
    expect(expanded).toBe(slideless);
  });

  it('counts a page shorter than the viewport as fully read', () => {
    // ARRANGE
    const short = { scrollY: 0, scrollHeight: 600, viewportHeight: 1000 };
    const complete = 100;
    // ACT
    const progress = scrollProgress(short);
    // ASSERT
    expect(progress).toBe(complete);
  });
});
