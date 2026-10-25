/*
 * The `canonicalEpisode` contract (design-ADR 0016, "Visibility, indexing and canonical"): it names a public Episode,
 * and an unlisted Episode derived from a public one must name it, so search credits the one public page.
 *
 * Detection, `decided-for-Han (test run)`: an unlisted Episode is derived from a public one when its Slide list holds
 * every Slide of that public Episode. Slide slugs are unique across every Episode and the Slide pool, so a slug names
 * one Slide; duplicating an Episode references the original's Slides, never copies them.
 */

/** The Episode fields the check reads. */
export interface CanonicalEpisode {
  readonly slug: string;
  readonly type: 'standard' | 'event-frame';
  readonly visibility: 'public' | 'unlisted';
  readonly status: 'published' | 'upcoming';
  readonly canonicalEpisode?: string;
}

/** One Episode's Slide list: the Slides its Sections place, the Title slide not among them. */
export interface SlideList {
  readonly episode: string;
  readonly slides: readonly string[];
}

/** A public Episode another may credit: listed, standard, and published, so its page exists. */
function isCreditable(episode: CanonicalEpisode | undefined): boolean {
  return episode?.visibility === 'public' && episode.type === 'standard' && episode.status === 'published';
}

/** The public Episodes whose every Slide the unlisted one holds; a public Episode with no Slide is no original. */
function originsOf(slug: string, episodes: readonly CanonicalEpisode[], lists: readonly SlideList[]): string[] {
  const held = new Set(lists.find(({ episode }) => episode === slug)?.slides ?? []);
  return episodes
    .filter(isCreditable)
    .filter((original) => {
      const slides = lists.find(({ episode }) => episode === original.slug)?.slides ?? [];
      return slides.length > 0 && slides.every((each) => held.has(each));
    })
    .map(({ slug: original }) => original);
}

/** Every `canonicalEpisode` problem, one sentence each starting with the Episode's slug; empty when sound. */
export function canonicalEpisodeProblems(episodes: readonly CanonicalEpisode[], lists: readonly SlideList[]): string[] {
  const bySlug = (slug: string) => episodes.find((episode) => episode.slug === slug);
  return episodes
    .filter(({ visibility }) => visibility === 'unlisted')
    .flatMap(({ slug, canonicalEpisode }) => {
      if (canonicalEpisode !== undefined)
        return isCreditable(bySlug(canonicalEpisode))
          ? []
          : [`${slug}: canonicalEpisode must name a public Episode, and "${canonicalEpisode}" is not one`];
      return originsOf(slug, episodes, lists).map(
        (origin) =>
          `${slug}: holds every Slide of the public Episode ${origin}, so it is derived from it and must name canonicalEpisode: ${origin}`,
      );
    });
}
