import { describe, expect, it } from 'vitest';
import {
  tocSectionsOf,
  type EpisodeSection,
  type EpisodeSlide,
  type PlacedEpisodeSection,
} from './episode-page-container.pure';

/** A page Slide placed under `id`, the anchor the walk would give it. */
function page(id: string, slide: Omit<EpisodeSlide, 'content'>): PlacedEpisodeSection['slides'][number] {
  return { id, slide: { ...slide, content: null } };
}

/** A section slide placed under `id`, holding its placed page Slides. */
function section(
  id: string,
  head: Pick<EpisodeSection, 'title' | 'minutes'>,
  slides: PlacedEpisodeSection['slides'] = [],
): PlacedEpisodeSection {
  const record: EpisodeSection = { slug: id, ...head, content: null, slides: slides.map(({ slide }) => slide) };
  return { id, slide: record, slides };
}

describe('success cases', () => {
  it('lists every Section with its page Slides, under the ids they were placed at, in page order', () => {
    // ARRANGE
    const placed = [
      section('foundations', { title: 'Foundations', minutes: { en: 1, de: 1 } }, [
        page('foundations--why', { slug: 'why', title: 'Why', minutes: { en: 3, de: 4 } }),
      ]),
      section('interlude', { title: 'Interlude', minutes: { en: 2, de: 2 } }),
    ];
    const expected = [
      {
        id: 'foundations',
        title: 'Foundations',
        minutes: 1,
        items: [{ id: 'foundations--why', title: 'Why', minutes: 3 }],
      },
      { id: 'interlude', title: 'Interlude', minutes: 2, items: [] },
    ];
    // ACT
    const toc = tocSectionsOf(placed, 'en');
    // ASSERT
    expect(toc).toEqual(expected);
  });

  it("reads each entry's reading time in the page's locale", () => {
    // ARRANGE
    const placed = [
      section('foundations', { title: 'Grundlagen', minutes: { en: 1, de: 2 } }, [
        page('foundations--why', { slug: 'why', title: 'Warum', minutes: { en: 3, de: 4 } }),
      ]),
    ];
    const germanMinutes = [2, 4];
    // ACT
    const [entry] = tocSectionsOf(placed, 'de');
    const minutes = [entry.minutes, entry.items[0].minutes];
    // ASSERT
    expect(minutes).toEqual(germanMinutes);
  });

  describe('optional declarations', () => {
    it('leaves an untitled Slide out of the table of contents', () => {
      // ARRANGE
      const placed = [
        section('foundations', { title: 'Foundations', minutes: { en: 1, de: 1 } }, [
          page('foundations--why', { slug: 'why', title: 'Why', minutes: { en: 3, de: 3 } }),
          page('foundations--visual', { slug: 'visual' }),
          page('foundations--how', { slug: 'how', title: 'How', minutes: { en: 2, de: 2 } }),
        ]),
      ];
      const listed = ['foundations', 'foundations--why', 'foundations--how'];
      // ACT
      const [first] = tocSectionsOf(placed, 'en');
      const ids = [first.id, ...first.items.map((item) => item.id)];
      // ASSERT
      expect(ids).toEqual(listed);
    });

    it('keeps the minutes of an untitled Slide in the Section total', () => {
      // ARRANGE
      const placed = [
        section('foundations', { title: 'Foundations', minutes: { en: 1, de: 1 } }, [
          page('foundations--why', { slug: 'why', title: 'Why', minutes: { en: 3, de: 3 } }),
          page('foundations--visual', { slug: 'visual', minutes: { en: 2, de: 5 } }),
        ]),
      ];
      const total = { en: 6, de: 9 };
      // ACT
      const sum = (locale: 'en' | 'de') => {
        const [toc] = tocSectionsOf(placed, locale);
        return toc.minutes + toc.items.reduce((acc, item) => acc + item.minutes, 0);
      };
      // ASSERT
      expect({ en: sum('en'), de: sum('de') }).toEqual(total);
    });

    it('adds the minutes of an untitled Slide to the entry it follows, so reading time keeps its order', () => {
      // ARRANGE
      const placed = [
        section('a', { title: 'A', minutes: { en: 1, de: 1 } }, [
          page('a--opening', { slug: 'opening', minutes: { en: 2, de: 2 } }),
          page('a--why', { slug: 'why', title: 'Why', minutes: { en: 3, de: 3 } }),
          page('a--visual', { slug: 'visual', minutes: { en: 4, de: 4 } }),
        ]),
      ];
      const expected = [3, 7];
      // ACT
      const [toc] = tocSectionsOf(placed, 'en');
      const minutes = [toc.minutes, toc.items[0].minutes];
      // ASSERT
      expect(minutes).toEqual(expected);
    });
  });

  describe('unlisted Slides', () => {
    it('names each untitled Slide on the entry that owns its minutes, in page order, with its own minutes', () => {
      // ARRANGE
      const placed = [
        section('a', { title: 'A', minutes: { en: 1, de: 1 } }, [
          page('a--opening', { slug: 'opening', minutes: { en: 2, de: 2 } }),
          page('a--why', { slug: 'why', title: 'Why', minutes: { en: 3, de: 3 } }),
          page('a--visual', { slug: 'visual', minutes: { en: 4, de: 4 } }),
          page('a--silent', { slug: 'silent' }),
        ]),
      ];
      const expected = {
        section: [{ id: 'a--opening', minutes: 2 }],
        item: [
          { id: 'a--visual', minutes: 4 },
          { id: 'a--silent', minutes: 0 },
        ],
      };
      // ACT
      const [toc] = tocSectionsOf(placed, 'en');
      const owned = { section: toc.unlisted, item: toc.items[0].unlisted };
      // ASSERT
      expect(owned).toEqual(expected);
    });
  });
});

describe('failure cases', () => {
  it('leaves the placed Slides it folds untouched, so other consumers of the walk read the same record', () => {
    // ARRANGE
    const placed = [
      section('a', { title: 'A', minutes: { en: 1, de: 1 } }, [
        page('a--opening', { slug: 'opening', minutes: { en: 2, de: 2 } }),
        page('a--why', { slug: 'why', title: 'Why', minutes: { en: 3, de: 3 } }),
      ]),
    ];
    const before = structuredClone(placed);
    // ACT
    tocSectionsOf(placed, 'en');
    // ASSERT
    expect(placed).toEqual(before);
  });
});

describe('edge cases', () => {
  it('derives an empty table of contents for an Episode with no Sections yet', () => {
    // ARRANGE
    const placed: PlacedEpisodeSection[] = [];
    // ACT
    const toc = tocSectionsOf(placed, 'en');
    // ASSERT
    expect(toc).toEqual([]);
  });

  describe('optional declarations', () => {
    it('counts a Slide without minutes as zero', () => {
      // ARRANGE
      const placed = [
        section('foundations', { title: 'Foundations', minutes: { en: 1, de: 1 } }, [
          page('foundations--visual', { slug: 'visual' }),
          page('foundations--quiet', { slug: 'quiet', title: 'Quiet' }),
        ]),
      ];
      const expected = [{ id: 'foundations--quiet', title: 'Quiet', minutes: 0 }];
      // ACT
      const [toc] = tocSectionsOf(placed, 'en');
      // ASSERT
      expect(toc.items).toEqual(expected);
    });
  });
});
