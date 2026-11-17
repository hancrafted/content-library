import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';

export interface SlideOutline {
  readonly slug: string;
}

// decision: FE-002 §2
export type SectionList<S extends SlideOutline = SlideOutline> = readonly [S, ...S[]] & {
  readonly sectionSlide?: false;
};

export function withoutSectionSlide<T extends readonly [SlideOutline, ...SlideOutline[]]>(
  section: T,
): T & { readonly sectionSlide: false } {
  return Object.assign([...section] as unknown as T, { sectionSlide: false as const });
}

// decision: FE-002 §4
export type SlideLevel = 'h2' | 'h3';

export interface PlacedListSlide<S> {
  readonly id: string;
  readonly slide: S;
  readonly section: string;
  readonly level: SlideLevel;
  readonly standsInFor?: S;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function checkedSlug(slug: string): string {
  if (!SLUG_RE.test(slug)) throw new Error(`Invalid slug "${slug}": use lowercase kebab-case.`);
  if (slug === TITLE_ANCHOR) throw new Error(`Invalid slug "${slug}": reserved for the Title slide.`);
  return slug;
}

export function placeSections<S extends SlideOutline>(
  sections: readonly SectionList<S>[],
): (readonly PlacedListSlide<S>[])[] {
  const placed = sections.map(placeList);
  assertUniqueSlideSlugs(placed.flat().map(({ slide }) => slide.slug));
  return placed;
}

function placeList<S extends SlideOutline>(list: SectionList<S>): PlacedListSlide<S>[] {
  const [head, ...pages] = list;
  const section = checkedSlug(head.slug);
  const pageSlide = (slide: S): PlacedListSlide<S> => ({
    id: `${section}--${checkedSlug(slide.slug)}`,
    slide,
    section,
    level: 'h3',
  });
  if (list.sectionSlide === false && pages.length > 0) {
    const [first, ...rest] = pages;
    return [{ id: section, slide: first, section, level: 'h2', standsInFor: head }, ...rest.map(pageSlide)];
  }
  return [{ id: section, slide: head, section, level: 'h2' }, ...pages.map(pageSlide)];
}

function assertUniqueSlideSlugs(slugs: readonly string[]): void {
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) {
      throw new Error(`Duplicate Slide slug "${slug}": Slide slugs must be unique across an Episode.`);
    }
    seen.add(slug);
  }
}

export function sectionOf<S extends SlideOutline>(sections: readonly SectionList<S>[], anchor: string): S | undefined {
  const placed = placeSections(sections).find((section) => section.some(({ id }) => id === anchor));
  return placed?.[0].standsInFor ?? placed?.[0].slide;
}
