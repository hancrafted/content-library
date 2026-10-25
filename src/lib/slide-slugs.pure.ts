import type { PinnedAnchor, SlideFolder } from './slide-folder-schema.pure';

/*
 * What global Slide slug uniqueness refuses at build (design-ADR 0016, Slide reuse rule 7), over every Slide folder in
 * every Episode's `slides/` and the Slide pool: a slug two Slides share, an instance under its origin's slug, and a
 * retired instance slug a Pinned anchor reserves. A Title slide is exempt: its anchor is `top`. The content store names
 * each problem as a refusal.
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

/** A retired instance slug stays its Episode's anchor, so no Slide takes it again. */
function retiredSlugs(slides: readonly SlideFolder[], pins: readonly PinnedAnchor[]): SlideFolderProblem[] {
  return slides
    .filter(({ title }) => !title)
    .flatMap(({ path, slug }) =>
      pins
        .filter((pin) => pin.slug === slug)
        .map(({ episode }) => ({
          record: slug,
          message: `${path} takes a retired instance slug: ${episode} pins it as an anchor, so it stays reserved`,
        })),
    );
}

/** Every slug problem among the Slide folders and the Pinned anchors, shared slugs first. */
export function slideFolderProblems(
  slides: readonly SlideFolder[],
  pins: readonly PinnedAnchor[],
): SlideFolderProblem[] {
  return [...sharedSlugs(slides), ...originSlugs(slides), ...retiredSlugs(slides, pins)];
}
