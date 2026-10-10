import { describe, expect, it } from 'vitest';
import { DRAWER_BESIDE_ATTR } from '../../lib/context-drawer.pure';
import { TALK_DOCKED_ATTR, tocReserveRem } from '../../lib/talk-dock.pure';
import {
  INSET_CLASSES,
  TOC_RESERVE_CLASS,
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
      section('foundations', { title: 'Foundations', minutes: 1 }, [
        page('foundations--why', { slug: 'why', title: 'Why', minutes: 3 }),
      ]),
      section('interlude', { title: 'Interlude', minutes: 2 }),
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
    const toc = tocSectionsOf(placed);
    // ASSERT
    expect(toc).toEqual(expected);
  });

  describe('optional declarations', () => {
    it('leaves an untitled Slide out of the table of contents', () => {
      // ARRANGE
      const placed = [
        section('foundations', { title: 'Foundations', minutes: 1 }, [
          page('foundations--why', { slug: 'why', title: 'Why', minutes: 3 }),
          page('foundations--visual', { slug: 'visual', minutes: 0 }),
          page('foundations--how', { slug: 'how', title: 'How', minutes: 2 }),
        ]),
      ];
      const listed = ['foundations', 'foundations--why', 'foundations--how'];
      // ACT
      const [first] = tocSectionsOf(placed);
      const ids = [first.id, ...first.items.map((item) => item.id)];
      // ASSERT
      expect(ids).toEqual(listed);
    });

    it('keeps the minutes of an untitled Slide in the Section total', () => {
      // ARRANGE
      const placed = [
        section('foundations', { title: 'Foundations', minutes: 1 }, [
          page('foundations--why', { slug: 'why', title: 'Why', minutes: 3 }),
          page('foundations--visual', { slug: 'visual', minutes: 5 }),
        ]),
      ];
      const total = 9;
      // ACT
      const [toc] = tocSectionsOf(placed);
      const sum = toc.minutes + toc.items.reduce((acc, item) => acc + item.minutes, 0);
      // ASSERT
      expect(sum).toBe(total);
    });

    it('adds the minutes of an untitled Slide to the entry it follows, so reading time keeps its order', () => {
      // ARRANGE
      const placed = [
        section('a', { title: 'A', minutes: 1 }, [
          page('a--opening', { slug: 'opening', minutes: 2 }),
          page('a--why', { slug: 'why', title: 'Why', minutes: 3 }),
          page('a--visual', { slug: 'visual', minutes: 4 }),
        ]),
      ];
      const expected = [3, 7];
      // ACT
      const [toc] = tocSectionsOf(placed);
      const minutes = [toc.minutes, toc.items[0].minutes];
      // ASSERT
      expect(minutes).toEqual(expected);
    });
  });

  describe('unlisted Slides', () => {
    it('names each untitled Slide on the entry that owns its minutes, in page order, with its own minutes', () => {
      // ARRANGE
      const placed = [
        section('a', { title: 'A', minutes: 1 }, [
          page('a--opening', { slug: 'opening', minutes: 2 }),
          page('a--why', { slug: 'why', title: 'Why', minutes: 3 }),
          page('a--visual', { slug: 'visual', minutes: 4 }),
          page('a--silent', { slug: 'silent', minutes: 0 }),
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
      const [toc] = tocSectionsOf(placed);
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
      section('a', { title: 'A', minutes: 1 }, [
        page('a--opening', { slug: 'opening', minutes: 2 }),
        page('a--why', { slug: 'why', title: 'Why', minutes: 3 }),
      ]),
    ];
    const before = structuredClone(placed);
    // ACT
    tocSectionsOf(placed);
    // ASSERT
    expect(placed).toEqual(before);
  });
});

describe('edge cases', () => {
  it('gives a section slide without a Voice script no time of its own, as it does a page Slide', () => {
    // ARRANGE
    const placed = [
      section('foundations', { title: 'Foundations', minutes: 0 }, [
        page('foundations--why', { slug: 'why', title: 'Why', minutes: 3 }),
      ]),
    ];
    const expected = [0, 3];
    // ACT
    const [entry] = tocSectionsOf(placed);
    // ASSERT
    expect([entry.minutes, entry.items[0].minutes]).toEqual(expected);
  });

  it('derives an empty table of contents for an Episode with no Sections yet', () => {
    // ARRANGE
    const placed: PlacedEpisodeSection[] = [];
    // ACT
    const toc = tocSectionsOf(placed);
    // ASSERT
    expect(toc).toEqual([]);
  });

  describe('optional declarations', () => {
    it('lists a titled Slide without a Voice script at 0 minutes', () => {
      // ARRANGE
      const placed = [
        section('foundations', { title: 'Foundations', minutes: 1 }, [
          page('foundations--visual', { slug: 'visual', minutes: 0 }),
          page('foundations--quiet', { slug: 'quiet', title: 'Quiet', minutes: 0 }),
        ]),
      ];
      const expected = [{ id: 'foundations--quiet', title: 'Quiet', minutes: 0 }];
      // ACT
      const [toc] = tocSectionsOf(placed);
      // ASSERT
      expect(toc.items).toEqual(expected);
    });
  });

  it('widen the right inset on the very attribute the drawer sets when it sits beside the Slides', () => {
    // ARRANGE
    const attribute = DRAWER_BESIDE_ATTR;
    // ACT
    const classes = INSET_CLASSES.split(/\s+/);
    // ASSERT: Tailwind needs the class written out, so the two sides are tied here
    expect(classes.some((name) => name.startsWith(`xl:data-[${attribute.replace('data-', '')}=true]:`))).toBe(true);
  });

  it('set both inset variables for narrow screens and again from md', () => {
    // ARRANGE
    const classes = INSET_CLASSES.split(/\s+/);
    // ACT
    const names = classes.map((name) => /\[(--inset-[lr]):/.exec(name)?.[1]);
    // ASSERT
    expect(names.filter((name) => name === '--inset-l')).toHaveLength(2);
    expect(names.filter((name) => name === '--inset-r')).toHaveLength(3);
  });

  it('reserves the docked player height and a gap on the table of contents, from lg, on the attribute the player sets', () => {
    // ARRANGE
    const expected = `lg:data-[${TALK_DOCKED_ATTR.replace('data-', '')}=true]:[--toc-reserve:${tocReserveRem()}rem]`;
    // ACT
    const reserve = TOC_RESERVE_CLASS;
    // ASSERT: 2rem header + 17rem * 9/16 frame + 1rem gap
    expect(reserve).toBe(expected);
  });
});
