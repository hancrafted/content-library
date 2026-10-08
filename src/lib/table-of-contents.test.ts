import { describe, expect, it } from 'vitest';
import {
  activeEntry,
  openSectionIds,
  readingOrder,
  readingTime,
  sectionNumber,
  whereAt,
  type TocSection,
} from './table-of-contents.pure';

const SECTIONS: readonly TocSection[] = [
  { id: 'intro', title: 'Intro', minutes: 1, items: [{ id: 'intro--why', title: 'Why', minutes: 3 }] },
  { id: 'pause', title: 'Pause', minutes: 1, items: [] },
  { id: 'outro', title: 'Outro', minutes: 1, items: [{ id: 'outro--next', title: 'Next', minutes: 5 }] },
];

const folded: readonly TocSection[] = [
  {
    id: 'a',
    title: 'A',
    minutes: 3,
    unlisted: [{ id: 'a--opening', minutes: 2 }],
    items: [{ id: 'a--why', title: 'Why', minutes: 7, unlisted: [{ id: 'a--visual', minutes: 4 }] }],
  },
];

const owners = { 'a--visual': 'a--why' };

describe('success cases', () => {
  it('tells the pill which numbered Section the reader is in, from a page Slide too', () => {
    // ARRANGE
    const expected = { number: '03', title: 'Outro' };
    // ACT
    const where = whereAt(SECTIONS, 'outro--next');
    // ASSERT
    expect(where).toEqual(expected);
  });

  it('numbers Sections from 01, two digits', () => {
    // ARRANGE
    const expected = ['01', '10'];
    // ACT
    const numbers = [sectionNumber(0), sectionNumber(9)];
    // ASSERT
    expect(numbers).toEqual(expected);
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

  describe('reading order with unlisted Slides', () => {
    it('lists every Slide in page order with its own minutes, and maps unlisted ones to their entry', () => {
      // ARRANGE
      const expected = {
        ids: ['a', 'a--opening', 'a--why', 'a--visual'],
        minutes: [1, 2, 3, 4],
        owners: { 'a--opening': 'a', 'a--visual': 'a--why' },
      };
      // ACT
      const order = readingOrder(folded);
      // ASSERT
      expect(order).toEqual(expected);
    });

    it('counts an active untitled Slide as read up to its place, so remaining time keeps falling past it', () => {
      // ARRANGE
      const order = readingOrder(folded);
      const index = order.ids.indexOf('a--visual');
      // ACT
      const time = readingTime(order.minutes, index, 0.5);
      // ASSERT
      expect(time).toMatchObject({ total: 10, remaining: 2 });
    });

    it('is the plain entry order when nothing is unlisted', () => {
      // ARRANGE
      const expected = {
        ids: ['intro', 'intro--why', 'pause', 'outro', 'outro--next'],
        minutes: [1, 3, 1, 1, 5],
        owners: {},
      };
      // ACT
      const order = readingOrder(SECTIONS);
      // ASSERT
      expect(order).toEqual(expected);
    });
  });

  describe('the active entry', () => {
    it('is the owning entry for an untitled Slide', () => {
      // ARRANGE
      const activeSlide = 'a--visual';
      // ACT
      const active = activeEntry(owners, activeSlide, 'top');
      // ASSERT
      expect(active).toBe('a--why');
    });

    it('is the Slide itself when it has an entry', () => {
      // ARRANGE
      const activeSlide = 'a--why';
      // ACT
      const active = activeEntry(owners, activeSlide, 'top');
      // ASSERT
      expect(active).toBe('a--why');
    });
  });
});

describe('failure cases', () => {
  it('tells the pill nothing for an active id outside the outline', () => {
    // ARRANGE
    const active = 'stray';
    // ACT
    const where = whereAt(SECTIONS, active);
    // ASSERT
    expect(where).toBeNull();
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
  it('tells the pill nothing while no entry is active, as on the Title slide', () => {
    // ARRANGE
    const active = null;
    // ACT
    const where = whereAt(SECTIONS, active);
    // ASSERT
    expect(where).toBeNull();
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

  it('leaves the full total remaining, because nothing is read yet', () => {
    // ARRANGE
    const { ids, minutes } = readingOrder(SECTIONS);
    // ACT
    const time = readingTime(minutes, ids.indexOf('top'), 0.5);
    // ASSERT
    expect([time.remaining, time.progress]).toEqual([time.total, 0]);
  });

  describe('the active entry', () => {
    it('is none on the Title slide, so no entry is highlighted', () => {
      // ARRANGE
      const activeSlide = 'top';
      // ACT
      const active = activeEntry(owners, activeSlide, 'top');
      // ASSERT
      expect(active).toBeNull();
    });

    it('is none while the Slide is not known yet', () => {
      // ARRANGE
      const activeSlide = null;
      // ACT
      const active = activeEntry(owners, activeSlide, 'top');
      // ASSERT
      expect(active).toBeNull();
    });
  });
});
