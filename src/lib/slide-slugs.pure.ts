import type { SlideFolder } from './slide-folder-schema.pure';

/*
 * What global Slide slug uniqueness refuses at build (design-ADR 0016, Slide reuse rule 7), over every Slide folder in
 * every Episode's `slides/` and the Slide pool: a slug two Slides share, and an instance under its origin's slug. A
 * Title slide is exempt: its anchor is `top`. The content store names each problem as a refusal.
 */

/** One problem: the Slide slug it concerns and one sentence on what is wrong. */
export interface SlideFolderProblem {
  readonly record: string;
  readonly message: string;
}

function duplicates(items: readonly string[]): string[] {
  return [...new Set(items.filter((item, at) => items.indexOf(item) !== at))];
}

/** A reused Slide keeps its slug and anchor wherever it is placed, so no two Slides share one. */
function sharedSlugs(slides: readonly SlideFolder[]): SlideFolderProblem[] {
  const placed = slides.filter(({ title }) => !title);
  return duplicates(placed.map(({ slug }) => slug)).map((slug) => ({
    record: slug,
    message: `the slug is used by more than one Slide: ${placed
      .filter((each) => each.slug === slug)
      .map(({ path }) => path)
      .join(', ')}`,
  }));
}

/** An instance takes a slug of its own at the copy, never its origin's, so its anchor is its own. */
function originSlugs(slides: readonly SlideFolder[]): SlideFolderProblem[] {
  return slides
    .filter(({ slug, copiedFrom }) => copiedFrom === slug)
    .map(({ path, slug }) => ({
      record: slug,
      message: `${path} is an instance of "${slug}" under its origin's slug: an instance takes a slug of its own`,
    }));
}

/** Every slug problem among the Slide folders, shared slugs first. */
export function slideFolderProblems(slides: readonly SlideFolder[]): SlideFolderProblem[] {
  return [...sharedSlugs(slides), ...originSlugs(slides)];
}
