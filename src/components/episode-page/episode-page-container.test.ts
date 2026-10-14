import { episode, slide, type Section, type Slide, type TitledSlide } from '@/components/slide-master/slide';
import type { RuntimeTranslator } from '@/components/slide-master/slide-base';
import { describe, expect, it } from 'vitest';
import { DRAWER_BESIDE_ATTR } from '../../lib/context-drawer.pure';
import { TALK_DOCKED_ATTR, tocReserveRem } from '../../lib/talk-dock.pure';
import { INSET_CLASSES, TOC_RESERVE_CLASS, tocSectionsOf } from './episode-page-container.pure';
import { recordContent } from './record-content';

/*
 * The table of contents folds the Slides `recordContent` returns, so these
 * tests build real Slides whose Voice scripts read for whole minutes: 140
 * English words a minute.
 */
const EPISODE = {
  en: { title: 'Page template', caption: 'c', description: 'd' },
  de: { title: 'Seitenvorlage', caption: 'c', description: 'd' },
};

/** A Voice script one segment long that reads for `minutes` in English. */
function scriptOf(minutes: number) {
  const script = Array.from({ length: minutes * 140 }, () => 'word').join(' ');
  return { voiceScript: { segments: { s: { title: 't', keywords: 'k', script } } } };
}

function titled(slug: string, title: string, minutes: number): TitledSlide {
  const messages = { title, ...scriptOf(minutes) };
  return slide({
    slug,
    messages: { en: messages, de: messages },
    segments: minutes > 0 ? [{ slug: 's' }] : [],
    content: () => null,
  });
}

function untitled(slug: string, minutes: number): Slide {
  const messages = scriptOf(minutes);
  return slide({
    slug,
    messages: { en: messages, de: messages },
    segments: minutes > 0 ? [{ slug: 's' }] : [],
    content: () => null,
  });
}

/** The site-wide translator stand-in: the only string `recordContent` reads from it is the Context reference label. */
async function translatorOf(): Promise<RuntimeTranslator> {
  const read = () => 'opens speaker note';
  return Object.assign(read, { rich: read, markup: read, raw: read, has: () => true });
}

/** The Slides of an Episode of these Sections, as the container hands them to the table of contents. */
async function slidesOf(sections: readonly Section[]) {
  return (await recordContent(episode({ slug: 'page-template', messages: EPISODE, sections }), 'en', translatorOf))
    .slides;
}

describe('success cases', () => {
  it('lists every Section with its page Slides, under the ids they were placed at, in page order', async () => {
    // ARRANGE
    const slides = await slidesOf([
      [titled('foundations', 'Foundations', 1), titled('why', 'Why', 3)],
      [titled('interlude', 'Interlude', 2)],
    ]);
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
    const toc = tocSectionsOf(slides);
    // ASSERT
    expect(toc).toEqual(expected);
  });

  it('leaves an untitled Slide out of the table of contents', async () => {
    // ARRANGE
    const slides = await slidesOf([
      [
        titled('foundations', 'Foundations', 1),
        titled('why', 'Why', 3),
        untitled('visual', 0),
        titled('how', 'How', 2),
      ],
    ]);
    const listed = ['foundations', 'foundations--why', 'foundations--how'];
    // ACT
    const [first] = tocSectionsOf(slides);
    const ids = [first.id, ...first.items.map((item) => item.id)];
    // ASSERT
    expect(ids).toEqual(listed);
  });

  it('adds the minutes of an untitled Slide to the entry it follows, so reading time keeps its order and total', async () => {
    // ARRANGE
    const slides = await slidesOf([
      [titled('a', 'A', 1), untitled('opening', 2), titled('why', 'Why', 3), untitled('visual', 4)],
    ]);
    const expected = { minutes: [3, 7], total: 10 };
    // ACT
    const [toc] = tocSectionsOf(slides);
    const minutes = [toc.minutes, toc.items[0].minutes];
    // ASSERT
    expect({ minutes, total: minutes[0] + minutes[1] }).toEqual(expected);
  });

  it('names each untitled Slide on the entry that owns its minutes, in page order, with its own minutes', async () => {
    // ARRANGE
    const slides = await slidesOf([
      [
        titled('a', 'A', 1),
        untitled('opening', 2),
        titled('why', 'Why', 3),
        untitled('visual', 4),
        untitled('silent', 0),
      ],
    ]);
    const expected = {
      section: [{ id: 'a--opening', minutes: 2 }],
      item: [
        { id: 'a--visual', minutes: 4 },
        { id: 'a--silent', minutes: 0 },
      ],
    };
    // ACT
    const [toc] = tocSectionsOf(slides);
    const owned = { section: toc.unlisted, item: toc.items[0].unlisted };
    // ASSERT
    expect(owned).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('leaves the Slides it folds untouched, so other consumers of the walk read the same list', async () => {
    // ARRANGE
    const slides = await slidesOf([[titled('a', 'A', 1), untitled('opening', 2), titled('why', 'Why', 3)]]);
    const before = structuredClone(slides);
    // ACT
    tocSectionsOf(slides);
    // ASSERT
    expect(slides).toEqual(before);
  });

  it('rejects a page Slide that comes before any section slide', async () => {
    // ARRANGE
    const slides = await slidesOf([[titled('a', 'A', 1), titled('why', 'Why', 3)]]);
    const expected = 'a--why';
    // ACT
    const fold = () => tocSectionsOf(slides.slice(1));
    // ASSERT
    expect(fold).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('gives a Slide without a Voice script 0 minutes, listed if it is titled', async () => {
    // ARRANGE
    const slides = await slidesOf([
      [titled('foundations', 'Foundations', 0), untitled('visual', 0), titled('quiet', 'Quiet', 0)],
    ]);
    const expected = { minutes: 0, items: [{ id: 'foundations--quiet', title: 'Quiet', minutes: 0 }] };
    // ACT
    const [toc] = tocSectionsOf(slides);
    // ASSERT
    expect({ minutes: toc.minutes, items: toc.items }).toEqual(expected);
  });

  it('derives an empty table of contents for an Episode with no Sections yet', async () => {
    // ARRANGE
    const slides = await slidesOf([]);
    // ACT
    const toc = tocSectionsOf(slides);
    // ASSERT
    expect(toc).toEqual([]);
  });

  it('widen the right inset on the very attribute the drawer sets when it sits beside the Slides', () => {
    // ARRANGE
    // Tailwind needs the class written out, so the two sides are tied here.
    const prefix = `xl:data-[${DRAWER_BESIDE_ATTR.replace('data-', '')}=true]:`;
    // ACT
    const matching = INSET_CLASSES.split(/\s+/).filter((name) => name.startsWith(prefix));
    // ASSERT
    expect(matching).toEqual(expect.arrayContaining([expect.stringContaining(prefix)]));
  });

  it('set both inset variables for narrow screens and again from md', () => {
    // ARRANGE
    const classes = INSET_CLASSES.split(/\s+/);
    const leftCount = 2;
    const rightCount = 3;
    // ACT
    const names = classes.map((name) => /\[(--inset-[lr]):/.exec(name)?.[1]);
    // ASSERT
    expect(names.filter((name) => name === '--inset-l')).toHaveLength(leftCount);
    expect(names.filter((name) => name === '--inset-r')).toHaveLength(rightCount);
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
