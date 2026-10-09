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

/**
 * An Episode's spine: a Section, by stable slug, listing its page Slides in
 * page order. Every Section also renders its own section slide, so a Section
 * without page Slides still has an anchor.
 */
export interface SectionOutline extends SlideOutline {
  readonly slides: readonly SlideOutline[];
}

/** One Slide record with the id its Slide wrapper carries. */
export interface PlacedSlide<T> {
  readonly id: string;
  readonly slide: T;
}

/** A section slide with its page Slides, each placed. */
export interface PlacedSection<S extends SectionOutline> extends PlacedSlide<S> {
  readonly slides: readonly PlacedSlide<S['slides'][number]>[];
}

/**
 * The DOM id of the Title slide, and the active-Slide value for "no hash": the
 * top of the page. Reserved, so no Section or Slide slug may be `top`.
 */
export function titleAnchor(): string {
  return TITLE_ANCHOR;
}

const TITLE_ANCHOR = 'top';

/** The DOM id of a Section's own slide. */
export function sectionAnchor(section: string): string {
  return section;
}

/** The DOM id of a page Slide inside a Section. */
export function slideAnchor(section: string, slide: string): string {
  return `${section}--${slide}`;
}

/** Lowercase kebab-case; a single hyphen only, since `--` joins section and slide. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function checkedSlug(slug: string): string {
  if (!SLUG_RE.test(slug)) throw new Error(`Invalid slug "${slug}": use lowercase kebab-case.`);
  if (slug === TITLE_ANCHOR) throw new Error(`Invalid slug "${slug}": reserved for the Title slide.`);
  return slug;
}

function assertUnique(anchors: readonly string[]): void {
  const seen = new Set<string>();
  for (const anchor of anchors) {
    if (seen.has(anchor)) throw new Error(`Duplicate slide anchor "${anchor}": slugs must be unique.`);
    seen.add(anchor);
  }
}

/**
 * DOM id of one element inside a Slide: `<slide anchor>--<element>`. Three
 * parts, so it cannot collide with a two-part page-slide anchor (FE-010).
 */
export function targetAnchor(slide: string, target: string): string {
  return `${slide}--${checkedSlug(target)}`;
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
      { id: sectionAnchor(section), slide: head, section, level: 'h2' as const },
      ...pages.map((slide) => ({
        id: slideAnchor(section, checkedSlug(slide.slug)),
        slide,
        section,
        level: 'h3' as const,
      })),
    ];
  });
  assertUniqueSlugs(placed.flat().map(({ slide }) => slide.slug));
  return placed;
}

function assertUniqueSlugs(slugs: readonly string[]): void {
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) {
      throw new Error(`Duplicate Slide slug "${slug}": Slide slugs must be unique across an Episode.`);
    }
    seen.add(slug);
  }
}

/**
 * Legacy walk over Section outlines (Episodes not yet converted to Section
 * lists). Delete with the last legacy Episode.
 *
 * The one walk over an Episode: each Section and its page Slides, in page
 * order, with the anchor each Slide wrapper carries. The slides, the table of
 * contents, the Context drawer and the Slide observer all read this list, so
 * no consumer derives an id of its own. Throws on a bad or duplicate slug, so
 * a broken Episode fails `next dev` and the static build alike.
 */
export function slidesOf<S extends SectionOutline>(sections: readonly S[]): PlacedSection<S>[] {
  const placed = sections.map((section) => ({
    id: sectionAnchor(checkedSlug(section.slug)),
    slide: section,
    slides: section.slides.map((slide) => ({ id: slideAnchor(section.slug, checkedSlug(slide.slug)), slide })),
  }));
  assertUnique(slidesInPageOrder(placed).map(({ id }) => id));
  return placed;
}

/** Placed Slides flattened in page order: the order the table of contents lists and arrow keys walk. */
export function slidesInPageOrder<S extends SectionOutline>(
  placed: readonly PlacedSection<S>[],
): PlacedSlide<S | S['slides'][number]>[] {
  return placed.flatMap((section) => [section, ...section.slides]);
}
