import { describe, expect, it } from 'vitest';
import { tocSectionsOf, type EpisodeSection, type EpisodeSlide } from './episode-page-container.pure';

function slide(
  slug: string,
  title: string,
  minutes: EpisodeSection['minutes'],
): EpisodeSlide & Pick<EpisodeSection, 'title' | 'minutes'> {
  return { slug, title, minutes, content: null };
}

function section(head: Pick<EpisodeSection, 'slug' | 'title' | 'minutes'>, slides: EpisodeSlide[]): EpisodeSection {
  return { ...head, content: null, slides };
}

describe('success cases', () => {
  it('lists every Section with its page Slides, keyed by anchor, in page order', () => {
    // ARRANGE
    const sections: EpisodeSection[] = [
      { ...slide('foundations', 'Foundations', { en: 1, de: 1 }), slides: [slide('why', 'Why', { en: 3, de: 4 })] },
      { ...slide('interlude', 'Interlude', { en: 2, de: 2 }), slides: [] },
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
    const toc = tocSectionsOf(sections, 'en');
    // ASSERT
    expect(toc).toEqual(expected);
  });

  it("reads each entry's reading time in the page's locale", () => {
    // ARRANGE
    const sections: EpisodeSection[] = [
      { ...slide('foundations', 'Grundlagen', { en: 1, de: 2 }), slides: [slide('why', 'Warum', { en: 3, de: 4 })] },
    ];
    const germanMinutes = [2, 4];
    // ACT
    const [section] = tocSectionsOf(sections, 'de');
    const minutes = [section.minutes, section.items[0].minutes];
    // ASSERT
    expect(minutes).toEqual(germanMinutes);
  });
});

describe('optional declarations', () => {
  it('leaves an untitled Slide out of the table of contents', () => {
    // ARRANGE
    const sections = [
      section({ slug: 'foundations', title: 'Foundations', minutes: { en: 1, de: 1 } }, [
        slide('why', 'Why', { en: 3, de: 3 }),
        { slug: 'visual', content: null },
        slide('how', 'How', { en: 2, de: 2 }),
      ]),
    ];
    const listed = ['foundations', 'foundations--why', 'foundations--how'];
    // ACT
    const [first] = tocSectionsOf(sections, 'en');
    const ids = [first.id, ...first.items.map((item) => item.id)];
    // ASSERT
    expect(ids).toEqual(listed);
  });

  it('keeps the minutes of an untitled Slide in the Section total', () => {
    // ARRANGE
    const sections = [
      section({ slug: 'foundations', title: 'Foundations', minutes: { en: 1, de: 1 } }, [
        slide('why', 'Why', { en: 3, de: 3 }),
        { slug: 'visual', minutes: { en: 2, de: 5 }, content: null },
      ]),
    ];
    const total = { en: 6, de: 9 };
    // ACT
    const sum = (locale: 'en' | 'de') => {
      const [toc] = tocSectionsOf(sections, locale);
      return toc.minutes + toc.items.reduce((acc, item) => acc + item.minutes, 0);
    };
    // ASSERT
    expect({ en: sum('en'), de: sum('de') }).toEqual(total);
  });

  it('counts a Slide without minutes as zero', () => {
    // ARRANGE
    const sections = [
      section({ slug: 'foundations', title: 'Foundations', minutes: { en: 1, de: 1 } }, [
        { slug: 'visual', content: null },
        { slug: 'quiet', title: 'Quiet', content: null },
      ]),
    ];
    const expected = [{ id: 'foundations--quiet', title: 'Quiet', minutes: 0 }];
    // ACT
    const [toc] = tocSectionsOf(sections, 'en');
    // ASSERT
    expect(toc.items).toEqual(expected);
  });

  it('adds the minutes of an untitled Slide to the entry it follows, so reading time keeps its order', () => {
    // ARRANGE
    const sections = [
      section({ slug: 'a', title: 'A', minutes: { en: 1, de: 1 } }, [
        { slug: 'opening', minutes: { en: 2, de: 2 }, content: null },
        slide('why', 'Why', { en: 3, de: 3 }),
        { slug: 'visual', minutes: { en: 4, de: 4 }, content: null },
      ]),
    ];
    const expected = [3, 7];
    // ACT
    const [toc] = tocSectionsOf(sections, 'en');
    const minutes = [toc.minutes, toc.items[0].minutes];
    // ASSERT
    expect(minutes).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects two page Slides sharing a slug, so the table of contents never points at an ambiguous anchor', () => {
    // ARRANGE
    const sections: EpisodeSection[] = [
      {
        ...slide('next', 'Next', { en: 1, de: 1 }),
        slides: [slide('recap', 'A', { en: 1, de: 1 }), slide('recap', 'B', { en: 1, de: 1 })],
      },
    ];
    const duplicate = 'next--recap';
    // ACT
    const derive = () => tocSectionsOf(sections, 'en');
    // ASSERT
    expect(derive).toThrow(duplicate);
  });
});

describe('edge cases', () => {
  it('derives an empty table of contents for an Episode with no Sections yet', () => {
    // ARRANGE
    const sections: EpisodeSection[] = [];
    // ACT
    const toc = tocSectionsOf(sections, 'en');
    // ASSERT
    expect(toc).toEqual([]);
  });
});
