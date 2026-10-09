/** The least a Slide record carries to be placed: its stable slug. */
export interface SlideOutline {
  readonly slug: string;
}

/**
 * A Section as an Episode record lists it: an ordered list of Slides whose
 * first is the section slide. Its slug is the Section's slug and its title
 * names the Section (FE-002).
 */
export type SectionList<S extends SlideOutline = SlideOutline> = readonly [S, ...S[]];

/** Heading level by position (FE-002 §4): `h2` for a section slide, `h3` for a page Slide. */
export type SlideLevel = 'h2' | 'h3';

/** One Slide of a Section list, placed: its wrapper id, its Section's slug and its heading level. */
export interface PlacedListSlide<S> extends PlacedSlide<S> {
  readonly section: string;
  readonly level: SlideLevel;
}

/** One Slide record with the id its Slide wrapper carries. */
export interface PlacedSlide<T> {
  readonly id: string;
  readonly slide: T;
}

/** A section slide with its page Slides, each placed. */
export interface PlacedSection<S extends { readonly slides: readonly unknown[] }> extends PlacedSlide<S> {
  readonly slides: readonly PlacedSlide<S['slides'][number]>[];
}

/**
 * The DOM id of the Title slide, and the active-Slide value for "no hash": the
 * top of the page. Reserved, so no Section or Slide slug may be `top`.
 */
export const TITLE_ANCHOR = 'top';

/** Lowercase kebab-case; a single hyphen only, since `--` joins section and slide. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function checkedSlug(slug: string): string {
  if (!SLUG_RE.test(slug)) throw new Error(`Invalid slug "${slug}": use lowercase kebab-case.`);
  if (slug === TITLE_ANCHOR) throw new Error(`Invalid slug "${slug}": reserved for the Title slide.`);
  return slug;
}

/**
 * The one walk over an Episode record (FE-002): each Section list, in page
 * order, with the anchor and heading level each Slide gets from its position.
 * The first Slide names its Section (`<section>`); every other one is joined
 * under it (`<section>--<slide>`), so a Slide only knows its own slug. Slide
 * slugs are unique across the whole Episode, because Translation keys are flat
 * by Slide slug. Throws on a bad or duplicate slug, so a broken Episode fails
 * `next dev` and the static build alike.
 */
export function placeSections<S extends SlideOutline>(
  sections: readonly SectionList<S>[],
): (readonly PlacedListSlide<S>[])[] {
  const placed = sections.map(([head, ...pages]) => {
    const section = checkedSlug(head.slug);
    return [
      { id: section, slide: head, section, level: 'h2' as const },
      ...pages.map((slide) => ({
        id: `${section}--${checkedSlug(slide.slug)}`,
        slide,
        section,
        level: 'h3' as const,
      })),
    ];
  });
  assertUniqueSlideSlugs(placed.flat().map(({ slide }) => slide.slug));
  return placed;
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

/** Placed Slides flattened in page order: the order the table of contents lists and arrow keys walk. */
export function slidesInPageOrder<S extends { readonly slides: readonly unknown[] }>(
  placed: readonly PlacedSection<S>[],
): PlacedSlide<S | S['slides'][number]>[] {
  return placed.flatMap((section) => [section, ...section.slides]);
}
