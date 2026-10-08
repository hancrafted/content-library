import { describe, expect, it } from 'vitest';
import { openSectionIds, readingTime, type TocSection } from './table-of-contents.pure';

const SECTIONS: readonly TocSection[] = [
  { id: 'intro', title: 'Intro', minutes: 1, items: [{ id: 'intro--why', title: 'Why', minutes: 3 }] },
  { id: 'pause', title: 'Pause', minutes: 1, items: [] },
  { id: 'outro', title: 'Outro', minutes: 1, items: [{ id: 'outro--next', title: 'Next', minutes: 5 }] },
];

describe('success cases', () => {
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
