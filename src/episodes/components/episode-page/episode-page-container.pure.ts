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

export function slideSizeOf(slide: Pick<LocalizedSlide, 'level' | 'withoutSectionSlide'>): 'section' | 'page' {
  return slide.level === 'h2' && !slide.withoutSectionSlide ? 'section' : 'page';
}

type OpenSection = TocSection & { items: TocItem[] };

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

// decision: FE-009 §2
export const INSET_CLASSES =
  '[--inset-l:1rem] [--inset-r:1rem] md:[--inset-l:21rem] md:data-[toc-collapsed=true]:[--inset-l:7.5rem] md:[--inset-r:3rem] xl:data-[drawer-beside=true]:[--inset-r:calc(var(--drawer-width)+4rem)]';

export const TOC_RESERVE_CLASS = 'lg:data-[talk-docked=true]:[--toc-reserve:12.5625rem]';

export interface TitleBand {
  readonly tone: 'normal' | 'inverse';
  readonly presentation?: { readonly style?: { readonly '--slide-surface'?: string } };
}

// decision: FE-004 §5.4
export function fillsHeaderBand({ tone, presentation }: TitleBand): boolean {
  return tone === 'inverse' || presentation?.style?.['--slide-surface'] !== undefined;
}

export function pageClassOf(title: TitleBand): string {
  return `${fillsHeaderBand(title) ? '-mt-(--header-block)' : 'mt-6'} ${INSET_CLASSES} ${TOC_RESERVE_CLASS}`;
}

export function sourceFolderOf(page: EpisodeRef | TemplateRef | ExplorablePageRef | GuideRef): string {
  return `src/episodes/${folderOf(page)}`;
}
