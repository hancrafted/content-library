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
import type { LocalizedSlideOutline } from '../slide-master/slide-outline';

/**
 * The size a Slide wrapper gives its Slide: `section` for a shown section slide, `page` for every other. A page Slide
 * that stands in for a section slide its Section declares it has not keeps the page size.
 */
export function slideSizeOf(slide: Pick<LocalizedSlide, 'level' | 'withoutSectionSlide'>): 'section' | 'page' {
  return slide.level === 'h2' && !slide.withoutSectionSlide ? 'section' : 'page';
}

type OpenSection = TocSection & { items: TocItem[] };

/**
 * The table of contents' entries: a fold over the Slides in page order, so
 * each entry carries the very id its Slide wrapper does and the two cannot
 * drift. A section slide opens an entry; an untitled Slide gets no entry of
 * its own, its minutes are added to the entry it follows, so the Section's
 * total and the reading-time order both stay honest.
 */
export function tocSectionsOf(slides: readonly LocalizedSlideOutline[]): TocSection[] {
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

export interface TitleBand {
  readonly tone: 'normal' | 'inverse';
  readonly presentation?: { readonly style?: { readonly '--slide-surface'?: string } };
}

/**
 * Whether the Title slide fills the floating header's band: an inverse Title does, and so does one that declares its own
 * surface (`presentation.style['--slide-surface']`), such as an Iceberg Title in its zone's colour. Read from the
 * declaration, never from a computed colour (FE-004 §5.4).
 */
export function fillsHeaderBand({ tone, presentation }: TitleBand): boolean {
  return tone === 'inverse' || presentation?.style?.['--slide-surface'] !== undefined;
}

export function pageClassOf(title: TitleBand): string {
  return `${fillsHeaderBand(title) ? '-mt-(--header-block)' : 'mt-6'} ${INSET_CLASSES} ${TOC_RESERVE_CLASS}`;
}

export function sourceFolderOf(page: EpisodeRef | TemplateRef | ExplorablePageRef | GuideRef): string {
  return `src/episodes/${folderOf(page)}`;
}
