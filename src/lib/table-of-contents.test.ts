import { describe, expect, it } from 'vitest';
import { activeId, openSectionIds, readingTime, type TocSection } from './table-of-contents.pure';

const SECTIONS: readonly TocSection[] = [
  { id: 'intro', title: 'Intro', minutes: 1, items: [{ id: 'intro--why', title: 'Why', minutes: 3 }] },
  { id: 'pause', title: 'Pause', minutes: 1, items: [] },
  { id: 'outro', title: 'Outro', minutes: 1, items: [{ id: 'outro--next', title: 'Next', minutes: 5 }] },
];

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

  it('opens the section that owns the active slide', () => {
    // ARRANGE
    const owner = ['outro'];
    // ACT
    const open = openSectionIds(SECTIONS, 'outro--next', new Set());
    // ASSERT
    expect([...open]).toEqual(owner);
  });

  it('opens a section toggled by its chevron alongside the active one', () => {
    // ARRANGE
    const both = ['intro', 'outro'];
    // ACT
    const open = openSectionIds(SECTIONS, 'intro--why', new Set(['outro']));
    // ASSERT
    expect([...open]).toEqual(both);
  });

  it('counts the rest of the active slide and every later one as time left', () => {
    // ARRANGE
    const minutes = [2, 4, 4];
    const expected = { total: 10, remaining: 7, progress: 0.3 };
    // ACT
    const time = readingTime(minutes, 1, 0.25);
    // ASSERT
    expect(time).toEqual(expected);
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

  it('opens no section for an active id outside the outline', () => {
    // ARRANGE
    const none: string[] = [];
    // ACT
    const open = openSectionIds(SECTIONS, 'stray', new Set());
    // ASSERT
    expect([...open]).toEqual(none);
  });

  it('clamps a fraction outside 0 to 1 into the active slide', () => {
    // ARRANGE
    const minutes = [2, 4];
    const atStart = { total: 6, remaining: 6, progress: 0 };
    const atEnd = { total: 6, remaining: 0, progress: 1 };
    // ACT
    const time = [readingTime(minutes, 0, -0.5), readingTime(minutes, 1, 1.5)];
    // ASSERT
    expect(time).toEqual([atStart, atEnd]);
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

  it('closes the active section when its chevron is toggled', () => {
    // ARRANGE
    const none: string[] = [];
    // ACT
    const open = openSectionIds(SECTIONS, 'intro--why', new Set(['intro']));
    // ASSERT
    expect([...open]).toEqual(none);
  });

  it('opens a slideless section when its own slide is active', () => {
    // ARRANGE
    const slideless = ['pause'];
    // ACT
    const open = openSectionIds(SECTIONS, 'pause', new Set());
    // ASSERT
    expect([...open]).toEqual(slideless);
  });

  it('counts the whole outline as left before any slide is active', () => {
    // ARRANGE
    const minutes = [2, 4];
    const unread = { total: 6, remaining: 6, progress: 0 };
    // ACT
    const time = readingTime(minutes, -1, 0);
    // ASSERT
    expect(time).toEqual(unread);
  });

  it('treats an outline with no reading time as fully read', () => {
    // ARRANGE
    const done = { total: 0, remaining: 0, progress: 1 };
    // ACT
    const time = readingTime([0, 0], 0, 0);
    // ASSERT
    expect(time).toEqual(done);
  });
});
