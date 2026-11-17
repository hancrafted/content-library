export const TOC_COLLAPSED_ATTR = 'data-toc-collapsed';

export type TocScope = 'page' | 'collection';

export const TOC_DEFAULT_SCOPE: TocScope = 'page';

export interface TocItem {
  id: string;
  title: string;
  minutes: number;
  unlisted?: readonly UnlistedSlide[];
}

export interface UnlistedSlide {
  id: string;
  minutes: number;
}

export interface TocSection extends TocItem {
  items: readonly TocItem[];
}

export interface TocPage {
  readonly route: string;
  readonly title: string;
  readonly sections: readonly TocSection[];
}

export interface TocCollection {
  readonly title: string;
  readonly route: string;
  readonly pages: readonly TocPage[];
}

export interface TocPageContext {
  readonly title: string;
  readonly route: string;
  readonly back?: { readonly label: string; readonly route: string };
}

export function readingOrder(sections: readonly TocSection[]): {
  ids: string[];
  minutes: number[];
  owners: Record<string, string>;
} {
  const order = { ids: [] as string[], minutes: [] as number[], owners: {} as Record<string, string> };
  for (const entry of sections.flatMap((section) => [section, ...section.items])) {
    const unlisted = entry.unlisted ?? [];
    order.ids.push(entry.id);
    order.minutes.push(entry.minutes - unlisted.reduce((sum, slide) => sum + slide.minutes, 0));
    for (const slide of unlisted) {
      order.ids.push(slide.id);
      order.minutes.push(slide.minutes);
      order.owners[slide.id] = entry.id;
    }
  }
  return order;
}

export function activeEntry(
  owners: Readonly<Record<string, string>>,
  slide: string | null,
  top: string,
): string | null {
  if (slide === null || slide === top) return null;
  return owners[slide] ?? slide;
}

export function ownerOf(sections: readonly TocSection[], active: string | null): string | undefined {
  return sections.find((section) => section.id === active || section.items.some((item) => item.id === active))?.id;
}

export function sectionNumber(index: number): string {
  return String(index + 1);
}

export function whereAt(
  sections: readonly TocSection[],
  active: string | null,
): { number: string; title: string } | null {
  const owner = ownerOf(sections, active);
  const index = sections.findIndex((section) => section.id === owner);
  return index < 0 ? null : { number: sectionNumber(index), title: sections[index].title };
}

export function openSectionIds(
  sections: readonly TocSection[],
  active: string | null,
  toggled: ReadonlySet<string>,
): ReadonlySet<string> {
  const owner = ownerOf(sections, active);
  return new Set(sections.filter((section) => (section.id === owner) !== toggled.has(section.id)).map((s) => s.id));
}

function itemProgress(items: readonly TocItem[], active: string): number {
  const index = items.findIndex((item) => item.id === active);
  return index < 0 ? 0 : (index + 1) / items.length;
}

function compareSectionOrder(allSections: readonly TocSection[], ownerId: string, sectionId: string): number | null {
  const currentIdx = allSections.findIndex((s) => s.id === ownerId);
  const thisIdx = allSections.findIndex((s) => s.id === sectionId);
  if (currentIdx !== thisIdx) return currentIdx > thisIdx ? 1 : 0;
  return null;
}

export function sectionProgress(
  section: TocSection,
  active: string | null,
  allSections: readonly TocSection[],
): number | null {
  if (section.items.length <= 1) return null;
  if (!active || active === section.id) return 0;

  const owner = ownerOf(allSections, active);
  if (!owner) return 0;

  const order = compareSectionOrder(allSections, owner, section.id);
  if (order !== null) return order;

  return itemProgress(section.items, active);
}

export interface ReadingTime {
  total: number;
  remaining: number;
  progress: number;
}

export function readingTime(
  { minutes, total }: { readonly minutes: readonly number[]; readonly total: number },
  activeIndex: number,
  fraction: number,
): ReadingTime {
  const into = Math.min(Math.max(fraction, 0), 1);
  if (total === 0) {
    const progress = activeIndex < 0 || minutes.length === 0 ? 0 : (activeIndex + into) / minutes.length;
    return { total, remaining: 0, progress };
  }
  const before = minutes.slice(0, Math.max(activeIndex, 0)).reduce((sum, value) => sum + value, 0);
  const current = activeIndex < 0 ? 0 : (minutes[activeIndex] ?? 0) * into;
  const introduction = activeIndex < 0 ? 0 : Math.max(0, total - minutes.reduce((sum, value) => sum + value, 0));
  const elapsed = introduction + before + current;
  return { total, remaining: total - elapsed, progress: elapsed / total };
}
