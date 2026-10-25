import { z } from 'zod';

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

export const episodeSlidesSchema = z
  .object({
    episode: z.string().min(1).describe('The Episode slug'),
    slides: z
      .array(z.string().min(1).describe('A Slide slug, unique across every Episode and the Slide pool'))
      .describe("The Slides the Episode's Sections place, in page order; the Title slide is not one"),
  })
  .describe("One Episode's Slide list, which tells an Episode derived from another");

/** One Episode's Slide list: the Slides its Sections place, the Title slide not among them. */
export type SlideList = z.infer<typeof episodeSlidesSchema>;

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

/** What is wrong with one Episode's `canonicalEpisode`, or with its lack of one. */
function problemsOf(episode: CanonicalEpisode, episodes: readonly CanonicalEpisode[], lists: readonly SlideList[]) {
  const { slug, visibility, canonicalEpisode: named } = episode;
  if (visibility === 'public')
    return named === undefined ? [] : [`${slug}: only an unlisted Episode names a canonicalEpisode`];
  if (named !== undefined)
    return isCreditable(episodes.find((each) => each.slug === named))
      ? []
      : [`${slug}: canonicalEpisode must name a public Episode, and "${named}" is not one`];
  return originsOf(slug, episodes, lists).map(
    (origin) =>
      `${slug}: holds every Slide of the public Episode ${origin}, so it must name canonicalEpisode: ${origin}`,
  );
}

/** Every `canonicalEpisode` problem, one sentence each starting with the Episode's slug; empty when sound. */
export function canonicalEpisodeProblems(episodes: readonly CanonicalEpisode[], lists: readonly SlideList[]): string[] {
  return episodes.flatMap((episode) => problemsOf(episode, episodes, lists));
}
