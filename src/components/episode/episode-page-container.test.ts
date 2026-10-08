import { describe, expect, it } from 'vitest';
import { tocSectionsOf, type EpisodeSection, type EpisodeSlide } from './episode-page-container.pure';

function slide(slug: string, title: string, minutes: EpisodeSlide['minutes']): EpisodeSlide {
  return { slug, title, minutes, content: null };
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
