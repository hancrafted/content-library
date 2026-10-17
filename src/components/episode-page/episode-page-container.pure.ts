import type { TocItem, TocSection } from '../../lib/table-of-contents.pure';
import type { LocalizedSlide } from '../slide-master/localized-slide';
import type { EyebrowText } from '../slide-master/slide-eyebrow';

/** One table-of-contents entry while the fold builds it: its items still open to more. */
type OpenSection = TocSection & { items: TocItem[] };

/**
 * The table of contents' entries: a fold over the Slides in page order, so
 * each entry carries the very id its Slide wrapper does and the two cannot
 * drift. A section slide opens an entry; an untitled Slide gets no entry of
 * its own, its minutes are added to the entry it follows, so the Section's
 * total and the reading-time order both stay honest.
 */
export function tocSectionsOf(slides: readonly LocalizedSlide[]): TocSection[] {
  const sections: OpenSection[] = [];
  for (const slide of slides) {
    const { id, minutes } = slide;
    if (slide.level === 'h2') {
      sections.push({ id, title: slide.title, minutes, items: [] });
      continue;
    }
    const section = sections.at(-1);
    if (section === undefined) throw new Error(`Slide "${id}" comes before any section slide.`);
    if (slide.title === undefined) {
      const owner = section.items.at(-1) ?? section;
      owner.minutes += minutes;
      owner.unlisted = [...(owner.unlisted ?? []), { id, minutes }];
    } else {
      section.items.push({ id, title: slide.title, minutes });
    }
  }
  return sections;
}

/**
 * Every titled page Slide's Eyebrow, by Slide id: read from the table of
 * contents' entries, so the Section title is the one the contents show. A
 * section slide and an untitled Slide get none, and the count skips the
 * untitled ones, so the numbers a reader sees run without gaps.
 */
export function eyebrowsOf(sections: readonly TocSection[]): ReadonlyMap<string, EyebrowText> {
  return new Map(
    sections.flatMap(({ title, items }) =>
      items.map(({ id }, index) => [id, { section: title, position: index + 1, count: items.length }] as const),
    ),
  );
}

/*
 * The Foreground's insets (FE-009 §2), the only width mechanism: every Slide wrapper pads itself with these two
 * variables. Below `md` a small even margin. From `md` the left inset clears the fixed table of contents
 * (1rem + 17rem + 3rem) and the right keeps 3rem; from `xl`, while the drawer sits beside and open, the attribute
 * `DRAWER_BESIDE_ATTR` widens the right inset past the card. Tailwind reads the class written out, so a test ties
 * the attribute name to the one the drawer sets.
 */
export const INSET_CLASSES =
  '[--inset-l:1rem] [--inset-r:1rem] md:[--inset-l:21rem] md:[--inset-r:3rem] xl:data-[drawer-beside=true]:[--inset-r:calc(var(--drawer-width)+4rem)]';

/**
 * While the talk player is docked bottom-left (from `lg`), the table of contents gives up that much height so the two
 * never overlap; the panel reads `--toc-reserve` and scrolls inside itself. Written out literally for Tailwind; a unit test ties the attribute and the rem value to `talk-dock.pure`.
 */
export const TOC_RESERVE_CLASS = 'lg:data-[talk-docked=true]:[--toc-reserve:12.5625rem]';
