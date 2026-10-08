/**
 * An Episode's spine: its Sections in page order, each listing its page Slides
 * by stable slug. Every Section also renders its own section slide, so a
 * Section without page Slides still has an anchor.
 */
export interface SectionOutline {
  readonly slug: string;
  readonly slides: readonly string[];
}

export type EpisodeOutline = readonly SectionOutline[];

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
 * Every slide anchor in page order: the order the table of contents lists and arrow keys
 * walk. Throws on a bad outline, so a broken Episode fails the static build.
 */
export function episodeAnchors(outline: EpisodeOutline): string[] {
  const anchors = outline.flatMap(({ slug, slides }) => [
    sectionAnchor(checkedSlug(slug)),
    ...slides.map((slide) => slideAnchor(slug, checkedSlug(slide))),
  ]);
  assertUnique(anchors);
  return anchors;
}
