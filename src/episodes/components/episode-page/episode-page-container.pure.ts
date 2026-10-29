import {
  folderOf,
  type EpisodeRef,
  type ExplorablePageRef,
  type GuideRef,
  type TemplateRef,
} from '@/content-store/catalogue/episode-id.pure';
import { TOC_COLLAPSED_ATTR, type TocItem, type TocSection } from '@/shared/lib/table-of-contents.pure';
import type { LocalizedSlide } from '../slide-master/localized-slide';
import type { EyebrowText } from '../slide-master/slide-eyebrow';

/**
 * The size a Slide wrapper gives its Slide: `section` for a shown section slide, `page` for every other. A page Slide
 * that stands in for a section slide its Section declares it has not keeps the page size.
 */
export function slideSizeOf(slide: Pick<LocalizedSlide, 'level' | 'withoutSectionSlide'>): 'section' | 'page' {
  return slide.level === 'h2' && !slide.withoutSectionSlide ? 'section' : 'page';
}

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
 * untitled ones, so the numbers a reader sees run without gaps. `labelOf`
 * gives the counter's translated reading for assistive tech.
 */
export function eyebrowsOf(
  sections: readonly TocSection[],
  labelOf?: (position: number, count: number) => string,
): ReadonlyMap<string, EyebrowText> {
  return new Map(
    sections.flatMap(({ title, items }) =>
      items.map(({ id }, index) => {
        const position = index + 1;
        const eyebrow = { section: title, position, count: items.length };
        return [id, labelOf ? { ...eyebrow, label: labelOf(position, items.length) } : eyebrow] as const;
      }),
    ),
  );
}

/** The attribute set on `[data-slot="episode-page"]` and `[data-slot="toc"]` while the table of contents is collapsed. */
export { TOC_COLLAPSED_ATTR };

/*
 * The Foreground's insets (FE-009 §2), the only width mechanism: every Slide wrapper pads itself with these two
 * variables. Below `md` a small even margin. From `md` the left inset clears the fixed table of contents
 * (1rem + 17rem + 3rem) and the right keeps 3rem; from `md`, while the table of contents is collapsed, `TOC_COLLAPSED_ATTR`
 * narrows the left inset to 7.5rem (1rem + 3.5rem + 3rem) making room for the content area to grow. From `xl`, while the
 * drawer sits beside and open, `DRAWER_BESIDE_ATTR` widens the right inset past the card. Tailwind reads the class written out.
 */
export const INSET_CLASSES =
  '[--inset-l:1rem] [--inset-r:1rem] md:[--inset-l:21rem] md:data-[toc-collapsed=true]:[--inset-l:7.5rem] md:[--inset-r:3rem] xl:data-[drawer-beside=true]:[--inset-r:calc(var(--drawer-width)+4rem)]';

/**
 * While the talk player is docked bottom-left (from `lg`), the table of contents gives up that much height so the two
 * never overlap; the panel reads `--toc-reserve` and scrolls inside itself. Written out literally for Tailwind; a unit test ties the attribute and the rem value to `talk-dock.pure`.
 */
export const TOC_RESERVE_CLASS = 'lg:data-[talk-docked=true]:[--toc-reserve:12.5625rem]';

/** The page's own classes: a toned page runs up under the floating header (its Title slide fills that band), any other starts below it. */
export function pageClassOf(tone: 'inverse' | undefined): string {
  return `${tone === 'inverse' ? '-mt-(--header-block)' : 'mt-6'} ${INSET_CLASSES} ${TOC_RESERVE_CLASS}`;
}

/**
 * The source folder a page's Slides sit in, as the dev token editor names it in its prompt: an Episode's own folder,
 * an Event's copy's under its Event, a Template's under `templates/`, an Explorable page's under `explorable-pages/` or a
 * Guide's under `guides/`.
 */
export function sourceFolderOf(page: EpisodeRef | TemplateRef | ExplorablePageRef | GuideRef): string {
  return `src/episodes/${folderOf(page)}`;
}
